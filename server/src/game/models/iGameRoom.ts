import { iGameSocket } from "./iGameSocket";
import { GAME_TYPE } from "./iGameType";

export interface iGameRoom {
    roomId: any,
    playerOne: iGameSocket,
    playerTwo: iGameSocket,
    gamesRemaining: Number,
    currentGameType?:GAME_TYPE
}