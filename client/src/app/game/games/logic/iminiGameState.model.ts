import { MINIGAME_STATUS } from "./MINIGAME_STATUS_ENUM";
import { MINIGAME_TYPE } from "./MINIGAME_TYPE_ENUM";

//describe the current state of the minigame
export interface iGenericMiniGameState<T extends MINIGAME_TYPE> {
    miniGameType:T,
    minigameStatus:MINIGAME_STATUS
    playersId:string[]
    //[index: string]: any// can have any extra properties (depends on what minigame it is) https://stackoverflow.com/questions/33836671/typescript-interface-that-allows-other-properties
}