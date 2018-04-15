"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid = require("uuid/v1"); //generate guid
require("rxjs/add/observable/timer");
require("rxjs/add/observable/merge");
require("rxjs/add/operator/first");
//====== services
const gameRoomManager_1 = require("./gameRoomManager");
const game__service_1 = require("./game$.service");
const GAME_SOCKET_EVENTS_1 = require("./models/GAME_SOCKET_EVENTS");
//=======utils
const Logger_1 = require("../utils/Logger");
const TAG = 'GameSocketsManager |';
// =========================
// ====== ENV Configutations
// =========================
const config = require("config");
const GAMEROOM_EVENTS_1 = require("./models/GAMEROOM_EVENTS");
const ENV = process.env.ENV || 'local';
const envConfig = config.get(ENV);
const reconnection_timeout = envConfig.game.reconnection_timeout; //time to reconnect if a player is inside a game
/**handle game sockets
 * after user connected:
 * 1.emit for user 'searching For partner' - if not found push socket to waiting list
 * 2.after found partner - emit to 2 players 'found partner'
 * 3.Generate game room for the 2 players and join 2 socket to generated room
 * 4.send the gameRoom to gameRoom manager to handle the game
 */
class GameScoketsManager {
    /**
     *
     */
    constructor(io) {
        this.io = io;
        //sockets groups
        this.waitingList = {}; //waiting for partner to play
        this.gameRooms = {}; //live gameRooms - Object {key:roomId,value:iGameRoom}
        this.playersPlaying = {}; // userId:RoomId he is playing
        //TODO - handle subcriptions Observables
    }
    run() {
        this.handleDisconnections(); /**handle socket's disconnection */
        this.handleNewConnections(); /**handle socket's connections */
        this.handleEndedGames(); /**when gameroom emit 'game_ended' */
        this.handlePlayersLeavingGame();
    }
    /**handle socket's new connections */
    handleNewConnections() {
        //handle connections //TODO - check how dispose correctly
        game__service_1.game$
            .filter((gameEvent) => {
            if (gameEvent.eventName !== GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.connection) {
                return false;
            } //pass only connection events
            const userId = gameEvent.socket.user._id.toString();
            const temporaryDisconnected = this.playersPlaying[userId] ? true : false; //reconnection chance time for that player didint pass
            const gameRoomIdUserTryingToReconnect = this.playersPlaying[userId];
            const gameStillLive = this.gameRooms[gameRoomIdUserTryingToReconnect] ? true : false;
            const treatSocketAsNewConnection = !(temporaryDisconnected && gameStillLive);
            Logger_1.Logger.d(TAG, `** is new Connection : ${treatSocketAsNewConnection} **`, 'gray');
            return treatSocketAsNewConnection; //if the user trying to reconnect and game is still on - its no new connection and this reconnection will be handled by the related gameroom
        })
            .subscribe((gameEvent) => {
            let socket = gameEvent.socket;
            this.printCurrentState(socket);
            Logger_1.Logger.d(TAG, `** Handle New Connection **`, 'gray');
            socket.emit(GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.searchForPartner);
            let partner = this.searchForPartner(socket);
            if (!partner) {
                Logger_1.Logger.d(TAG, `**inserting ${socket.user.facebook ? socket.user.facebook.name : ''} to waiting list**`, 'yellow');
                this.waitingList[socket.user._id] = socket;
            }
            else {
                //generate game room
                let gameRoom = this.generateGameRoom([socket, partner]);
                //insert them to players playing list
                this.playersPlaying[socket.user._id] = gameRoom.roomId;
                this.playersPlaying[partner.user._id] = gameRoom.roomId;
                //generate new Handler to handle the room
                let gameRoomManager = new gameRoomManager_1.GameRoomManager(this.io, gameRoom);
                gameRoomManager.handle();
                //if one of the players disconnected, tell the other user about it - TODO fix this
                this.io.to(gameRoom.roomId).on('disconnect', (socket) => {
                    socket.broadcast.to(gameRoom.roomId).emit(GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.partner_disconnected);
                });
                this.gameRooms[gameRoom.roomId] = gameRoom;
            }
        });
    }
    /**
     * 'leaving game' is seprated from 'disconnection' because disconnection can be temporarly and the user can come back to the game
     * when 'leave game' the user removed from his game session permenantly
     */
    handlePlayersLeavingGame() {
        game__service_1.game$.filter((gameEvent) => gameEvent.eventName === GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.leave_game)
            .subscribe((gameEvent) => {
            let userId = gameEvent.socket.user._id;
            if (this.playersPlaying[userId]) {
                delete this.playersPlaying[userId];
            }
            else {
                Logger_1.Logger.d(TAG, `WARNING - user ${gameEvent.socket.user.facebook ? gameEvent.socket.user.facebook.name : gameEvent.socket.user._id} is 'leaving game' even he is not from the [PlayersPlaying] list.. `, 'yellow');
            }
        });
    }
    /**search partner for socket */
    searchForPartner(socket) {
        let usersId = Object.keys(this.waitingList);
        if (usersId.length === 0) {
            return null;
        }
        else {
            //currently just get any random player available
            //TODO - change the search mechanism
            let firstUserId = usersId[0];
            let partner = this.waitingList[firstUserId];
            return partner;
        }
    }
    generateGameRoom(players) {
        let roomId = uuid();
        //generate gameRoom :
        let gameRoom = {
            roomId: roomId,
            miniGamesRemaining: 3,
            players: players
        };
        return gameRoom;
    }
    /**handle socket's disconnection */
    handleDisconnections() {
        //handle disconnections //TODO - check how dispose correctly
        game__service_1.game$.filter((gameEvent) => gameEvent.eventName === GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.disconnect)
            .subscribe((gameEvent) => {
            Logger_1.Logger.d(TAG, `** Handle Disconnection For ${this.getUserNameBySocket(gameEvent.socket)}`, 'gray');
            this.handleDisconnectionEvent(gameEvent);
        });
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
    handleDisconnectionEvent(gameEvent) {
        let disconnectingUserID = gameEvent.socket.user._id.toString();
        let disconnectUserSocket = gameEvent.socket;
        let disconnectedFromRoomId = gameEvent.socket.gameRoomId;
        //remove socket from waiting list if its there
        this.waitingList[disconnectingUserID] ? Logger_1.Logger.d(TAG, `** removing ${this.getUserNameBySocket(disconnectUserSocket)} from [waiting list].. **`, 'gray') : '';
        delete this.waitingList[disconnectingUserID];
        //if disconnected player is inside a game
        // if (this.playersPlaying[disconnectingUserID]) {
        //     //insert him to temporary disconnected list (give him change to recoonnect)
        //     //check if player reconnect on time:
        //     const reconnected$ = game$.filter((gameEv: game$Event) =>
        //         //check a socket connected and its the disconnected player from this room
        //         gameEv.eventName === GAME_SOCKET_EVENTS.connection &&
        //         (disconnectedFromRoomId === gameEv.socket.gameRoomId || disconnectedFromRoomId === gameEv.socket.handshake.query.roomId) &&
        //         gameEv.socket.user._id.toString() === disconnectingUserID);
        //     const timeOut$ = Observable.timer(reconnection_timeout);
        //     Observable.merge(reconnected$, timeOut$).first().subscribe(
        //         (gameEventOrTimeout: any) => {
        //             //reconnected on time:
        //             if (gameEventOrTimeout.eventName) {
        //                 Logger.d(TAG, `User [${this.getUserNameBySocket(disconnectUserSocket)}] returned to Game (gameroom ${disconnectedFromRoomId})  **`, 'gray')
        //                 let gameEvent: game$Event = gameEventOrTimeout;
        //                 //check if game is still going
        //                 if (this.gameRooms[disconnectedFromRoomId]) {
        //                     //
        //                 } else {
        //                     //TODO tell the reconnected user that game ended
        //                     //disconnect user
        //                     gameEvent.socket.disconnect();
        //                 }
        //                 //reconnection timeout
        //             } else {//timeout //TODOTODOTOD - think how to handle the reconnection issue + who will handle the list of players that can reconnect
        //                 Logger.d(TAG, `reconnection chance for ${this.getUserNameBySocket(disconnectUserSocket)} passed **  removing him from [playersPlaying] list **`, 'gray')
        //                 delete this.playersPlaying[disconnectingUserID];
        //             }
        //         }
        //     )
        // }
    }
    /**
     * @description handle ended games
     */
    handleEndedGames() {
        //gamerooms will emit game_ended and when it occur
        game__service_1.game$.filter((gameEvent) => gameEvent.eventName === GAMEROOM_EVENTS_1.GAMEROOM_EVENT.game_ended)
            .subscribe((gameEvent) => {
            Logger_1.Logger.d(TAG, `** Handle Game Session Ended For ${this.getUserNameBySocket(gameEvent.socket)}`, 'gray');
            this.handleGameEnded(gameEvent);
        });
    }
    handleGameEnded(gameEvent) {
        const gameroomId = gameEvent.eventData.roomId;
        //delete that gameroom
        delete this.gameRooms[gameroomId];
        //delete all players from playersPlaying List
        const playersId = gameEvent.eventData.playersId;
        playersId.forEach(pId => {
            Logger_1.Logger.d(TAG, `** deleted [${pId}] from playersPlaying, playersPlaying left[${Object.keys(this.playersPlaying).length}] `, 'gray');
            delete this.playersPlaying[pId];
        });
        //TODO - make sure playersPlaying is updated
    }
    userIsAlreadyConnected(socket) {
        //TODO
    }
    getUserNameBySocket(socket) {
        return socket.user.facebook ? socket.user.facebook.name : socket.user._id;
    }
    printCurrentState(socket) {
        Logger_1.Logger.d(TAG, '========== Socket Details =========', 'yellow');
        console.log('socket id =' + socket.id);
        Logger_1.Logger.d(TAG, `Before handling this socket there are: \n[watingList =${Object.keys(this.waitingList).length} Sockets]\n[gameRooms = ${Object.keys(this.gameRooms).length}]`);
        Logger_1.Logger.d(TAG, '========== Socket Details =========', 'yellow');
    }
}
exports.GameScoketsManager = GameScoketsManager;
