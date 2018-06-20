import { iPartner } from "./iPartner.model";
import { GAME_STATUS } from "./GAME_STATUS.enum";

/**
 * gameroom should save the current game state in case
 * user disconnected temporarly and reconnected
   this is the format the gameroom should save the state
 */
export interface iGameRoomState {
    GAME_STATUS: GAME_STATUS// laoding, playing, paused,game ended etc
    players: { [partnerId: string]: iPartner } | null //each player id + his exposed data to his partners
    miniGameState: any | null//the minigame state if the player inside minigame
    miniGamesRemaining: number,
}

/**this is the format the user should get the state when reconnected */
export interface iClientGameState {
    GAME_STATUS: GAME_STATUS// laoding, playing, paused,game ended etc
    partners: { [partnerId: string]: iPartner } | null //the partners that playing with the player Id's and the exposed info to the player about them
    player: iPartner | null //player Id,and the current exposed info about him to his partners    
    miniGameState: any | null//the minigame state if the player inside minigame
    miniGamesRemaining: number,
}

//init state
export const initialState: iGameRoomState = {
    GAME_STATUS: GAME_STATUS.loading_new_game,
    miniGamesRemaining: 0,
    miniGameState: null,
    players: null
}