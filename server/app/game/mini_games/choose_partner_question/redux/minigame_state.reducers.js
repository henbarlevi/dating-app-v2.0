"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PLAY_ACTIONS = require("./play.actions");
//mini game initial state
const initialState = {
    currentAnswerIndex: -1,
    currentQuestionIndex: -1,
    currentGameAction: PLAY_ACTIONS.ASK_QUESTION //game waiting for player to choose a -question
};
function MiniGameStateReducer(state = initialState, action) {
    switch (action.type) {
        case PLAY_ACTIONS.ASK_QUESTION:
            return Object.assign({}, state, { currentQuestionIndex: action.payload, currentGameAction: PLAY_ACTIONS.ANSWER_QUESTION });
        case PLAY_ACTIONS.ANSWER_QUESTION:
            return Object.assign({}, state, { currentAnswerIndex: action.payload, currentGameAction: PLAY_ACTIONS.ASK_QUESTION });
        default:
            return state;
    }
}
exports.MiniGameStateReducer = MiniGameStateReducer;
