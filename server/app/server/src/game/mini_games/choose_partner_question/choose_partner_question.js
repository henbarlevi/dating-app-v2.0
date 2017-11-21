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
const GAME_SOCKET_EVENTS_1 = require("../../../../../contract/GAME_SOCKET_EVENTS");
// ===== utils
const questions_1 = require("./questions");
const NumberOfQuestionsPerGame = 7;
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
            let randomQuestions = choose_partner_question.randomizeQuestions();
            //declaring the mini game that should start - this is how client know to load the minigame screen:
            this.io.to(this.gameRoom.roomId).emit(GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.init_mini_game, {
                gameType: GAME_TYPE_ENUM_1.GAME_TYPE.choose_partner_question,
                initData: randomQuestions
            });
            yield this.WaitForPlayersToBeReady(); //calling super class
        });
    }
    playMiniGame() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.initMiniGame();
                let turn;
                let passive;
                //randomize first player to play:
                Math.floor(Math.random() * 2) === 0 ?
                    turn = this.gameRoom.playerOne : turn = this.gameRoom.playerTwo;
                this.io.to(this.gameRoom.roomId).on(GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.play, (socket) => __awaiter(this, void 0, void 0, function* () {
                    if (turn === socket) {
                        //tell the other player about his partner turn
                    }
                    else {
                        Logger_1.Logger.d(TAG, `Warning - the player try to play when its not his turn`, 'red');
                    }
                }));
                //tell to socket that its turn to play
                turn.emit(GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.player_turn, true);
                //DOENT FORGET TO REMOVE LISTENERS FOR EVETNS
            }
            catch (e) {
                Logger_1.Logger.d(TAG, `Err =======>${e}`, 'red');
            }
        });
    }
    static randomizeQuestions() {
        let min = 0;
        let max = questions_1.default.length - NumberOfQuestionsPerGame;
        let startIndex = Math.floor(Math.random() * (max - min + 1) + min);
        let randomQuestions = questions_1.default.slice(startIndex, startIndex + NumberOfQuestionsPerGame);
        return randomQuestions;
    }
}
exports.choose_partner_question = choose_partner_question;
var QuestionPlayType;
(function (QuestionPlayType) {
    QuestionPlayType[QuestionPlayType["ask_question"] = 0] = "ask_question";
    QuestionPlayType[QuestionPlayType["answer_question"] = 1] = "answer_question";
})(QuestionPlayType || (QuestionPlayType = {}));
