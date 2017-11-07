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
//====== config
const config = require("config");
const ENV = process.env.ENV || 'local';
const envConfig = config.get(ENV);
//=======utils
const Logger_1 = require("../utils/Logger");
const GAME_TYPE_ENUM_1 = require("./models/GAME_TYPE_ENUM");
const GAME_SOCKET_EVENTS_1 = require("./models/GAME_SOCKET_EVENTS");
const TAG = 'GameRoomManager |';
// ====== Games
const choose_partner_question_1 = require("./mini_games/choose_partner_question");
let miniGames = [
    choose_partner_question_1.choose_partner_question
];
// ====== / Games
/**handle an individual game room that contains 2 sockets of players
 *
*/
class GameRoomManager {
    constructor(io, gameRoom) {
        this.io = io;
        this.gameRoom = gameRoom;
    }
    handle() {
        return __awaiter(this, void 0, void 0, function* () {
            while (this.gameRoom.miniGamesRemaining > 0) {
                //generate new mini game:
                let miniGameType = randomizeGame();
                let minigameClass = miniGames[miniGameType];
                let miniGame = new minigameClass();
                //TODO -transfer the minigame into the mini gameclass (waitForPlayersToBeReadyAndStartTheMiniGame) etc..
                //and maybe create super class 
                //declaring the mini game that should start - this is how client know to load the minigame screen:
                this.io.to(this.gameRoom.roomId).emit(GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.init_mini_game, { miniGame: miniGameType });
            }
        });
    }
    waitForPlayersToBeReadyAndStartTheMiniGame() {
        return new Promise((resolve, reject) => {
            let playerOneRadyForMiniGame = false;
            let playerTwoRadyForMiniGame = false;
            this.io.to(this.gameRoom.roomId).on(GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.ready_for_mini_game, (socket) => __awaiter(this, void 0, void 0, function* () {
                try {
                    socket.user.facebook.id === this.gameRoom.playerOne.user.facebook.id ?
                        playerOneRadyForMiniGame = true : '';
                    socket.user.facebook.id === this.gameRoom.playerTwo.user.facebook.id ?
                        playerTwoRadyForMiniGame = true : '';
                    //if the 2 players are ready: start the mini game
                    playerOneRadyForMiniGame && playerTwoRadyForMiniGame ?
                        :
                    ;
                    // startMiniGame
                }
                catch (e) {
                    Logger_1.Logger.d(TAG, 'ERR =====>' + e, 'red');
                }
            }));
        });
    }
}
exports.GameRoomManager = GameRoomManager;
function randomizeGame() {
    let min = 0;
    let max = Object.keys(GAME_TYPE_ENUM_1.GAME_TYPE).length / 2;
    return Math.floor(Math.random() * (max - min + 1) + min);
}
