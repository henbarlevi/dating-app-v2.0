"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid = require("uuid/v1"); //generate guid
require("rxjs/add/observable/timer");
require("rxjs/add/observable/merge");
require("rxjs/add/operator/first");
//====== services
const gameRoomManager_1 = require("./gameRoomManager");
const game__service_1 = require("./game$.service");
const GAME_SOCKET_EVENTS_enum_1 = require("./models/GAME_SOCKET_EVENTS.enum");
const iGameSocket_1 = require("./models/iGameSocket");
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
            if (gameEvent.eventName !== GAME_SOCKET_EVENTS_enum_1.GAME_SOCKET_EVENTS.connection) {
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
            const playerSocket = gameEvent.socket;
            const userId = playerSocket.user._id.toString();
            this.printCurrentState(playerSocket);
            Logger_1.Logger.d(TAG, `** Handle New Connection **`, 'gray');
            playerSocket.emit(GAME_SOCKET_EVENTS_enum_1.GAME_SOCKET_EVENTS.searchForPartner);
            let partnerSocket = this.searchForPartner(playerSocket);
            if (!partnerSocket) {
                Logger_1.Logger.d(TAG, `**inserting ${iGameSocket_1.getUserNameBySocket(playerSocket)} to waiting list**`, 'green');
                this.waitingList[userId] = playerSocket;
            }
            else {
                //remove partner from waiting list
                const partnerId = partnerSocket.user._id.toString();
                delete this.waitingList[partnerId];
                //generate game room
                let gameRoom = this.generateGameRoom([playerSocket, partnerSocket]);
                this.printGameroomDetails(gameRoom);
                //insert them to players playing list
                this.playersPlaying[userId] = gameRoom.roomId;
                this.playersPlaying[partnerId] = gameRoom.roomId;
                //generate new Handler to handle the room
                let gameRoomManager = new gameRoomManager_1.GameRoomManager(this.io, gameRoom);
                gameRoomManager.handle();
                //insert to gamerooms arr
                this.gameRooms[gameRoom.roomId] = gameRoom;
            }
        });
    }
    /**
     * 'leaving game' is seprated from 'disconnection' because disconnection can be temporarly and the user can come back to the game
     * when 'leave game' the user removed from his game session permenantly
     */
    handlePlayersLeavingGame() {
        game__service_1.game$.filter((gameEvent) => gameEvent.eventName === GAME_SOCKET_EVENTS_enum_1.GAME_SOCKET_EVENTS.leave_game)
            .subscribe((gameEvent) => {
            let userId = gameEvent.socket.user._id;
            if (this.playersPlaying[userId]) {
                delete this.playersPlaying[userId];
            }
            else {
                Logger_1.Logger.d(TAG, `WARNING - user ${iGameSocket_1.getUserNameBySocket(gameEvent.socket)} is 'leaving game' even he is not from the [PlayersPlaying] list.. `, 'yellow');
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
            players: players
        };
        return gameRoom;
    }
    /**handle socket's disconnection */
    handleDisconnections() {
        //handle disconnections //TODO - check how dispose correctly
        game__service_1.game$.filter((gameEvent) => gameEvent.eventName === GAME_SOCKET_EVENTS_enum_1.GAME_SOCKET_EVENTS.disconnect)
            .subscribe((gameEvent) => {
            Logger_1.Logger.d(TAG, `** Handle Disconnection For ${iGameSocket_1.getUserNameBySocket(gameEvent.socket)}`, 'gray');
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
     * 2. disconnection of players inside a game will be handled by the gameroom until the reconnection time passed.
     */
    handleDisconnectionEvent(gameEvent) {
        let disconnectingUserID = gameEvent.socket.user._id.toString();
        let disconnectUserSocket = gameEvent.socket;
        //remove socket from waiting list if its there
        this.waitingList[disconnectingUserID] ? Logger_1.Logger.d(TAG, `** removing ${iGameSocket_1.getUserNameBySocket(disconnectUserSocket)} from [waiting list].. **`, 'gray') : '';
        delete this.waitingList[disconnectingUserID];
    }
    /**
     * @description handle ended games
     */
    handleEndedGames() {
        //gamerooms will emit game_ended and when it occur
        game__service_1.game$.filter((gameEvent) => gameEvent.eventName === GAMEROOM_EVENTS_1.GAMEROOM_EVENT.gameroom_session_ended)
            .subscribe((gameEvent) => {
            Logger_1.Logger.d(TAG, `** Handle Game Session Ended - GameRoom [${gameEvent.eventData.roomId}]`, 'gray');
            this.handleGameEnded(gameEvent);
        });
    }
    /**
     * @param gameEvent - game_ended gamroom event
     */
    handleGameEnded(gameEvent) {
        const gameroomId = gameEvent.eventData.roomId;
        //delete that gameroom
        delete this.gameRooms[gameroomId];
        //delete all players from playersPlaying List
        const playersId = gameEvent.eventData.playersId;
        playersId.forEach(pId => {
            delete this.playersPlaying[pId];
            Logger_1.Logger.d(TAG, `** deleted [${pId}] from playersPlaying, playersPlaying left[${Object.keys(this.playersPlaying).length}] `, 'gray');
        });
        Logger_1.Logger.d(TAG, `Gamerooms Remaining :${Object.keys(this.gameRooms).length}`);
        //TODO - make sure playersPlaying is updated
    }
    userIsAlreadyConnected(socket) {
        //TODO
    }
    printCurrentState(socket) {
        Logger_1.Logger.mt(TAG, ' Socket Details ', 'yellow')
            .d(TAG, `socket id [${socket.id}] ,rooms:[${Object.keys(socket.rooms)}]`)
            .d(TAG, `Before handling this socket there are: `, 'gray')
            .d(TAG, `[watingList]:[${Object.keys(this.waitingList).length}]`, 'gray')
            .d(TAG, `[gameRooms]:[${Object.keys(this.gameRooms).length}]`, 'gray')
            .mt(TAG, ' Socket Details ', 'yellow');
    }
    printGameroomDetails(gameroom) {
        Logger_1.Logger.st(TAG, `**Generating  New gameroom**`, 'gray')
            .d(TAG, `gameroomId:${gameroom.roomId}`, 'gray')
            .d(TAG, `players:${gameroom.players.map(p => iGameSocket_1.getUserNameBySocket(p))}`, 'gray');
    }
}
exports.GameScoketsManager = GameScoketsManager;
