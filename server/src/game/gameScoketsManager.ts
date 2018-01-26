//======imports
import * as fs from 'fs';
import * as Rx from 'rxjs';
import * as request from 'request';
import * as jwt from 'jsonwebtoken'; //jwt authentication
import * as socketIo from 'socket.io';
import * as uuid from 'uuid/v1'; //generate guid
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/timer';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/first';
//======db
import { UserRepository } from '../db/repository/user-rep';
//====== services
import { GameRoomManager } from "./gameRoomManager";
import { game$, game$Event } from './game$.service';
//====== models
import { GAME_STATUS } from './GAME_STATUS_ENUM';
import { iUser } from '../models';
import { iFacebookCredentials } from '../facebook/models/iFacebookCredentials.model'
import { iFacebookUserInfo } from '../facebook/models/index';
import { iGameRoom } from './models/iGameRoom';
import { GAME_SOCKET_EVENTS } from './models/GAME_SOCKET_EVENTS';
import { iGameSocket } from './models/iGameSocket';
//=======utils
import { Logger } from '../utils/Logger';
const TAG: string = 'GameSocketsManager |';
// =========================
// ====== ENV Configutations
// =========================
import * as config from 'config';
const ENV: string = process.env.ENV || 'local';
const envConfig: any = config.get(ENV);
const reconnection_timeout: number = envConfig.game.reconnection_timeout //time to reconnect if a player is inside a game



/**handle game sockets
 * after user connected:
 * 1.emit for user 'searching For partner' - if not found push socket to waiting list
 * 2.after found partner - emit to 2 players 'found partner'
 * 3.Generate game room for the 2 players and join 2 socket to generated room
 * 4.send the gameRoom to gameRoom manager to handle the game
 */
export class GameScoketsManager {
    //sockets groups
    private waitingList: { [userId: string]: iGameSocket } = {}; //waiting for partner to play
    private gameRooms: { [roomId: string]: iGameRoom } = {};//gameRooms - Object {key:roomId,value:iGameRoom}
    private playersPlaying: { [userId: string]:/*roomId*/string } = {};// userId:RoomId he is playing
    /**
     *
     */
    constructor(private io: SocketIO.Namespace) {

        //TODO - handle subcriptions Observables
    }
    run() {
        this.handleDisconnections();/**handle socket's disconnection */
        this.handleNewConnections();/**handle socket's connections */
        this.handlePlayersLeavingGame();
    }
    /**handle socket's new connections */
    handleNewConnections() {
        //handle connections //TODO - check how dispose correctly
        game$
            //check its a new conneciton event (connection + no roomId exist on the conneciton query params):
            .filter((gameEvent: game$Event) =>
                gameEvent.eventName === GAME_SOCKET_EVENTS.connection &&
                // && gameEvent.socket.handshake.query.roomId
                !this.playersPlaying[gameEvent.socket.user._id]//if its a temporary disconnected its not a new connection (temp disconnections handle by the related gameroom) 
            )
            //handle new connection
            .subscribe((gameEvent: game$Event) => {
                let socket: iGameSocket = gameEvent.socket;
                this.printCurrentState(socket);
                Logger.d(TAG, `** Handle New Connection **`, 'gray');
                socket.emit(GAME_SOCKET_EVENTS.searchForPartner);
                let partner: iGameSocket = this.searchForPartner(socket);
                if (!partner) {
                    Logger.d(TAG, `**inserting ${socket.user.facebook ? socket.user.facebook.name : ''} to waiting list**`, 'yellow');
                    this.waitingList[socket.user._id] = socket;
                } else { //if there is partner available
                    //generate game room
                    let gameRoom: iGameRoom = this.generateGameRoom([socket, partner]);
                    //insert them to players playing list
                    this.playersPlaying[socket.user._id] = gameRoom.roomId;
                    this.playersPlaying[partner.user._id] = gameRoom.roomId;
                    //insert to each socket the gameroomId:
                    gameRoom.players.forEach(socket => {
                        socket.gameRoomId = gameRoom.roomId;
                    })


                    //generate new Handler to handle the room
                    let gameRoomManager = new GameRoomManager(this.io, gameRoom);
                    gameRoomManager.handle();
                    //if one of the players disconnected, tell the other user about it - TODO fix this
                    this.io.to(gameRoom.roomId).on('disconnect', (socket: iGameSocket) => {
                        socket.broadcast.to(gameRoom.roomId).emit(GAME_SOCKET_EVENTS.partner_disconnected);
                    });

                    this.gameRooms[gameRoom.roomId] = gameRoom;

                }
            })
    }
    /**handle reconnection */
    handleReconnection(socket: iGameSocket) {

    }
    /**handle socket's disconnection */
    handleDisconnections() {
        //handle disconnections //TODO - check how dispose correctly
        game$.filter((gameEvent: game$Event) => gameEvent.eventName === GAME_SOCKET_EVENTS.disconnect)
            .subscribe((gameEvent: game$Event) => {
                Logger.d(TAG, `** Handle Disconnection For ${this.getUserNameBySocket(gameEvent.socket)}`, 'gray');

                this.handleDisconnectionEvent(gameEvent);
            })
    }
    handlePlayersLeavingGame() {
        game$.filter((gameEvent: game$Event) => gameEvent.eventName === GAME_SOCKET_EVENTS.leave_game)
            .subscribe((gameEvent: game$Event) => {
                let userId: string = gameEvent.socket.user._id;
                if (this.playersPlaying[userId]) {
                    delete this.playersPlaying[userId];
                } else {
                    Logger.d(TAG, `WARNING - user ${gameEvent.socket.user.facebook ? gameEvent.socket.user.facebook.name : gameEvent.socket.user._id} is 'leaving game' even he is not from the [PlayersPlaying] list.. `, 'yellow');
                }
            })
    }

