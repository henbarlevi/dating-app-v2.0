"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PLAY_ACTIONS_ENUM_1 = require("../PLAY_ACTIONS_ENUM");
/* ==== ACTIONS ====*/
// ------- ASK Q ------
exports.ASK_QUESTION = PLAY_ACTIONS_ENUM_1.CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question;
class askQuestion {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.ASK_QUESTION;
    }
}
exports.askQuestion = askQuestion;
// ------- ANSWER Q ------
exports.ANSWER_QUESTION = PLAY_ACTIONS_ENUM_1.CHOOSE_QUESTIONS_PLAY_ACTIONS.answer_question;
class answerQuestion {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.ANSWER_QUESTION;
    }
}
exports.answerQuestion = answerQuestion;
