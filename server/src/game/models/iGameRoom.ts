import { iGameSocket } from "./iGameSocket";
import { MINIGAME_TYPE } from "../mini_games/logic/MINIGAME_TYPE_ENUM";

export interface iGameRoom {
    roomId: any,
    players:iGameSocket[]
}