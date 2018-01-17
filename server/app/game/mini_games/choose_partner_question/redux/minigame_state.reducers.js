"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PLAY_ACTIONS_ENUM_1 = require("../PLAY_ACTIONS_ENUM");
const PLAY_ACTIONS = require("./play.actions");
const NumberOfQuestionsPerGame = 7;
const Logger_1 = require("../../../../utils/Logger");
const TAG = 'MiniGameStateReducer |';
//mini game initial state
const initialState = {
    currentAnswerIndex: -1,
    currentQuestionIndex: -1,
    currentGameAction: PLAY_ACTIONS_ENUM_1.CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question,
    questionsRemaining: NumberOfQuestionsPerGame,
    numberOfPlayers: 2,
    numberOfPlayersLeftToAnswer: 2
};
function MiniGameStateReducer(state = initialState, action) {
    switch (action.type) {
        case PLAY_ACTIONS.ASK_QUESTION:
            return Object.assign({}, state, { currentQuestionIndex: action.payload, currentGameAction: PLAY_ACTIONS_ENUM_1.CHOOSE_QUESTIONS_PLAY_ACTIONS.answer_question });
        case PLAY_ACTIONS.ANSWER_QUESTION:
            const numberOfPlayersLeftToAnswer = state.numberOfPlayersLeftToAnswer - 1;
            if (state.numberOfPlayersLeftToAnswer)
                return Object.assign({}, state, { currentAnswerIndex: action.payload, numberOfPlayersLeftToAnswer: numberOfPlayersLeftToAnswer, currentGameAction: numberOfPlayersLeftToAnswer === 0 ? PLAY_ACTIONS_ENUM_1.CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question : state.currentGameAction });
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
