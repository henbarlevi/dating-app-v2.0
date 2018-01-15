import { Action } from 'redux';


/* ==== ACTIONS ====*/

// ------- add movie ------
export const ASK_QUESTION = 'ASK_QUESTION';
export class askQuestion implements Action {
    constructor(public payload: number) { }
    readonly type = ASK_QUESTION;
}
// ------- start edit movie ------
export const ANSWER_QUESTION = 'ANSWER_QUESTION';
export class answerQuestion implements Action {
    constructor(public payload: number) { }
    readonly type = ANSWER_QUESTION;
}




//EXPORT
export type PLAY_ACTIONS = askQuestion | answerQuestion;