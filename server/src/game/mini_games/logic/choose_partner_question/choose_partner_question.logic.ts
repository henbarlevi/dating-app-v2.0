import { minigameLogic } from "../minigame.logic";
import { CHOOSE_QUESTIONS_PLAY_ACTIONS } from "./PLAY_ACTIONS_ENUM";
import { MINIGAME_STATUS } from "../MINIGAME_STATUS_ENUM";
import { iGenericMiniGameState } from "../iminiGameState.model";
import { iQuestion } from "./questions.model";
import { iPlayAction } from "../iPlayAction.model";
import { MINIGAME_TYPE } from "../MINIGAME_TYPE_ENUM";
const TAG: string = 'choose_partner_question_LOGIC';
export interface iMiniGameState extends iGenericMiniGameState<MINIGAME_TYPE.choose_partner_question> {
    currentAnswerIndex: number,//answer not yet chosen
    currentQuestionIndex: number,//question not yet chosen
    currentGameAction: CHOOSE_QUESTIONS_PLAY_ACTIONS, //game waiting for player to choose a -question
    questionsRemaining: number,
    questions: iQuestion[],
    playerTurnId: string | null
}
/**minigame Initialization data transfer to each client playing the game
 * initialization data depend on the type of the minigame (poker,checkers etc)
 * this is specifically the initialization data  of [choose_partner_question] minigame 
 */
export interface iInitData {
    questions: iQuestion[],
    questionsRemaining: number,
    playersId: string[],
    firstPlayerTurnId:string
}


export interface PlayAction extends iPlayAction<CHOOSE_QUESTIONS_PLAY_ACTIONS> {
    payload: number /**chosen question/answer Index */
}
export class choose_partner_question_logic extends minigameLogic<MINIGAME_TYPE.choose_partner_question, CHOOSE_QUESTIONS_PLAY_ACTIONS>{
    /**initialize minigame - 
     * @param initData - initializaiton data for the new miniGame (number of players etc..)
     * @returns @param valid - is the initial gameData is valid
     *          @param state - the initial state of the minigame (if input not valid - will be null)
     *          @param errText - [OPTINAL] - in case input is not valid - describe why 
     */
    public initMiniGame(initData: iInitData): { valid: boolean, state: iMiniGameState, errText?: string } {
        if (!initData || !initData.questions || !initData.questionsRemaining || !initData.playersId || initData.playersId.length < 2 || !initData.firstPlayerTurnId) {
            return { valid: false, state: null, errText: `some initial data input for the game is missing/invalid (questions/playersId/players are less then 2),` }
        }
        return {
            valid: true,
            state: {
                miniGameType: MINIGAME_TYPE.choose_partner_question,
                minigameStatus: MINIGAME_STATUS.initialization,
                currentAnswerIndex: -1,
                currentQuestionIndex: -1,
                currentGameAction: CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question,
                questionsRemaining: initData.questionsRemaining,
                questions: initData.questions,
                playersId: initData.playersId,
                playerTurnId: initData.firstPlayerTurnId,

            }
        }
    }


