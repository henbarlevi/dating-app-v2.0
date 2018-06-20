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
import { iFacebookCredentials } from '../facebook/models/iFacebookCredentials.model'
import { iFacebookUserInfo } from '../facebook/models/index';
import { iGameRoom } from './models/iGameRoom';
import { GAME_SOCKET_EVENTS } from './models/GAME_SOCKET_EVENTS.enum';
import { iGameSocket, getUserNameBySocket } from './models/iGameSocket';
//=======utils
import { Logger } from '../utils/Logger';
const TAG: string = 'GameSocketsManager |';
// =========================
// ====== ENV Configutations
// =========================
import * as config from 'config';
import { GAMEROOM_EVENT } from './models/GAMEROOM_EVENTS';
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
    private gameRooms: { [roomId: string]: iGameRoom } = {};//live gameRooms - Object {key:roomId,value:iGameRoom}
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
        this.handleEndedGames()/**when gameroom emit 'game_ended' */
        this.handlePlayersLeavingGame();
    }
    /**handle socket's new connections */
    handleNewConnections() {
        //handle connections //TODO - check how dispose correctly
        game$
            //check its a new conneciton event (connection + the user is NOT temporary disconnected user):
            .filter((gameEvent: game$Event) => {
                if (gameEvent.eventName !== GAME_SOCKET_EVENTS.connection) { return false; }//pass only connection events
                const userId: string = gameEvent.socket.user._id.toString();
                const temporaryDisconnected: boolean = this.playersPlaying[userId] ? true : false;//reconnection chance time for that player didint pass
                const gameRoomIdUserTryingToReconnect: string = this.playersPlaying[userId];
                const gameStillLive: boolean = this.gameRooms[gameRoomIdUserTryingToReconnect] ? true : false;
                const treatSocketAsNewConnection: boolean = !(temporaryDisconnected && gameStillLive);
                Logger.d(TAG, `** is new Connection : ${treatSocketAsNewConnection} **`, 'gray');
                return treatSocketAsNewConnection//if the user trying to reconnect and game is still on - its no new connection and this reconnection will be handled by the related gameroom
            })
            //handle new connection
            .subscribe((gameEvent: game$Event) => {
                const playerSocket: iGameSocket = gameEvent.socket;
                const userId:string = playerSocket.user._id.toString();
                this.printCurrentState(playerSocket);
                Logger.d(TAG, `** Handle New Connection **`, 'gray');
                playerSocket.emit(GAME_SOCKET_EVENTS.searchForPartner);
                let partnerSocket: iGameSocket = this.searchForPartner(playerSocket);
                if (!partnerSocket) {//not found partner
                    Logger.d(TAG, `**inserting ${getUserNameBySocket(playerSocket)} to waiting list**`, 'green');
                    this.waitingList[userId] = playerSocket;
                } else { //if there is partner available
                    //remove partner from waiting list
                    const partnerId:string = partnerSocket.user._id.toString();
                    delete this.waitingList[partnerId];
                    //generate game room
                    let gameRoom: iGameRoom = this.generateGameRoom([playerSocket, partnerSocket]);
                    this.printGameroomDetails(gameRoom);
                    //insert them to players playing list
                    this.playersPlaying[userId] = gameRoom.roomId;
                    this.playersPlaying[partnerId] = gameRoom.roomId;
                    //generate new Handler to handle the room
                    let gameRoomManager = new GameRoomManager(this.io, gameRoom);
                    gameRoomManager.handle();
                    //insert to gamerooms arr
                    this.gameRooms[gameRoom.roomId] = gameRoom;

                }
            })
    }


    /**
     * 'leaving game' is seprated from 'disconnection' because disconnection can be temporarly and the user can come back to the game
     * when 'leave game' the user removed from his game session permenantly
     */
    handlePlayersLeavingGame() {
        game$.filter((gameEvent: game$Event) => gameEvent.eventName === GAME_SOCKET_EVENTS.leave_game)
            .subscribe((gameEvent: game$Event) => {
                let userId: string = gameEvent.socket.user._id;
                if (this.playersPlaying[userId]) {
                    delete this.playersPlaying[userId];
                } else {
                    Logger.d(TAG, `WARNING - user ${getUserNameBySocket(gameEvent.socket)} is 'leaving game' even he is not from the [PlayersPlaying] list.. `, 'yellow');
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
            players: players
        }
        return gameRoom;
    }
    /**handle socket's disconnection */
    handleDisconnections() {
        //handle disconnections //TODO - check how dispose correctly
        game$.filter((gameEvent: game$Event) => gameEvent.eventName === GAME_SOCKET_EVENTS.disconnect)
            .subscribe((gameEvent: game$Event) => {
                Logger.d(TAG, `** Handle Disconnection For ${getUserNameBySocket(gameEvent.socket)}`, 'gray');

                this.handleDisconnectionEvent(gameEvent);
            })
    }
    // =========================
    // ====== Private Methods
    // =========================

    /**[handle indevidual disconnection event]
     * 
     * General Flow
     * 1. remove user from  waitingList (if he's there)
     * 2. disconnection of players inside a game will be handled by the gameroom until the reconnection time passed.
     */
    private handleDisconnectionEvent(gameEvent: game$Event) {
        let disconnectingUserID = gameEvent.socket.user._id.toString();
        let disconnectUserSocket:iGameSocket = gameEvent.socket;
        //remove socket from waiting list if its there
        this.waitingList[disconnectingUserID] ? Logger.d(TAG, `** removing ${getUserNameBySocket(disconnectUserSocket)} from [waiting list].. **`, 'gray') : '';
        delete this.waitingList[disconnectingUserID];

    }
    /**
     * @description handle ended games
     */
    private handleEndedGames() {
        //gamerooms will emit game_ended and when it occur
        game$.filter((gameEvent: game$Event) => gameEvent.eventName === GAMEROOM_EVENT.gameroom_session_ended)
            .subscribe((gameEvent: game$Event) => {
                Logger.d(TAG, `** Handle Game Session Ended - GameRoom [${gameEvent.eventData.roomId}]`, 'gray');

                this.handleGameEnded(gameEvent);
            })
    }
    /**
     * @param gameEvent - game_ended gamroom event
     */
    handleGameEnded(gameEvent: game$Event): any {
        const gameroomId: string = gameEvent.eventData.roomId;
        //delete that gameroom
        delete this.gameRooms[gameroomId];
        //delete all players from playersPlaying List
        const playersId: string[] = gameEvent.eventData.playersId
        playersId.forEach(pId => {
            delete this.playersPlaying[pId];
            Logger.d(TAG, `** deleted [${pId}] from playersPlaying, playersPlaying left[${Object.keys(this.playersPlaying).length}] `, 'gray');
        })
        Logger.d(TAG,`Gamerooms Remaining :${Object.keys(this.gameRooms).length}`);
        //TODO - make sure playersPlaying is updated
    }
    private userIsAlreadyConnected(socket: iGameSocket) {
        //TODO
    }

    private printCurrentState(socket :iGameSocket) {
        Logger.mt(TAG, ' Socket Details ', 'yellow')
        .d(TAG,`socket id [${socket.id}] ,rooms:[${Object.keys(socket.rooms)}]`)
        .d(TAG, `Before handling this socket there are: `,'gray')
        .d(TAG,`[watingList]:[${Object.keys(this.waitingList).length}]`,'gray')
        .d(TAG,`[gameRooms]:[${Object.keys(this.gameRooms).length}]`,'gray')
        .mt(TAG, ' Socket Details ', 'yellow');
    }
    private printGameroomDetails(gameroom: iGameRoom) {

          Logger.st(TAG, `**Generating  New gameroom**`, 'gray')
          .d(TAG, `gameroomId:${gameroom.roomId}`, 'gray')
          .d(TAG, `players:${gameroom.players.map(p=>getUserNameBySocket(p))}`, 'gray');

        
    }
}



