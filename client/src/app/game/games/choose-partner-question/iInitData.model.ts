import { iQuestion } from "./questions.model";

/**minigame Initialization data transfer to each client playing the game
 * initialization data depend on the type of the minigame (poker,checkers etc)
 * this is specifically the initialization data  of [choose_partner_question] minigame 
 */
export interface iInitData{
    questions: iQuestion[],
    questionsRemaining: number,
    playersId: string[],
    firstPlayerTurnId:string
}

