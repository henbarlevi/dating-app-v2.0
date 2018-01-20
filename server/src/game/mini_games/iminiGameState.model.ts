import { GAME_TYPE } from "../models/GAME_TYPE_ENUM";

//describe the current state of the minigame
export interface iGenericMiniGameState<T extends GAME_TYPE> {
    [index: string]: any// can have any extra properties (depends on what minigame it is) https://stackoverflow.com/questions/33836671/typescript-interface-that-allows-other-properties
}