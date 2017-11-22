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
const Logger_1 = require("../../utils/Logger");
const GAME_SOCKET_EVENTS_1 = require("../models/GAME_SOCKET_EVENTS");
const TAG = 'miniGame Abstract |';
class miniGame {
    constructor(io, gameRoom) {
        this.io = io;
        this.gameRoom = gameRoom;
    }
    WaitForPlayersToBeReady() {
        return new Promise((resolve, reject) => {
            let playerOneRadyForMiniGame = false;
            let playerTwoRadyForMiniGame = false;
            //TODO - dont forget to dispose event listener
            this.io.to(this.gameRoom.roomId).on(GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.ready_for_mini_game, (socket) => __awaiter(this, void 0, void 0, function* () {
                try {
                    Logger_1.Logger.d(TAG, `the user :${socket.user._id}(=_id) is ready to play`);
                    socket.user.facebook.id === this.gameRoom.playerOne.user.facebook.id ?
                        playerOneRadyForMiniGame = true : '';
                    socket.user.facebook.id === this.gameRoom.playerTwo.user.facebook.id ?
                        playerTwoRadyForMiniGame = true : '';
                    //if the 2 players are ready: start the mini game
                    if (playerOneRadyForMiniGame && playerTwoRadyForMiniGame) {
                        Logger_1.Logger.d(TAG, '2 players are ready to play', 'green');
                        resolve();
                    }
                }
                catch (e) {
                    Logger_1.Logger.d(TAG, 'ERR =====>' + e, 'red');
                    reject(e);
                }
            }));
        });
    }
}
exports.miniGame = miniGame;
