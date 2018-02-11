import { GAME_TYPE } from "../../models/GAME_TYPE_ENUM";
import { iQuestion } from "./questions.model";

/**minigame Initialization data transfer to each client playing the game
 * initialization data depend on the type of the minigame (poker,checkers etc)
 * this is specifically the initialization data  of [choose_partner_question] minigame 
 */
export interface iInitData{
    miniGameType: GAME_TYPE.choose_partner_question,
    initialData: {
        questions:iQuestion[],
        questionsPerGame:number
    }
}

