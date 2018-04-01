import { createStore } from 'redux'
import { iGenericMiniGameState } from '../../iminiGameState.model';
import { CHOOSE_QUESTIONS_PLAY_ACTIONS } from '../PLAY_ACTIONS_ENUM';
import * as PLAY_ACTIONS from './play.actions';
import { iPlayAction } from '../../../models/iPlayData';
const NumberOfQuestionsPerGame: number = 7;

import { Logger } from '../../../../utils/Logger';
import { GAME_TYPE } from '../../../models/GAME_TYPE_ENUM';
const TAG: string = 'MiniGameStateReducer |';
/**
* This is a reducer, a pure function with (state, action) => state signature.
* It describes how an action transforms the state into the next state.
*
* The shape of the state is up to you: it can be a primitive, an array, an object,
* or even an Immutable.js data structure. The only important part is that you should
* not mutate the state object, but return a new object if the state changes.
*
* In this example, we use a `switch` statement and strings, but you can use a helper that
* follows a different convention (such as function maps) if it makes sense for your
* project.
*/
export interface iMiniGameState extends iGenericMiniGameState<GAME_TYPE.choose_partner_question> {
    currentQuestionIndex: number,
    currentAnswerIndex: number,
    currentGameAction: CHOOSE_QUESTIONS_PLAY_ACTIONS,
    questionsRemaining: number,
    playersId: string[],// players _id
    // numberOfPlayersLeftToAnswer: number,
    turnUserId: string //which user _id turn it is
}
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

export function MiniGameStateReducer(state: iMiniGameState, action: iPlayAction<CHOOSE_QUESTIONS_PLAY_ACTIONS>): iMiniGameState {
    switch (action.type) {
        /**ASK_QUESTION */
        case PLAY_ACTIONS.ASK_QUESTION:
            const currentTurnIndex: number = state.playersId.findIndex(p => p === state.turnUserId);
            const nextTurnIndex: number = currentTurnIndex < (state.playersId.length-1) ? (currentTurnIndex + 1) : 0;
            const nextTurn: string = state.playersId[nextTurnIndex];
            return {
                ...state,///...state,//assign all properties of state to the returned obj
                currentQuestionIndex: action.payload,
                currentAnswerIndex:-1,
                currentGameAction: CHOOSE_QUESTIONS_PLAY_ACTIONS.answer_question,
                turnUserId: nextTurn,
            }
        /**ANSWER_QUESTION */
        case PLAY_ACTIONS.ANSWER_QUESTION:
            const questionsRemaining: number = --state.questionsRemaining;
            const currentTurnIndx: number = state.playersId.findIndex(p => p === state.turnUserId);
            const nextTurnIndx: number = currentTurnIndx < (state.playersId.length-1) ? (currentTurnIndx + 1) : 0;
            const nxtTurn: string = state.playersId[nextTurnIndx];
            return {
                ...state,
                currentAnswerIndex: action.payload,
                currentQuestionIndex:-1,
                currentGameAction: CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question,
                questionsRemaining: questionsRemaining,
                turnUserId: nxtTurn
            }

        default:
            return state;
    }
}



const ValidatePlayAction = (miniGameState: iMiniGameState, playActionData: iPlayAction<CHOOSE_QUESTIONS_PLAY_ACTIONS>): boolean => {
    if (!playActionData || !playActionData.payload) { return false }///TODOTODOTODO decide how client will send the play action data -currently client send the full question string but index its enough
    if (playActionData.type !== miniGameState.currentGameAction) { return false }
    //if player choose a question
    let emitedValue = playActionData.payload;
    if (typeof emitedValue === 'number') {
        Logger.d(TAG, `the emittedvalue is not a number, its a ${typeof emitedValue}`, 'red');
    }
    if (miniGameState.currentGameAction === CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question) {
        //check its a valid question index value:
        let chosenQuestionIndex = playActionData.payload as number;
        let questionsMaxIndex: number = this.randomQuestions.length - 1;//max valid index
        return !(chosenQuestionIndex < 0 || chosenQuestionIndex > questionsMaxIndex);

    } else {//if player choose an answer
        //check its a valid answer index value:
        let currentQuestionIndex = miniGameState.currentQuestionIndex;
        let chosenAnswerIndex = playActionData.payload as number;
        let AnswersMaxIndex: number = this.randomQuestions[currentQuestionIndex].a.length - 1;//max valid index
        return !(chosenAnswerIndex < 0 || chosenAnswerIndex > AnswersMaxIndex);
    }
}