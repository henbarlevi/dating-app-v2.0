import { Action } from 'redux';
import { CHOOSE_QUESTIONS_PLAY_ACTIONS } from '../PLAY_ACTIONS_ENUM';


/* ==== ACTIONS ====*/

// ------- ASK Q ------
export const ASK_QUESTION = CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question;
export class askQuestion implements Action {
    constructor(public payload: number) { }
    readonly type:CHOOSE_QUESTIONS_PLAY_ACTIONS = ASK_QUESTION;
}
// ------- ANSWER Q ------
export const ANSWER_QUESTION = CHOOSE_QUESTIONS_PLAY_ACTIONS.answer_question;
export class answerQuestion implements Action {
    constructor(public payload: number) { }
    readonly type:CHOOSE_QUESTIONS_PLAY_ACTIONS = ANSWER_QUESTION;
}




//EXPORT
export type PLAY_ACTIONS = askQuestion | answerQuestion;