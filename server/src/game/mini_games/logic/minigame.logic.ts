import { iPlayAction } from "./iPlayAction.model";
import { MINIGAME_STATUS } from "./MINIGAME_STATUS_ENUM";
import { iGenericMiniGameState } from "./iminiGameState.model";
import { MINIGAME_TYPE } from "./MINIGAME_TYPE_ENUM";
//
export abstract class minigameLogic<T extends MINIGAME_TYPE, GAME_ACTIONS_ENUM>{
    /**initialize minigame - 
     * @param initData - initializaiton data for the new miniGame (number of players etc..)
     * @returns @param valid - is the initial gameData is valid
     *          @param state - the initial state of the minigame (if input not valid - will be null)
     *          @param errText - [OPTINAL] - in case input is not valid - describe why 
     */
    abstract initMiniGame(initData: any): { valid: boolean, state: iGenericMiniGameState<T>, errText?: string }

    /** 
     * declare that players are ready to start the minigame
    */
    startMiniGame(currentState: iGenericMiniGameState<T>): { valid: boolean, state: iGenericMiniGameState<T>, errText?: string } {
        if (!currentState) {
            return { valid: false, state: null }
        }
        return { valid: true, state: { ...currentState, minigameStatus: MINIGAME_STATUS.playing } }
    }

    /**
     * Play Action
     * @param currentState - current state of the minigame
     * @param playAction - the action player did
     * @returns @param valid - if the playAction input is valid for the current state
     *          @param state - updated state of the minigame after the action
     *          @param errText - [OPTINAL] - in case input is not valid - describe why 
     */
    abstract play(currentState: iGenericMiniGameState<T>, playAction: iPlayAction<GAME_ACTIONS_ENUM>): { valid: boolean, state: iGenericMiniGameState<T>,errText?: string }
    /**Pause Minigame
     * @param currentState - current state of the minigame
     * @returns @param valid - if its valid to pause the game
     *          @param state - updated state of the minigame after pause
     *          @param errText - [OPTINAL] - in case input is not valid - describe why     
     */
    abstract pause(currentState: iGenericMiniGameState<T>): { valid: boolean, state: iGenericMiniGameState<T>,errText?: string }
    /** Resume to minigame (after pause)
     * @param currentState - current state of the minigame
     * @returns @param valid - if its valid to resume to game
     *          @param state - updated state of the minigame after resume
     *          @param errText - [OPTINAL] - in case input is not valid - describe why 
     */
    abstract resume(currentState: iGenericMiniGameState<T>): { valid: boolean, state: iGenericMiniGameState<T> ,errText?: string}
    /** End the minigame 
     * @param currentState - current state of the minigame
     * @returns @param valid - if its valid to end the game
     *          @param state - updated state of the minigame after ending  
     *          @param errText - [OPTINAL] - in case input is not valid - describe why 
     */
    abstract end(currentState: iGenericMiniGameState<T>): { valid: boolean, state: iGenericMiniGameState<T>,errText?: string }
}