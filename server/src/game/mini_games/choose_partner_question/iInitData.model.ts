import { GAME_TYPE } from "../../models/GAME_TYPE_ENUM";
import { iQuestion } from "./questions.model";
import questions from "./questions";

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

