/** actions have:
 * 1.type = the name/type of the action
 * 2.payload = OPTIONAL - more data about the action (for example ADD_MOVIE - the payload will be the added movie object)
 */
import { Action } from '@ngrx/store';
import { GAME_TYPE } from '../models/GAME_TYPE_ENUM';
import { iPlayAction } from '../games/logic/iPlayAction.model';
import { GAME_SOCKET_EVENTS } from '../models/GAME_SOCKET_EVENTS.enum';
import { iGameState } from './game.reducers';
/* ==== ACTIONS ====*/

// ------ player perss the 'Play Game' Button
export const START_NEW_GAME: string = 'START_NEW_GAME';
export class StartNewGame implements Action {
    readonly type = START_NEW_GAME;
    constructor(public payload?: any) { }
}
// ------ after gameroom established in server - client get the roomId and partnersId // TODO - CHECK IF NOT IN USE
export const UPDATE_NEW_GAMEROOM_DATA: string = 'UPDATE_NEW_GAMEROOM_DATA';
export class updateNewGameroomData implements Action {
    readonly type = UPDATE_NEW_GAMEROOM_DATA;
    constructor(public payload: { roomId: string, partnersId: string[] ,playerId:string}) { }
}

// ------ after client temporarly disconnected and reconnected - the server will send the state of the game (client can reconnect from anther device will not have cached data) 
export const SET_RECONNECTED_GAMEDATA: GAME_SOCKET_EVENTS = GAME_SOCKET_EVENTS.reconnection_data;
export class setReconnectedGameData implements Action {
    readonly type = SET_RECONNECTED_GAMEDATA;
    constructor(public payload: iGameState) { }
}
// ------ player perss the 'Play Game' Button
export const UPDATE_PARTNERS_DATA: string = 'UPDATE_PARTNERS_DATA';
export class updatePartnersData implements Action {
    readonly type = UPDATE_PARTNERS_DATA;
    constructor(public payload: any) { }
}

// ------ starting new mini game with initial minigame state
export const INITIAL_NEW_MINIGAME: string = 'INITIAL_NEW_MINIGAME';
export class initalNewMinigame implements Action {
    readonly type = INITIAL_NEW_MINIGAME;
    constructor(public payload: { miniGameType: GAME_TYPE, initialData: any }) { }
}

// ------ update the state of the minigame
export const UPDATE_MINIGAME: string = 'UPDATE_MINIGAME';
export class updateMinigame implements Action {
    readonly type = UPDATE_MINIGAME;
    constructor(public payload: { miniGameType: GAME_TYPE, playAction: iPlayAction<any> }) { }
}

// ------ game ended
export const END_GAME: string = 'END_GAME';
export class EndGame implements Action {
    readonly type = END_GAME;
    constructor(public payload?: string) { }
}


/* ------ 
user disconnected from gamesocket by server /
user has internet problem
*/
export const SOCKET_DISCONNECTION: string = 'SOCKET_DISCONNECTION';
export class socketDisconnection implements Action {
    readonly type = SOCKET_DISCONNECTION;
    constructor(public payload?: any) { }
}

/// EXPORT
export type GameActions = StartNewGame | updateNewGameroomData | initalNewMinigame | updateMinigame | EndGame | socketDisconnection | setReconnectedGameData