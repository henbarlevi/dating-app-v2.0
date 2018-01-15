import { createStore } from 'redux'
import { iGenericMiniGameState } from '../../iminiGameState.model';
import { CHOOSE_QUESTIONS_PLAY_ACTIONS } from '../PLAY_ACTIONS_ENUM';
import * as PLAY_ACTIONS from './play.actions';

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
    currentGameAction: string;
}
//mini game initial state
const initialState: iMiniGameState = {
    currentAnswerIndex: -1,//answer not yet chosen
    currentQuestionIndex: -1,//question not yet chosen
    currentGameAction: PLAY_ACTIONS.ASK_QUESTION //game waiting for player to choose a -question
}

export function MiniGameStateReducer(state = initialState, action: PLAY_ACTIONS.PLAY_ACTIONS) {
    switch (action.type) {
        case PLAY_ACTIONS.ASK_QUESTION:
            return {
                ...state,///...state,//assign all properties of state to the returned obj
                currentQuestionIndex: action.payload,
                currentGameAction: PLAY_ACTIONS.ANSWER_QUESTION
            }
        case PLAY_ACTIONS.ANSWER_QUESTION:
            return {

                ...state,
                currentAnswerIndex: action.payload,
                currentGameAction: PLAY_ACTIONS.ASK_QUESTION
            }

        default:
            return state;
    }
}
