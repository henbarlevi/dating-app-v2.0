import { iGameState } from "../../../_ngrx/game.reducers";
import * as GameActions from "../../../_ngrx/game.actions";
import { MinigamesReducer } from "../../../_ngrx/minigames.reducers";
import { GAME_TYPE } from "../../../models/GAME_TYPE_ENUM";
import { CHOOSE_QUESTIONS_PLAY_ACTIONS } from "../models/PLAY_ACTIONS_ENUM.enum";
import { iGenericMiniGameState } from "../../minigameState.model";
import { iQuestion } from "../questions.model";
import { iPlayAction } from "../../../models/iPlayData";
import { initalNewMinigame } from "../../../_ngrx/game.actions";
const NumberOfQuestionsPerGame: number = 7;

//mini game initial state
export const initialState: iMiniGameState = {
    miniGameType: GAME_TYPE.choose_partner_question,
    currentAnswerIndex: -1,//answer not yet chosen
    currentQuestionIndex: -1,//question not yet chosen
    currentGameAction: CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question, //game waiting for player to choose a -question
    questionsRemaining: NumberOfQuestionsPerGame,
    questions: [],
    answers: []
}


export interface iMiniGameState extends iGenericMiniGameState<GAME_TYPE.choose_partner_question> {
    currentAnswerIndex: -1,//answer not yet chosen
    currentQuestionIndex: -1,//question not yet chosen
    currentGameAction: CHOOSE_QUESTIONS_PLAY_ACTIONS, //game waiting for player to choose a -question
    questionsRemaining: number,
    questions: iQuestion[],
    answers: string[]
}

export function minigameReducer(state: iGameState, action: GameActions.GameActions): iGameState {
    console.log('%c' + `CHANGING MINIGAME STATE `, 'color: red');//TODELETE

    switch (action.type) {
        /**INITIAL_NEW_MINIGAME */
        case GameActions.INITIAL_NEW_MINIGAME:
            const payload = (action as initalNewMinigame).payload;
            return {
                ...state,
                miniGameState: {
                    ...initialState,
                    miniGameType: payload.miniGameType,
                    questions: payload.initialData
                }
            }
        /**UPDATE_MINIGAME */
        case GameActions.UPDATE_MINIGAME:
            const playAction: iPlayAction<CHOOSE_QUESTIONS_PLAY_ACTIONS> = action.payload.playAction;
            if (playAction.type === CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question) {
                const chosenQuestionIndex: number = playAction.payload;
                const answers: string[] = state.miniGameState.questions[chosenQuestionIndex].a;
                const miniGameState = {
                    ...state.miniGameState,
                    currentQuestionIndex: chosenQuestionIndex,
                    currentAnswerIndex: -1,
                    currentGameAction: CHOOSE_QUESTIONS_PLAY_ACTIONS.answer_question,
                    answers: answers
                }
                return {
                    ...state,
                    miniGameState: miniGameState
                }
            } else if (playAction.type === CHOOSE_QUESTIONS_PLAY_ACTIONS.answer_question) {
                const questionsRemaining: number = state.miniGameState.questionsRemaining - 1;
                const chosenAnswerIndex: number = playAction.payload;
                const miniGameState :iMiniGameState= {
                    ...state.miniGameState,
                    currentAnswerIndex: playAction.payload,
                    currentQuestionIndex: -1,
                    questionsRemaining: questionsRemaining,
                    currentGameAction: CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question
                }
                return {
                    ...state,
                    miniGameState: miniGameState
                }
            } else {
                console.log('%c' + `playAction.type is not answer_question/ask_question `, 'color: red');

            }

        /**DEFAULT */
        default:
            console.log('%c' + `[WARNING] - minigameReducer of [choose_questions] received the action [${action.type}] but didnt changed the state `, 'color: red');
            return state;

    }
}

/**IMPORTANT! SET REDUCER IN THIS CONTIANER so it could be available in the gameRducer */
MinigamesReducer.setReducerFunction(GAME_TYPE.choose_partner_question, minigameReducer);


