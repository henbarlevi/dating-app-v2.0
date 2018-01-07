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
const game__service_1 = require("../game$.service");
require("rxjs/add/operator/filter");
class miniGame {
    constructor(io, gameRoom) {
        this.io = io;
        this.gameRoom = gameRoom;
        this.gameRoomPlayersAmount = gameRoom.players.length;
    }
    WaitForPlayersToBeReady() {
        return new Promise((resolve, reject) => {
            Logger_1.Logger.d(TAG, '** waiting for players to be ready... **', 'gray');
            let playersReady = [];
            //TODO - dont forget to dispose event listener
            let subscription = game__service_1.game$
                .filter((event) => {
                if (event.eventData) {
                    let gameroomId = event.eventData.roomId;
                    let eventName = event.eventName;
                    Logger_1.Logger.d(TAG, `Game room ${this.gameRoom.roomId} received event : ${eventName} related to ${gameroomId} to game room ${gameroomId}`, 'gray');
                    return eventName === GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.ready_for_mini_game && gameroomId === this.gameRoom.roomId;
                }
                return false;
            }) //check if its ready_for_mini_game event + related to that gameRoomId
                .subscribe((data) => __awaiter(this, void 0, void 0, function* () {
                try {
                    let playerReady = data.socket;
                    let playerRelatedToGameroom = this.gameRoom.players.find(p => p.id === playerReady.id);
                    playerRelatedToGameroom ? playersReady.push(playerReady) : 'Warning! Socket That is not related to game room emited event of ready_for_minigame';
                    Logger_1.Logger.d(TAG, `game room [${this.gameRoom.roomId}] | Player - ${playerReady.user.facebook ? playerReady.user.facebook.name : playerReady.user._id} is ready`);
                    if (playersReady.length === this.gameRoomPlayersAmount) {
                        resolve();
                    }
                }
                catch (e) {
                    Logger_1.Logger.d(TAG, 'ERR =====>' + e, 'red');
                    reject(e);
                }
            }));
            // this.io.on('ready_for_mini_game'/*GAME_SOCKET_EVENTS.ready_for_mini_game*/, async (socket: iGameSocket) => {
            //     try {
            //         console.log(TAG, socket.rooms);
            //         Logger.d(TAG, `the user :${socket.user._id}(=_id) is ready to play`);
            //         socket.user.facebook.id === this.gameRoom.playerOne.user.facebook.id ?
            //             playerOneRadyForMiniGame = true : ''
            //         socket.user.facebook.id === this.gameRoom.playerTwo.user.facebook.id ?
            //             playerTwoRadyForMiniGame = true : ''
            //         //if the 2 players are ready: start the mini game
            //         if (playerOneRadyForMiniGame && playerTwoRadyForMiniGame) {
            //             Logger.d(TAG, '2 players are ready to play', 'green');
            //             resolve();
            //         }
            //     }
            //     catch (e) {
            //         Logger.d(TAG, 'ERR =====>' + e, 'red');
            //         reject(e);
            //     }
            // });
        });
    }
}
exports.miniGame = miniGame;
