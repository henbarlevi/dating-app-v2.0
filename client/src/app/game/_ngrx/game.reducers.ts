
import { Action, createSelector } from '@ngrx/store';
import * as GameActions from './game.actions';
import { createFeatureSelector } from '@ngrx/store/src/selector';
import { iAppState } from '../../_ngrx/app.reducers';
import { GAME_STATUS } from '../models/GAME_STATUS_ENUM';
import { iPartner } from '../models/iPartner.model';
import { environment } from '../../../environments/environment';
import { MinigamesReducerContainer } from './minigames.reducers';
import { GAME_TYPE } from '../models/GAME_TYPE_ENUM';
const miniGamesPerGame: number = environment.miniGamesPerGame
/* === INITIAL STATE ===*/

export interface iGameState {
    GAME_STATUS: GAME_STATUS// laoding, playing, paused,game ended etc
    partners: { [partnerId: string]: iPartner } | null //the partners that playing with the player , Id's and exposed info to the player
    player:  iPartner  | null //player Id,and the current exposed info about him to his partners    
    miniGameState: any | null//the minigame state if the player inside minigame
    miniGamesRemaining: number,
    roomId: string | null //roomId of the gameroom
}
const initialState: iGameState = {
    miniGamesRemaining: 0,
    miniGameState: null,
    partners: null,
    player:null,
    GAME_STATUS: GAME_STATUS.not_playing,
    roomId: null
}
/** ==== Auth REDUCER ==== */

export function gameReducer(state = initialState, action: GameActions.GameActions): iGameState {
    switch (action.type) {
        case GameActions.START_NEW_GAME:
            return {
                ...state,
                miniGamesRemaining: miniGamesPerGame,
                GAME_STATUS: GAME_STATUS.start_new_game,
            }
        case GameActions.UPDATE_NEW_GAMEROOM_DATA:
            const payload: { roomId: string, partnersId: string[],playerId:string } = action.payload;
            const partnersId: string[] = payload.partnersId;
            let partners: { [partnerId: string]: iPartner } = {};
            partnersId.forEach((pId: string) => partners[pId] = { id: pId });
            const player :iPartner = {id:payload.playerId};
            return {
                ...state,
                roomId: payload.roomId,
                partners: partners,
                player:player
            }
        case GameActions.INITIAL_NEW_MINIGAME:
        case GameActions.UPDATE_MINIGAME:
            /*each mini game will handle the 'INITIAL_NEW_MINIGAME' and UPDATE_MINIGAME' differently
                each mini game will create its own reducer function to handle those actions.
                those functions will be stored in the MinigamesReducerContainer class
                those functions will be pulled from MinigamesReducerContainer to here to be executed
                */
            const miniGameType: GAME_TYPE = action.payload.miniGameType;
            const reducerFunc: (state, action: GameActions.GameActions) => iGameState = MinigamesReducerContainer.getReducerFunction(miniGameType);
            !reducerFunc ? console.log('%c' + `Err ===> reducerFunction for minigameType:[${miniGameType}] didnt set correctly`, 'color: red') : ''
            return reducerFunc ? reducerFunc(state, action) : state;
        case GameActions.END_GAME:
            return {
                ...initialState
            }
        case GameActions.SOCKET_DISCONNECTION:
            return {
                ...state,
                GAME_STATUS: GAME_STATUS.disconnected
            }

        default:
            return state;
    }

}


/*game - the name of the property that contain the gameReducer in the game.module | StoreModule.forFeature('game', gameReducer)
 - if component will want to recieve the gameState Observable event - he can just subscribe to getGameState
*/
export const getGameState = createFeatureSelector<iGameState>('game');

export const getMiniGameState = createSelector(getGameState,
    (state: iGameState) => state.miniGameState);


/**extended iAppState interface that include also the game state */
export interface iState extends iAppState {
    game: iGameState
}