    /**search partner for socket */
    searchForPartner(socket: iGameSocket): iGameSocket {
        let usersId: string[] = Object.keys(this.waitingList);
        if (usersId.length === 0) {
            return null;
        }
        else {
            //currently just get any random player available
            //TODO - change the search mechanism
            let firstUserId = usersId[0];
            let partner: iGameSocket = this.waitingList[firstUserId];
            return partner;

        }
    }
    generateGameRoom(players: iGameSocket[]): iGameRoom {
        let roomId: string = uuid();
        //generate gameRoom :
        let gameRoom: iGameRoom = {
            roomId: roomId,
            miniGamesRemaining: 3,
            players: players
        }
        return gameRoom;
    }
    // =========================
    // ====== Private Methods
    // =========================

    /**[handle indevidual disconnection event]
     * 
     * General Flow
     * 1. remove user from  waitingList (if he's there)
     * 2. if user was inside a game (= inside playersPlaying List) - will let user 20 sec to reconnect
     *  a.if reconnected on time - check if game is still going
     *       - if so - let the gameRoom handle the reconnection 
     *       - if not - tell the user the game ended +( disconnect him /treat him like a new connection hadnling (didnt decided yet))
     *  b.if not - remove him from playersPlaying List
     */
    private handleDisconnectionEvent(gameEvent: game$Event) {
        let disconnectingUserID = gameEvent.socket.user._id.toString();
        let disconnectUserSocket = gameEvent.socket;
        let disconnectedFromRoomId: string = gameEvent.socket.gameRoomId;
        //remove socket from waiting list if its there
        this.waitingList[disconnectingUserID] ? Logger.d(TAG, `** removing ${this.getUserNameBySocket(disconnectUserSocket)} from [waiting list].. **`, 'gray') : '';
        delete this.waitingList[disconnectingUserID];
        //if disconnected player is inside a game
        if (this.playersPlaying[disconnectingUserID]) {
            //insert him to temporary disconnected list (give him change to recoonnect)
            Logger.d(TAG, `** give ${this.getUserNameBySocket(disconnectUserSocket)} 20 sec cahnce   to reconnect.. **`, 'gray')
            //check if player reconnect on time:
            const reconnected$ = game$.filter((gameEv: game$Event) =>
                //check a socket connected and its the disconnected player from this room
                gameEv.eventName === GAME_SOCKET_EVENTS.connection &&
                (disconnectedFromRoomId === gameEv.socket.gameRoomId || disconnectedFromRoomId === gameEv.socket.handshake.query.roomId) &&
                gameEv.socket.user._id.toString() === disconnectingUserID);
            const timeOut$ = Observable.timer(reconnection_timeout);
            Observable.merge(reconnected$, timeOut$).first().subscribe(
                (gameEventOrTimeout: any) => {
                    //reconnected on time:
                    if (gameEventOrTimeout.eventName) {
                        Logger.d(TAG, `User [${this.getUserNameBySocket(disconnectUserSocket)}] returned to Game (gameroom ${disconnectedFromRoomId})  **`, 'gray')

                        let gameEvent: game$Event = gameEventOrTimeout;
                        //check if game is still going
                        if (this.gameRooms[disconnectedFromRoomId]) {
                            //
                        } else {
                            //TODO tell the reconnected user that game ended
                            //disconnect user
                            gameEvent.socket.disconnect();
                        }
                        //reconnection timeout
                    } else {//timeout //TODOTODOTOD - think how to handle the reconnection issue + who will handle the list of players that can reconnect
                        Logger.d(TAG, `reconnection chance for ${this.getUserNameBySocket(disconnectUserSocket)} passed **  removing him from [playersPlaying] list **`, 'gray')
                        delete this.playersPlaying[disconnectingUserID];
                    }
                }
            )


        }
    }
    private userIsAlreadyConnected(socket: iGameSocket) {
        //TODO
    }
    private getUserNameBySocket(socket: iGameSocket) { //return userName or userId
        return socket.user.facebook ? socket.user.facebook.name : socket.user._id
    }
    private printCurrentState(socket) {
        Logger.d(TAG, '========== Socket Details =========', 'yellow');
        console.log('socket id =' + socket.id);
        Logger.d(TAG, `Before handling this socket there are: \n[watingList =${Object.keys(this.waitingList).length} Sockets]\n[gameRooms = ${Object.keys(this.gameRooms).length}]`)
        Logger.d(TAG, '========== Socket Details =========', 'yellow');
    }

}



