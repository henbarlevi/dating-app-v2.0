import { iGameSocket } from "./iGameSocket";
import { GAME_TYPE } from "./GAME_TYPE_ENUM";

export interface iGameRoom {
    roomId: any,
    miniGamesRemaining: number,
    currentGameType?:GAME_TYPE,
    players:iGameSocket[]
}