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
const abstract_minigame_1 = require("../abstract_minigame");
const GAME_SOCKET_EVENTS_1 = require("../../models/GAME_SOCKET_EVENTS");
// ===== utils
const questions_1 = require("./questions");
const Logger_1 = require("../../../utils/Logger");
const GAME_TYPE_ENUM_1 = require("../../models/GAME_TYPE_ENUM");
const TAG = 'choose_partner_question';
class choose_partner_question extends abstract_minigame_1.miniGame {
    constructor(io, gameRoom) {
        super(io, gameRoom);
    }
    initMiniGame() {
        return __awaiter(this, void 0, void 0, function* () {
            Logger_1.Logger.d(TAG, `initalizing the [choose_partner_question] game..`, 'gray');
            //lading questions:
            console.log(questions_1.default);
            //declaring the mini game that should start - this is how client know to load the minigame screen:
            this.io.to(this.gameRoom.roomId).emit(GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.init_mini_game, {
                gameType: GAME_TYPE_ENUM_1.GAME_TYPE.choose_partner_question,
                initData: questions_1.default
            });
            yield this.WaitForPlayersToBeReady(); //calling super class
        });
    }
    startMiniGame() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.initMiniGame();
                let turn;
                //randomize first player:
                Math.floor(Math.random() * 2) === 0 ?
                    turn = this.gameRoom.playerOne : turn = this.gameRoom.playerTwo;
                // if (turn === gameRoom.playerOne) {
                // }
            }
            catch (e) {
                Logger_1.Logger.d(TAG, `Err =======>${e}`, 'red');
            }
        });
    }
}
exports.choose_partner_question = choose_partner_question;
