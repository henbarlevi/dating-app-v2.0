//======imports
import * as fs from 'fs';
import * as Rx from 'rxjs';
import * as request from 'request';
import * as jwt from 'jsonwebtoken'; //jwt authentication
import * as socketIo from 'socket.io';
import * as uuid from 'uuid/v1'; //generate guid
//======db
import { UserRepository } from '../db/repository/user-rep';

//====== services
import { GameRoomManager } from "./gameRoomManager";
//====== models
import { GAME_STATUS } from './GAME_STATUS_ENUM';
import { iUser } from '../models';
import { iFacebookCredentials } from '../facebook/models/iFacebookCredentials.model'
import { iFacebookUserInfo } from '../facebook/models/index';
import { iGameRoom } from './models/iGameRoom';
import { GAME_SOCKET_EVENTS } from './models/GAME_SOCKET_EVENTS';
import { iGameSocket } from './models/iGameSocket';
//====== config
import * as config from 'config';
const ENV: string = process.env.ENV || 'local';
const envConfig: any = config.get(ENV);
//=======utils
import { Logger } from '../utils/Logger';
import { game$, game$Event } from './game$.service';
const TAG: string = 'GameSocketsManager |';

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
    }
    /**handle socket's connections */
    handleNewConnections() {
        //handle connections //TODO - check how dispose correctly
        game$
            //check its a new conneciton event (connection + no roomId exist on the conneciton query params):
            .filter((gameEvent: game$Event) =>
                gameEvent.eventName === GAME_SOCKET_EVENTS.connection
               // && gameEvent.socket.handshake.query.roomId
            )
            //handle new connection
            .subscribe((gameEvent: game$Event) => {
                let socket: iGameSocket = gameEvent.socket;
                Logger.d(TAG, `** Handle New Connection **`, 'gray');
                this.printCurrentState(socket);
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
                    // ==== MOVED TO gameroomManager
                    // //insert the 2 players into the room
                    // socket.join(gameRoom.roomId);
                    // partner.join(gameRoom.roomId);
                    // //tell 2 players that match is found
                    // this.io.to(gameRoom.roomId).emit(GAME_SOCKET_EVENTS.found_partner, { roomId: gameRoom.roomId });
                    //send the gameroom to the GameRoom manager to handle the game:
                    // ==== MOVED TO gameroomManager

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
                let disconnectingUserID = gameEvent.socket.user._id;
                //remove socket from waiting list if its there
                this.waitingList[disconnectingUserID] ? Logger.d(TAG, `** removing ${disconnectingUserID} from [waiting list].. `, 'cyan') : '';
                this.waitingList[disconnectingUserID] = null;
                //remove socket from playersPlaying if its there
                this.playersPlaying[disconnectingUserID] ? Logger.d(TAG, `** removing ${disconnectingUserID} from [PlayersPlaying] list.. `, 'cyan') : '';
                this.playersPlaying[disconnectingUserID] = null
            })
    }
    private userIsAlreadyConnected(socket: iGameSocket) {
        //TODO
    }
    private printCurrentState(socket) {
        Logger.d(TAG, '========== Socket Details =========', 'yellow');
        console.log('socket id =' + socket.id);
        Logger.d(TAG, `Before handling this socket there are: \n[watingList =${Object.keys(this.waitingList).length} Sockets]\n[gameRooms = ${Object.keys(this.gameRooms).length}]`)
        Logger.d(TAG, '========== Socket Details =========', 'yellow');
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

}