    /**
     * Play Action
     * @param currentState - current state of the minigame
     * @param playAction - the action player did
     * @returns @param valid - if the playAction input is valid for the current state
     *          @param state - updated state of the minigame after the action
     *          @param errText - [OPTINAL] - in case input is not valid - describe why 
     */
    play(currentState: iMiniGameState, playAction: PlayAction): { valid: boolean, state: iMiniGameState, errText?: string } {
        const playActionValidation: { valid: boolean, errText?: string } = this.ValidatePlayAction(currentState, playAction);
        if (!playActionValidation.valid) { return { ...playActionValidation, state: currentState } }
        
        else {
            switch (playAction.type) {
                /**ASK_QUESTION */
                case CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question:
                    const currentTurn: string = currentState.playerTurnId;
                    const nextTurn: string = this.getNextStringInArray(currentState.playersId, currentTurn);

                    return {
                        valid: true,
                        state: {
                            ...currentState,///...state,//assign all properties of state to the returned obj
                            currentQuestionIndex: playAction.payload,
                            //currentAnswerIndex: -1,
                            currentGameAction: CHOOSE_QUESTIONS_PLAY_ACTIONS.answer_question,
                            playerTurnId: nextTurn,
                        }
                    }
                /**ANSWER_QUESTION */
                case CHOOSE_QUESTIONS_PLAY_ACTIONS.answer_question:
                    const questionsRemaining: number = currentState.questionsRemaining-1;

                    const newState = {
                        ...currentState,
                        currentAnswerIndex: playAction.payload,
                        //currentQuestionIndex: -1,
                        currentGameAction: CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question,
                        questionsRemaining: questionsRemaining,

                    }
                    if (questionsRemaining <= 0) {
                        return this.end(newState);
                    } else {
                        return { valid: true, state: newState };
                    }

                default:
                    return { valid: false, state: currentState };
            }
        }
    }
    /**check if the playAction is valid based on the currentState of the minigame */
    private ValidatePlayAction(currentState: iMiniGameState, playActionData: PlayAction): { valid: boolean, errText?: string } {
        if (!playActionData || (!playActionData.payload && playActionData.payload !== 0)) { return { valid: false, errText: 'payload not exist' } }///TODOTODOTODO decide how client will send the play action data -currently client send the full question string but index its enough
        if (playActionData.type !== currentState.currentGameAction) { return { valid: false, errText: `playaction type not fit to currentGameAction, the playAction.type is [${CHOOSE_QUESTIONS_PLAY_ACTIONS[playActionData.type]}] but the currentGameAction is [${CHOOSE_QUESTIONS_PLAY_ACTIONS[currentState.currentGameAction]}] ` } }
        if(playActionData.playerId !==currentState.playerTurnId){return{ valid: false, errText: `Its Not this player Turn, you provided the playerId [${playActionData.playerId}] but its [${currentState.playerTurnId}] turn` }}
        //if player choose a question
        if (currentState.currentGameAction === CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question) {
            if (playActionData.type !== CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question) {
                //TODO
            }
            //check its a valid question index value:
            let chosenQuestionIndex = playActionData.payload as number;
            let questionsMaxIndex: number = currentState.questions.length - 1;//max valid index
            return !(chosenQuestionIndex < 0 || chosenQuestionIndex > questionsMaxIndex) ? { valid: true } : { valid: false, errText: 'chosenQuestionIndex not in the valid boundry' };

        } else {//if player choose an answer
            //check its a valid answer index value:
            let currentQuestionIndex = currentState.currentQuestionIndex;
            let chosenAnswerIndex = playActionData.payload as number;
            let AnswersMaxIndex: number = currentState.questions[currentQuestionIndex].a.length - 1;//max valid index
            return !(chosenAnswerIndex < 0 || chosenAnswerIndex > AnswersMaxIndex) ? { valid: true } : { valid: false, errText: 'chosenAnswerIndex not in the valid boundry' };
        }
    }
    /** @param string - string exist in an array
     * @return - the next string in the array after the provided string,
     * if its the last elemnt in the array - will return the first el in the arr
     */
    private getNextStringInArray(arr: string[], string: string) {
        const index: number = arr.findIndex(s => s === string);
        const nextIndex: number = index < (arr.length - 1) ? (index + 1) : 0;
        return arr[nextIndex];
    }
    /**Pause Minigame
     * @param currentState - current state of the minigame
     * @returns @param valid - if its valid to pause the game
     *          @param state - updated state of the minigame after pause
     *          @param errText - [OPTINAL] - in case input is not valid - describe why 
     */
    pause(currentState: iMiniGameState): { valid: boolean, state: iMiniGameState, errText?: string } {
        return { valid: true, state: { ...currentState, minigameStatus: MINIGAME_STATUS.paused } }
    }
    /** Resume to minigame (after pause)
     * @param currentState - current state of the minigame
     * @returns @param valid - if its valid to resume to game
     *          @param state - updated state of the minigame after resume
     *          @param errText - [OPTINAL] - in case input is not valid - describe why 
     */
    resume(currentState: iMiniGameState): { valid: boolean, state: iMiniGameState, errText?: string } {
        return { valid: true, state: { ...currentState, minigameStatus: MINIGAME_STATUS.paused } }

    }
    /** End the minigame 
 * @param currentState - current state of the minigame
 * @returns @param valid - if its valid to end the game
 *          @param state - updated state of the minigame after ending
 *          @param errText - [OPTINAL] - in case input is not valid - describe why 
 */
    end(currentState: iMiniGameState): { valid: boolean, state: iMiniGameState, errText?: string } {
        return { valid: true, state: { ...currentState, minigameStatus: MINIGAME_STATUS.ended } }
    }

}