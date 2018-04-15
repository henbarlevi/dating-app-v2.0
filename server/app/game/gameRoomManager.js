"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/timer");
require("rxjs/add/observable/merge");
require("rxjs/add/operator/first");
//=======utils
const Logger_1 = require("../utils/Logger");
const GAME_TYPE_ENUM_1 = require("./models/GAME_TYPE_ENUM");
const GAME_SOCKET_EVENTS_1 = require("./models/GAME_SOCKET_EVENTS");
const TAG = 'GameRoomManager |';
// ====== Games
const choose_partner_question_1 = require("./mini_games/choose_partner_question/choose_partner_question");
const game__service_1 = require("./game$.service");
let miniGames = [
    choose_partner_question_1.choose_partner_question
];
// =========================
// ====== ENV Configutations
// =========================
const config = require("config");
const iGameState_model_1 = require("./models/iGameState.model");
const GAMEROOM_EVENTS_1 = require("./models/GAMEROOM_EVENTS");
const ENV = process.env.ENV || 'local';
const envConfig = config.get(ENV);
const reconnection_timeout = envConfig.game.reconnection_timeout; //time to reconnect if a player is inside a game
// ====== / Games
/**handle an individual game room that contains 2 sockets (or more -in future version) of players
 *
*/
class GameRoomManager {
    constructor(io, gameRoom) {
        this.io = io;
        this.gameRoom = gameRoom;
    }
    /**
     * return a default of gameroom state
     */
    get InitGameRoomState() {
        let initPlayersExposedData = {};
        this.gameRoom.players.map(p => p.user._id.toString()).forEach(playerId => {
            initPlayersExposedData[playerId] = { id: playerId };
        });
        return Object.assign({}, iGameState_model_1.initialState, { miniGamesRemaining: this.gameRoom.miniGamesRemaining, GAME_STATUS: iGameState_model_1.GAME_STATUS.playing, 
            //players exposed data
            players: initPlayersExposedData });
    }
    handle() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.gameRoomState = this.InitGameRoomState;
                this.handeDisconnections();
                const gameRoomId = this.gameRoom.roomId;
                //insert to each socket the gameroomId:
                this.gameRoom.players.forEach(socket => {
                    this.enterPlayerToRoom(socket, gameRoomId);
                });
                //tell players that match is found and their partner/s id
                const playersId = this.gameRoom.players.map(p => p.user._id.toString());
                this.gameRoom.players.forEach((playersocket) => {
                    const playerId = playersocket.user._id.toString();
                    Logger_1.Logger.d(TAG, `emit to player [${this.getUserNameBySocket(playersocket)}] found partners`, 'gray');
                    const partnersId = playersId.filter(pId => pId !== playerId);
                    playersocket.emit(GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.found_partner, { roomId: gameRoomId, partnersId: partnersId, playerId: playerId });
                });
                while (this.gameRoom.miniGamesRemaining > 0) {
                    //generate new mini game:
                    let miniGameType = randomizeGame();
                    Logger_1.Logger.d(TAG, `gameRoom [${gameRoomId}] - minigames Remaining [${this.gameRoom.miniGamesRemaining}] `);
                    Logger_1.Logger.d(TAG, `gameRoom [${gameRoomId}] - ** generating the miniGame ${GAME_TYPE_ENUM_1.GAME_TYPE[miniGameType]}`);
                    let minigameClass = miniGames[miniGameType];
                    let miniGame = new minigameClass(this.io, this.gameRoom);
                    yield miniGame.playMiniGame();
                }
            }
            catch (e) {
                Logger_1.Logger.d(TAG, `Err =====>${e}`, 'red');
            }
        });
    }
    /**handle disconnections in a Gameroom
     * 1.subscribe to events of disconnected users from this room
     * 2.if disconnection  occur tell other players about disconnected user
     * 3.remove player from players list
     * 4.give a player a certien time to reconnect:
     *  a.if reconnected on time - check if the game still on , if so give the user reconnection succeded and tell the other players about reconnected user
     *                                                          if not, //TODO
     *  b.if didn't reconnected on time - tell the other players that the player left permenantly, if user will try to reconnect it will
     * receive session expierd
    */
    handeDisconnections() {
        game__service_1.game$
            .filter((gameEvent) => 
        //check a socket disconnected and its from the same room
        gameEvent.eventName === GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.disconnect &&
            this.gameRoom.roomId === gameEvent.socket.gameRoomId)
            .subscribe((gameEvent) => this.handleDisconnection(gameEvent));
    }
    /**handle indevidual player disconnection */
    handleDisconnection(gameEvent) {
        const disconnectedSocket = gameEvent.socket;
        Logger_1.Logger.st(TAG, `handling disconnection of player ${this.getUserNameBySocket(disconnectedSocket)} `, 'gray');
        const disconnctedSocketId = disconnectedSocket.id;
        const disconnectedUserId = disconnectedSocket.user._id.toString();
        // // 2.remove player from players list
        // this.gameRoom.players = this.gameRoom.players.filter(socket => socket !== disconnectedSocket);
        // Logger.d(TAG, `** removed player from players list , there are now [${this.gameRoom.players.length}] players **`, 'gray');
        //3.tell other players about disconnected partner
        this.io.to(this.gameRoom.roomId).emit(GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.partner_disconnected, { partner: disconnectedSocket.user });
        //4.give a player a certien time to reconnect:
        const time_to_reconnect = reconnection_timeout; //in milisec
        Logger_1.Logger.d(TAG, `** give ${this.getUserNameBySocket(disconnectedSocket)} ${reconnection_timeout / 1000} sec cahnce   to reconnect.. **`, 'gray');
        const reconnected$ = game__service_1.game$.filter((gameEvent) => 
        //check a socket connected and its the disconnected player from this room
        gameEvent.eventName === GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.connection &&
            gameEvent.socket.user._id.toString() === disconnectedUserId);
        const timeOut$ = Observable_1.Observable.timer(time_to_reconnect);
        Observable_1.Observable.merge(reconnected$, timeOut$).first().subscribe((gameEventOrTimeout) => {
            //reconnected on time:
            if (gameEventOrTimeout.eventName) {
                const gameEvent = gameEventOrTimeout;
                const reconnectedUser = gameEvent.socket;
                Logger_1.Logger.d(TAG, `User [${this.getUserNameBySocket(disconnectedSocket)}] reconnected back to gameRoomId: [${this.gameRoom.roomId}]`, 'gray');
                this.handleReconnection(reconnectedUser);
            }
            else {
                //emit game_ended event
                Logger_1.Logger.d(TAG, `User [${this.getUserNameBySocket(disconnectedSocket)}] chance to reconnection passed, goomRoomId: [${this.gameRoom.roomId}]`, 'gray');
                const playersId = this.gameRoom.players.map(p => p.user._id.toString()); //players that leaving
                this.gameRoom.players.forEach(p => p.disconnect());
                const gameroomEvent = { eventName: GAMEROOM_EVENTS_1.GAMEROOM_EVENT.game_ended, socket: disconnectedSocket, eventData: { roomId: this.gameRoom.roomId, playersId: playersId } };
                game__service_1.Game$.emit(gameroomEvent);
                this.onDestory(); //TODO - make sure unsubscribing from all subscription before disconnecting the sockets(2 lines above)
            }
        });
    }
    /**
     * @description when user temp disconnected and reconnected, the server need to
     * 1.tell his partners he reconnected
     * 2.inform the reconnected player the current game state (in case he didnt cached it)
     * 3.add him to the players list (gameroom.players)
     * 4.add him to room
     * @param socket - reconnected player
     */
    handleReconnection(socket) {
        //1.tell his partners he reconnected
        const reconnectedUserId = socket.user.id.toString();
        this.gameRoom.players.forEach(s => {
            s.emit(GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.partner_reconnected, { partner: reconnectedUserId });
        });
        //2.inform the reconnected player the current game state (in case he didnt cached it)
        const clientGameState = this.RoomState_To_ClientGameState(this.gameRoomState, socket);
        socket.emit(GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.reconnection_data, clientGameState);
        //3.add him to the players list (gameroom.players)
        this.gameRoom.players.push(socket);
        //4.add him to room
        this.enterPlayerToRoom(socket, this.gameRoom.roomId);
    }
    /**
     * @description
     * 1.insert socket to room (socket.join)
     * 2.assing to socket the roomid
     * @param socket
     */
    enterPlayerToRoom(socket, roomId) {
        socket.join(roomId);
        socket.gameRoomId = roomId;
    }
    /**
     * @description the difference is that gameRoomState saving all the players exposed data in the 'players' property
     * while in client this data is seperated - 'player' contain the player exposed data , 'partners' - his partners exposed data
     * @param gameroomState
     */
    RoomState_To_ClientGameState(gameRoomState, player) {
        const playerId = player.user._id.toString();
        const playerExposedData = Object.assign({}, gameRoomState.players[playerId]);
        let hisPartnersExposedData = Object.assign({}, gameRoomState.players);
        delete hisPartnersExposedData[playerId];
        const clientState = Object.assign({}, gameRoomState, { partners: hisPartnersExposedData, player: playerExposedData });
        delete clientState.players;
        return clientState;
    }
    getUserNameBySocket(socket) {
        return socket.user.facebook ? socket.user.facebook.name : socket.user._id;
    }
    onDestory() {
        Logger_1.Logger.d(TAG, `** disposing gameroom ${this.gameRoom.roomId}`, 'gray');
    }
}
exports.GameRoomManager = GameRoomManager;
function randomizeGame() {
    let min = 0;
    let max = Object.keys(GAME_TYPE_ENUM_1.GAME_TYPE).length / 2 - 1;
    return Math.floor(Math.random() * (max - min + 1) + min);
}
