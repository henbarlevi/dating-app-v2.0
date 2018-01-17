import { createStore } from 'redux'
import { iGenericMiniGameState } from '../../iminiGameState.model';
import { CHOOSE_QUESTIONS_PLAY_ACTIONS } from '../PLAY_ACTIONS_ENUM';
import * as PLAY_ACTIONS from './play.actions';
import { iPlayAction } from '../../../models/iPlayData';
const NumberOfQuestionsPerGame: number = 7;

import { Logger } from '../../../../utils/Logger';
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
export interface iMiniGameState /*TODO uncomment thisextends iGenericMiniGameState*/ {
    currentQuestionIndex: number,
    currentAnswerIndex: number,
    currentGameAction: CHOOSE_QUESTIONS_PLAY_ACTIONS,
    questionsRemaining: number,
    numberOfPlayers: number,
    numberOfPlayersLeftToAnswer: number
}
//mini game initial state
const initialState: iMiniGameState = {
    currentAnswerIndex: -1,//answer not yet chosen
    currentQuestionIndex: -1,//question not yet chosen
    currentGameAction: CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question, //game waiting for player to choose a -question
    questionsRemaining: NumberOfQuestionsPerGame,
    numberOfPlayers: 2,//number of playerS is 2 if nothing say otherwise [should be permanent]
    numberOfPlayersLeftToAnswer: 2
}

export function MiniGameStateReducer(state = initialState, action: iPlayAction<CHOOSE_QUESTIONS_PLAY_ACTIONS>) {
    switch (action.type) {
        case PLAY_ACTIONS.ASK_QUESTION:
            return {
                ...state,///...state,//assign all properties of state to the returned obj
                currentQuestionIndex: action.payload,
                currentGameAction: CHOOSE_QUESTIONS_PLAY_ACTIONS.answer_question
            }
        case PLAY_ACTIONS.ANSWER_QUESTION:
            const numberOfPlayersLeftToAnswer: number = state.numberOfPlayersLeftToAnswer - 1;
            if (state.numberOfPlayersLeftToAnswer)
                return {
                    ...state,
                    currentAnswerIndex: action.payload,
                    numberOfPlayersLeftToAnswer: numberOfPlayersLeftToAnswer,
                    currentGameAction: numberOfPlayersLeftToAnswer === 0 ? CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question : state.currentGameAction
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