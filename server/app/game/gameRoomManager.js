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
const ENV = process.env.ENV || 'local';
const envConfig = config.get(ENV);
const reconnection_timeout = envConfig.game.reconnection_timeout; //time to reconnect if a player is inside a game
// ====== / Games
/**handle an individual game room that contains 2 sockets of players (or more -in future version)
 *
*/
class GameRoomManager {
    constructor(io, gameRoom) {
        this.io = io;
        this.gameRoom = gameRoom;
    }
    handle() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.handeDisconnections();
                let gameRoomId = this.gameRoom.roomId;
                //insert the players into the room
                this.gameRoom.players.forEach(playerSocket => {
                    playerSocket.join(gameRoomId);
                });
                //tell players that match is found and their partner/s id
                //OLD -this.io.to(gameRoomId).emit(GAME_SOCKET_EVENTS.found_partner, { roomId: gameRoomId });
                const playersId = this.gameRoom.players.map(p => p.user._id.toString());
                this.gameRoom.players.forEach((playersocket) => {
                    const playerId = playersocket.user._id.toString();
                    Logger_1.Logger.d(TAG, `emit to player [${this.getUserNameBySocket(playersocket)}] found partners`, 'gray');
                    const partnersId = playersId.filter(pId => pId !== playerId);
                    playersocket.emit(GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.found_partner, { roomId: gameRoomId, partnersId: partnersId, playerId: playerId });
                });
                // while (this.gameRoom.miniGamesRemaining > 0) {
                //generate new mini game:
                let miniGameType = randomizeGame();
                Logger_1.Logger.d(TAG, `gameRoom [${gameRoomId}] - minigames Remaining [${this.gameRoom.miniGamesRemaining}] `);
                Logger_1.Logger.d(TAG, `gameRoom [${gameRoomId}] - ** generating the miniGame ${GAME_TYPE_ENUM_1.GAME_TYPE[miniGameType]}`);
                let minigameClass = miniGames[miniGameType];
                let miniGame = new minigameClass(this.io, this.gameRoom);
                yield miniGame.playMiniGame();
                // }
            }
            catch (e) {
                Logger_1.Logger.d(TAG, `Err =====>${e}`, 'red');
            }
        });
    }
    /**handle disconnections in a Gameroom
     * 1.subscribe to events of disconnected users from this room
     * 2.if disconnection  occur tell other players about disconnected user
     * 3.give a player a certien time to reconnect:
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
        Logger_1.Logger.d(TAG, `** handling disconnection of player ${gameEvent.socket.user.facebook ? gameEvent.socket.user.facebook.name : gameEvent.socket.user._id} **`, 'gray');
        //2.tell other players about disconnected partner
        let disconnectedSocket = gameEvent.socket;
        let disconnctedSocketId = disconnectedSocket.id;
        let disconnectedUserId = disconnectedSocket.user._id.toString(); //TODOTODOTODO - Bug here - filter -filters the reconneciton process (same UserId false) 
        this.gameRoom.players.filter(socket => socket.id !== disconnctedSocketId).forEach(s => {
            s.emit(GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.partner_disconnected, { player: disconnectedSocket.user });
        });
        //3.give a player a certien time to reconnect:
        const time_to_reconnect = reconnection_timeout; //in milisec
        let reconnected$ = game__service_1.game$.filter((gameEvent) => 
        //check a socket connected and its the disconnected player from this room
        gameEvent.eventName === GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.connection &&
            gameEvent.socket.user._id.toString() === disconnectedUserId.toString());
        let timeOut$ = Observable_1.Observable.timer(time_to_reconnect);
        Observable_1.Observable.merge(reconnected$, timeOut$).first().subscribe((gameEventOrTimeout) => {
            //reconnected on time:
            if (gameEventOrTimeout.eventName) {
                const gameEvent = gameEventOrTimeout;
                Logger_1.Logger.d(TAG, `User [${this.getUserNameBySocket(disconnectedSocket)}] reconnected back to gameRoomId: [${this.gameRoom.roomId}]`, 'gray');
            }
            else {
                Logger_1.Logger.d(TAG, `User [${this.getUserNameBySocket(disconnectedSocket)}] chance to reconnection passed, goomRoomId: [${this.gameRoom.roomId}]`, 'gray');
            }
        });
    }
    getUserNameBySocket(socket) {
        return socket.user.facebook ? socket.user.facebook.name : socket.user._id;
    }
}
exports.GameRoomManager = GameRoomManager;
function randomizeGame() {
    let min = 0;
    let max = Object.keys(GAME_TYPE_ENUM_1.GAME_TYPE).length / 2 - 1;
    return Math.floor(Math.random() * (max - min + 1) + min);
}
