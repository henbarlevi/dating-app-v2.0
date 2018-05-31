"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minigame_logic_1 = require("../minigame.logic");
const PLAY_ACTIONS_ENUM_1 = require("./PLAY_ACTIONS_ENUM");
const MINIGAME_STATUS_ENUM_1 = require("../MINIGAME_STATUS_ENUM");
const MINIGAME_TYPE_ENUM_1 = require("../MINIGAME_TYPE_ENUM");
const TAG = 'choose_partner_question_LOGIC';
class choose_partner_question_logic extends minigame_logic_1.minigameLogic {
    /**initialize minigame -
     * @param initData - initializaiton data for the new miniGame (number of players etc..)
     * @returns @param valid - is the initial gameData is valid
     *          @param state - the initial state of the minigame (if input not valid - will be null)
     *          @param errText - [OPTINAL] - in case input is not valid - describe why
     */
    initMiniGame(initData) {
        if (!initData || !initData.questions || !initData.questionsRemaining || !initData.playersId || initData.playersId.length < 2 || !initData.firstPlayerTurnId) {
            return { valid: false, state: null, errText: `some initial data input for the game is missing/invalid (questions/playersId/players are less then 2),` };
        }
        return {
            valid: true,
            state: {
                miniGameType: MINIGAME_TYPE_ENUM_1.MINIGAME_TYPE.choose_partner_question,
                minigameStatus: MINIGAME_STATUS_ENUM_1.MINIGAME_STATUS.initialization,
                currentAnswerIndex: -1,
                //currentQuestionIndex: -1,
                currentQuestion: null,
                currentGameAction: PLAY_ACTIONS_ENUM_1.CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question,
                questionsRemaining: initData.questionsRemaining,
                questions: initData.questions,
                playersId: initData.playersId,
                playerTurnId: initData.firstPlayerTurnId,
            }
        };
    }
    /**
     * Play Action
     * @param currentState - current state of the minigame
     * @param playAction - the action player did
     * @returns @param valid - if the playAction input is valid for the current state
     *          @param state - updated state of the minigame after the action
     *          @param errText - [OPTINAL] - in case input is not valid - describe why
     */
    play(currentState, playAction) {
        const playActionValidation = this.ValidatePlayAction(currentState, playAction);
        if (!playActionValidation.valid) {
            return Object.assign({}, playActionValidation, { state: currentState });
        }
        else {
            switch (playAction.type) {
                /**ASK_QUESTION */
                case PLAY_ACTIONS_ENUM_1.CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question:
                    const currentTurn = currentState.playerTurnId;
                    const nextTurn = this.getNextStringInArray(currentState.playersId, currentTurn);
                    const chosenQuestionIndex = playAction.payload;
                    const chosenQuestion = currentState.questions[chosenQuestionIndex];
                    const questions = currentState.questions.filter(q => q.q !== chosenQuestion.q); // remove the chosen question from arr
                    //
                    return {
                        valid: true,
                        state: Object.assign({}, currentState, { 
                            //currentQuestionIndex: playAction.payload,
                            currentQuestion: chosenQuestion, currentAnswerIndex: -1, currentGameAction: PLAY_ACTIONS_ENUM_1.CHOOSE_QUESTIONS_PLAY_ACTIONS.answer_question, playerTurnId: nextTurn, questions: questions })
                    };
                /**ANSWER_QUESTION */
                case PLAY_ACTIONS_ENUM_1.CHOOSE_QUESTIONS_PLAY_ACTIONS.answer_question:
                    const questionsRemaining = currentState.questionsRemaining - 1;
                    const newState = Object.assign({}, currentState, { currentAnswerIndex: playAction.payload, 
                        //currentQuestionIndex: -1,
                        currentGameAction: PLAY_ACTIONS_ENUM_1.CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question, questionsRemaining: questionsRemaining });
                    if (questionsRemaining <= 0) {
                        return this.end(newState);
                    }
                    else {
                        return { valid: true, state: newState };
                    }
                default:
                    return { valid: false, state: currentState };
            }
        }
    }
    /**check if the playAction is valid based on the currentState of the minigame */
    ValidatePlayAction(currentState, playActionData) {
        if (!playActionData || (!playActionData.payload && playActionData.payload !== 0)) {
            return { valid: false, errText: 'payload not exist' };
        } ///TODOTODOTODO decide how client will send the play action data -currently client send the full question string but index its enough
        if (playActionData.type !== currentState.currentGameAction) {
            return { valid: false, errText: `playaction type not fit to currentGameAction, the playAction.type is [${PLAY_ACTIONS_ENUM_1.CHOOSE_QUESTIONS_PLAY_ACTIONS[playActionData.type]}] but the currentGameAction is [${PLAY_ACTIONS_ENUM_1.CHOOSE_QUESTIONS_PLAY_ACTIONS[currentState.currentGameAction]}] ` };
        }
        if (playActionData.playerId !== currentState.playerTurnId) {
            return { valid: false, errText: `Its Not this player Turn, you provided the playerId [${playActionData.playerId}] but its [${currentState.playerTurnId}] turn` };
        }
        //if player choose a question
        if (currentState.currentGameAction === PLAY_ACTIONS_ENUM_1.CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question) {
            if (playActionData.type !== PLAY_ACTIONS_ENUM_1.CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question) {
                //TODO
            }
            //check its a valid question index value:
            let chosenQuestionIndex = playActionData.payload;
            let questionsMaxIndex = currentState.questions.length - 1; //max valid index
            return !(chosenQuestionIndex < 0 || chosenQuestionIndex > questionsMaxIndex) ? { valid: true } : { valid: false, errText: 'chosenQuestionIndex not in the valid boundry' };
        }
        else {
            //check its a valid answer index value:
            const chosenAnswerIndex = playActionData.payload;
            const AnswersMaxIndex = currentState.currentQuestion.a.length - 1; //max valid index
            return !(chosenAnswerIndex < 0 || chosenAnswerIndex > AnswersMaxIndex) ? { valid: true } : { valid: false, errText: 'chosenAnswerIndex not in the valid boundry' };
        }
    }
    /** @param string - string exist in an array
     * @return - the next string in the array after the provided string,
     * if its the last elemnt in the array - will return the first el in the arr
     */
    getNextStringInArray(arr, string) {
        const index = arr.findIndex(s => s === string);
        const nextIndex = index < (arr.length - 1) ? (index + 1) : 0;
        return arr[nextIndex];
    }
    /**Pause Minigame
     * @param currentState - current state of the minigame
     * @returns @param valid - if its valid to pause the game
     *          @param state - updated state of the minigame after pause
     *          @param errText - [OPTINAL] - in case input is not valid - describe why
     */
    pause(currentState) {
        return { valid: true, state: Object.assign({}, currentState, { minigameStatus: MINIGAME_STATUS_ENUM_1.MINIGAME_STATUS.paused }) };
    }
    /** Resume to minigame (after pause)
     * @param currentState - current state of the minigame
     * @returns @param valid - if its valid to resume to game
     *          @param state - updated state of the minigame after resume
     *          @param errText - [OPTINAL] - in case input is not valid - describe why
     */
    resume(currentState) {
        return { valid: true, state: Object.assign({}, currentState, { minigameStatus: MINIGAME_STATUS_ENUM_1.MINIGAME_STATUS.paused }) };
    }
    /** End the minigame
 * @param currentState - current state of the minigame
 * @returns @param valid - if its valid to end the game
 *          @param state - updated state of the minigame after ending
 *          @param errText - [OPTINAL] - in case input is not valid - describe why
 */
    end(currentState) {
        return { valid: true, state: Object.assign({}, currentState, { minigameStatus: MINIGAME_STATUS_ENUM_1.MINIGAME_STATUS.ended }) };
    }
}
exports.choose_partner_question_logic = choose_partner_question_logic;
