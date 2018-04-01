"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PLAY_ACTIONS_ENUM_1 = require("../PLAY_ACTIONS_ENUM");
const PLAY_ACTIONS = require("./play.actions");
const NumberOfQuestionsPerGame = 7;
const Logger_1 = require("../../../../utils/Logger");
const TAG = 'MiniGameStateReducer |';
//mini game initial state
// const initialState: iMiniGameState = {
//     miniGameType: GAME_TYPE.choose_partner_question,
//     currentAnswerIndex: -1,//answer not yet chosen
//     currentQuestionIndex: -1,//question not yet chosen
//     currentGameAction: CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question, //game waiting for player to choose a -question
//     questionsRemaining: NumberOfQuestionsPerGame,
//     numberOfPlayers: 2,//number of playerS is 2 if nothing say otherwise [should be permanent]
//     numberOfPlayersLeftToAnswer: 1,
//     turnUserId:
// }
function MiniGameStateReducer(state, action) {
    switch (action.type) {
        /**ASK_QUESTION */
        case PLAY_ACTIONS.ASK_QUESTION:
            const currentTurnIndex = state.playersId.findIndex(p => p === state.turnUserId);
            const nextTurnIndex = currentTurnIndex < (state.playersId.length - 1) ? (currentTurnIndex + 1) : 0;
            const nextTurn = state.playersId[nextTurnIndex];
            return Object.assign({}, state, { currentQuestionIndex: action.payload, currentAnswerIndex: -1, currentGameAction: PLAY_ACTIONS_ENUM_1.CHOOSE_QUESTIONS_PLAY_ACTIONS.answer_question, turnUserId: nextTurn });
        /**ANSWER_QUESTION */
        case PLAY_ACTIONS.ANSWER_QUESTION:
            const questionsRemaining = --state.questionsRemaining;
            const currentTurnIndx = state.playersId.findIndex(p => p === state.turnUserId);
            const nextTurnIndx = currentTurnIndx < (state.playersId.length - 1) ? (currentTurnIndx + 1) : 0;
            const nxtTurn = state.playersId[nextTurnIndx];
            return Object.assign({}, state, { currentAnswerIndex: action.payload, currentQuestionIndex: -1, currentGameAction: PLAY_ACTIONS_ENUM_1.CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question, questionsRemaining: questionsRemaining, turnUserId: nxtTurn });
        default:
            return state;
    }
}
exports.MiniGameStateReducer = MiniGameStateReducer;
const ValidatePlayAction = (miniGameState, playActionData) => {
    if (!playActionData || !playActionData.payload) {
        return false;
    } ///TODOTODOTODO decide how client will send the play action data -currently client send the full question string but index its enough
    if (playActionData.type !== miniGameState.currentGameAction) {
        return false;
    }
    //if player choose a question
    let emitedValue = playActionData.payload;
    if (typeof emitedValue === 'number') {
        Logger_1.Logger.d(TAG, `the emittedvalue is not a number, its a ${typeof emitedValue}`, 'red');
    }
    if (miniGameState.currentGameAction === PLAY_ACTIONS_ENUM_1.CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question) {
        //check its a valid question index value:
        let chosenQuestionIndex = playActionData.payload;
        let questionsMaxIndex = this.randomQuestions.length - 1; //max valid index
        return !(chosenQuestionIndex < 0 || chosenQuestionIndex > questionsMaxIndex);
    }
    else {
        //check its a valid answer index value:
        let currentQuestionIndex = miniGameState.currentQuestionIndex;
        let chosenAnswerIndex = playActionData.payload;
        let AnswersMaxIndex = this.randomQuestions[currentQuestionIndex].a.length - 1; //max valid index
        return !(chosenAnswerIndex < 0 || chosenAnswerIndex > AnswersMaxIndex);
    }
};
