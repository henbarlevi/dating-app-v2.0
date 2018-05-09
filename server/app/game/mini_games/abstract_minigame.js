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
const iGameSocket_1 = require("../models/iGameSocket");
const Logger_1 = require("../../utils/Logger");
const GAME_SOCKET_EVENTS_enum_1 = require("../models/GAME_SOCKET_EVENTS.enum");
const TAG = 'miniGame Abstract |';
const game__service_1 = require("../game$.service");
require("rxjs/add/operator/filter");
class miniGame {
    constructor(io, gameRoom) {
        this.io = io;
        this.gameRoom = gameRoom;
        this.ready$Subscription = null;
    }
    //responsible to dispose all observables of the miniGame
    onDestory() {
        try {
            this.ready$Subscription ? this.ready$Subscription.unsubscribe() : '';
            this.io = this.gameRoom = null;
        }
        catch (e) {
            Logger_1.Logger.d(TAG, 'ERR =====> onDestory' + e, 'red');
        }
    }
    /**@description return the players _id in the gameroom */
    get playersId() {
        return this.gameRoom.players.map(p => p.user._id.toString());
    }
    /**@description return the players amount the gameroom */
    get playersAmount() {
        return this.gameRoom.players.length;
    }
    /**@description @return Observable that raise gameSocket Events from the specified eventName
     * and are related to the gameRoom */
    getEventsByNameInGameroom(eventName) {
        return game__service_1.game$
            .filter((event) => {
            const evName = event.eventName;
            if (!event.socket) {
                return false;
            }
            const gameRoomId = event.socket.gameRoomId;
            evName === eventName && gameRoomId !== this.gameRoom.roomId ? Logger_1.Logger.d(TAG, `Warning! [${eventName}] occur but the socket.gameRoomId:[${gameRoomId}] Instead Of [${this.gameRoom.roomId}]`, 'red') : '';
            return evName === eventName && gameRoomId === this.gameRoom.roomId;
        }); //check if its the event in the Input + related to this gameRoomId
    }
    WaitForPlayersToBeReady() {
        return new Promise((resolve, reject) => {
            Logger_1.Logger.d(TAG, '** waiting for players to be ready... **', 'gray');
            let playersIdReady = [];
            //TODO - dont forget to dispose event listener
            this.ready$Subscription = this.getEventsByNameInGameroom(GAME_SOCKET_EVENTS_enum_1.GAME_SOCKET_EVENTS.ready_for_mini_game) //check if its ready_for_mini_game event + related to that gameRoomId
                .subscribe((data) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const playerReady = data.socket;
                    const playerIdReady = playerReady.user._id.toString();
                    const playerRelatedToGameroom = this.playersId.some(pId => pId === playerIdReady);
                    playerRelatedToGameroom ? playersIdReady.push(playerIdReady) : Logger_1.Logger.d(TAG, 'Warning! Socket That is not related to game room emited event of ready_for_minigame', 'red');
                    Logger_1.Logger.d(TAG, `game room [${this.gameRoom.roomId}] | Player - ${iGameSocket_1.getUserNameBySocket(playerReady)} is ready, [${playersIdReady.length}] players are ready`);
                    if (playersIdReady.length === this.playersAmount) {
                        this.ready$Subscription.unsubscribe(); //unsubscribe from observable 
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
    /**when some players do an action in the game - this method will inform the other players about the game action occurred
     * @param playerId - the player that did the action
     */
    tellPlayersAboutPlayAction(playerId, playActionData) {
        const playAction = Object.assign({}, playActionData, { playerId: playerId });
        this.gameRoom.players.forEach(p => {
            if (p.user._id.toString() !== playerId) {
                Logger_1.Logger.d(TAG, `** telling the player [${iGameSocket_1.getUserNameBySocket(p)}] about the playaction **`, 'gray');
                p.emit(GAME_SOCKET_EVENTS_enum_1.GAME_SOCKET_EVENTS.partner_played, playAction);
            }
        });
    }
    /**@description - called when minigame ends, it will
     * 1.inform the players that minigame ended (GAME_SOCKET_EVENTS.mini_game_ended)
     * 2.wait for them to confirm
     * 3.dispose this class (onDestroy)
     */
    endMinigame() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                //1
                this.io.to(this.gameRoom.roomId).emit(GAME_SOCKET_EVENTS_enum_1.GAME_SOCKET_EVENTS.mini_game_ended);
                //2
                yield this.WaitForPlayersToConfirmMinigameEnded();
                //3
                this.onDestory();
                resolve();
            }
            catch (e) {
                Logger_1.Logger.d(TAG, 'ERR =====>' + e, 'red');
                reject(e);
            }
        }));
    }
    WaitForPlayersToConfirmMinigameEnded() {
        return new Promise((resolve, reject) => {
            let playersIdConfirmed = [];
            const endingConfirm$Sub = this.getEventsByNameInGameroom(GAME_SOCKET_EVENTS_enum_1.GAME_SOCKET_EVENTS.mini_game_ended)
                .subscribe((gameEvent) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const playerIdConfirmed = gameEvent.socket.user._id.toString();
                    const didntAlreadyConfirmed = playersIdConfirmed.every(pId => pId !== playerIdConfirmed);
                    didntAlreadyConfirmed ? playersIdConfirmed.push(playerIdConfirmed) : '';
                    if (playersIdConfirmed.length === this.playersAmount) {
                        endingConfirm$Sub.unsubscribe();
                        resolve();
                    }
                }
                catch (e) {
                    reject(e);
                }
            }));
        });
    }
}
exports.miniGame = miniGame;
