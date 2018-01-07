import { iGameSocket } from "./iGameSocket";
import { GAME_TYPE } from "./GAME_TYPE_ENUM";

export interface iGameRoom {
    roomId: any,
    // playerOne: iGameSocket, //OLD
    // playerTwo: iGameSocket, //OLD
    miniGamesRemaining: Number,
    currentGameType?:GAME_TYPE,
    players:iGameSocket[]//new
}