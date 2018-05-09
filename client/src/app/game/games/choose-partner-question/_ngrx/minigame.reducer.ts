import { iGameState } from "../../../_ngrx/game.reducers";
import * as GameActions from "../../../_ngrx/game.actions";
import { MinigamesReducerContainer } from "../../../_ngrx/minigames.reducers";
import { CHOOSE_QUESTIONS_PLAY_ACTIONS } from "../models/PLAY_ACTIONS_ENUM.enum";
import { iQuestion } from "../questions.model";
import { initalNewMinigame } from "../../../_ngrx/game.actions";
import { iGenericMiniGameState } from "../../logic/iminiGameState.model";
//logic
import { PlayAction, iMiniGameState, iInitData, choose_partner_question_logic } from '../../logic/choose_partner_question/choose_partner_question.logic';
const logic = new choose_partner_question_logic();




export function minigameReducer(state: iGameState, action: GameActions.GameActions): iGameState {

    switch (action.type) {
        /**INITIAL_NEW_MINIGAME */
        case GameActions.INITIAL_NEW_MINIGAME:
            const initdata: iInitData = (action as initalNewMinigame).payload.initialData;
            const result = logic.initMiniGame(initdata);
            !result.valid ? console.log('%c' + `Err ===> logic class received invalid input for .initMiniGame - ErrText:[${result.errText}]`, 'color: red') : '';
            const miniGameState: iMiniGameState = result.state;
            return {
                ...state,

                miniGameState: miniGameState
            }
        /**UPDATE_MINIGAME */
        case GameActions.UPDATE_MINIGAME:

            const playAction: PlayAction = action.payload.playAction;
            const updateResult = logic.play(state.miniGameState,playAction);
            !updateResult.valid ? console.log('%c' + `Err ===> logic class received invalid input for .play - ErrText:[${updateResult.errText}]`, 'color: red') : '';
            const updatedMinigameState: iMiniGameState = updateResult.state;
            return {
                ...state,
                miniGameState: updatedMinigameState
            }
        /**DEFAULT */
        default:
            console.log('%c' + `[WARNING] - minigameReducer of [choose_questions] received the action [${action.type}] but didnt changed the state `, 'color: red');
            return state;

    }
}
