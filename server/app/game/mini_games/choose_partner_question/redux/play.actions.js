"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* ==== ACTIONS ====*/
// ------- add movie ------
exports.ASK_QUESTION = 'ASK_QUESTION';
class askQuestion {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.ASK_QUESTION;
    }
}
exports.askQuestion = askQuestion;
// ------- start edit movie ------
exports.ANSWER_QUESTION = 'ANSWER_QUESTION';
class answerQuestion {
    constructor(payload) {
        this.payload = payload;
        this.type = exports.ANSWER_QUESTION;
    }
}
exports.answerQuestion = answerQuestion;
