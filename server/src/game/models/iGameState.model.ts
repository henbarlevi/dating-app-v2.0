/**
 * gameroom should save the current game state in case
 * user disconnected and reconnected
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


/**data about that partner that plays with the player */
export interface iPartner {
    id: string,
    name?: string,
    score?: number,
    location?: string,
    link?: string //link to his personal social page (facebook/instegram) 
}
export enum GAME_STATUS {
    start_new_game = 'start_new_game',
    loading_minigame = 'loading_minigame',
    playing = 'playing',
    game_ended = 'game_ended',
    //disconnected = 'disconnected' //only exist in client
}
//init state
export const initialState: iGameRoomState = {
    GAME_STATUS: GAME_STATUS.start_new_game,
    miniGamesRemaining: 0,
    miniGameState: null,
    players: null
}