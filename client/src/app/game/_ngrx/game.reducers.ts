
import { Action, createSelector } from '@ngrx/store';
import * as GameActions from './game.actions';
import { createFeatureSelector } from '@ngrx/store/src/selector';
import { iAppState } from '../../_ngrx/app.reducers';
import { GAME_STATUS } from '../models/GAME_STATUS.enum';
import { iPartner } from '../models/iPartner.model';
import { environment } from '../../../environments/environment';
import { MinigamesReducerContainer } from './minigames.reducers';

import { iGenericMiniGameState } from '../games/logic/iminiGameState.model';
import { MINIGAME_TYPE } from '../games/logic/MINIGAME_TYPE_ENUM';
import { partner_info_exposed_PAYLOAD } from '../models/GAME_SOCKET_EVENTS.enum';
//const miniGamesPerGame: number = environment.miniGamesPerGame
/* === INITIAL STATE ===*/

export interface iGameState {
    GAME_STATUS: GAME_STATUS// laoding, playing, paused,game ended etc
    partners: { [partnerId: string]: iPartner } | null //the partners that playing with the player , Id's and exposed info to the player
    player: iPartner | null //player Id,and the current exposed info about him to his partners    
    miniGameState: any | null//the minigame state if the player inside minigame
    miniGamesRemaining: number,
    //  roomId: string | null //roomId of the gameroom
}
const initialState: iGameState = {
    miniGamesRemaining: 0,
    miniGameState: null,
    partners: null,
    player: null,
    GAME_STATUS: GAME_STATUS.not_playing,
    // roomId: null
}
/**====================== 
   ==== Game REDUCER ====
   ====================== 
  */
//#region gameReducerMap   
const gameReducerMap: Map<string, Function> = new Map();//instead of using switch case for the gameReducer
/*case GameActions.START_NEW_GAME:*/
gameReducerMap.set(GameActions.START_NEW_GAME,
    (state: iGameState, action: GameActions.GameActions) => {
        return {
            ...state,
            miniGamesRemaining: 3,//TODOTODO
            GAME_STATUS: GAME_STATUS.loading_new_game,
        }
    });
/*case GameActions.UPDATE_NEW_GAMEROOM_DATA:*/
gameReducerMap.set(GameActions.UPDATE_NEW_GAMEROOM_DATA,
    (state: iGameState, action: GameActions.GameActions) => {
        const payload: { /*roomId: string,*/ partnersId: string[], playerId: string } = action.payload;
        const partnersId: string[] = payload.partnersId;
        let partners: { [partnerId: string]: iPartner } = {};
        partnersId.forEach((pId: string) => partners[pId] = { id: pId });
        const player: iPartner = { id: payload.playerId };
        return {
            ...state,
            //  roomId: payload.roomId,
            partners: partners,
            player: player
        }
    });
/*case GameActions.UPDATE_PARTNERS_DATA:     */
gameReducerMap.set(GameActions.UPDATE_PARTNERS_DATA,
    (state: iGameState, action: GameActions.GameActions) => {
        //TODO - check naming is current and make separte method for each case
        //so ill be able to use the same var names (payload, partners etc..)
        const payload: partner_info_exposed_PAYLOAD = action.payload;
        const exposedPartnerId:string = payload.playerId;
        const player: iPartner = { ...state.player };//current player info exposed
        //check if info exposed is of player or his partners :
        if (player.id === exposedPartnerId) {
            console.log('exposed partner is the player');
            player[payload.infoPropExposed] = payload.infoPropValue;
            return{
                ...state,
                player:player
            }
        } else {
            console.log('exposed partner is NOT the player');            
            const partners: { [partnerId: string]: iPartner } = {...state.partners};//current partners info exposed
            if(!partners[exposedPartnerId]){throw new Error('Emited partner_info_exposed of partner id that does not exist in client');}
            const partnerExposed:iPartner = {...partners[exposedPartnerId]};
            partnerExposed[payload.infoPropExposed.toString()] = payload.infoPropValue;
            partners[exposedPartnerId]=partnerExposed;            
            return {
                ...state,
                partners: partners
            }
        }
    });
/*case GameActions.SET_RECONNECTED_GAMEDATA:*/
gameReducerMap.set(GameActions.SET_RECONNECTED_GAMEDATA,
    (state: iGameState, action: GameActions.GameActions) => {
        return {
            ...state,//not sure if necessary
            ...action.payload
        }
    });
/*case GameActions.INITIAL_NEW_MINIGAME:*/
/*case GameActions.UPDATE_MINIGAME:*/
var minigameActionHandler = (state: iGameState, action: GameActions.GameActions) => {
    /*each mini game will handle the 'INITIAL_NEW_MINIGAME' and UPDATE_MINIGAME' differently
        each mini game will create its own reducer function to handle those actions.
        those functions will be stored in the MinigamesReducerContainer class
        those functions will be pulled from MinigamesReducerContainer to here to be executed
        */
    const miniGameType: MINIGAME_TYPE = action.payload.miniGameType;
    const reducerFunc: (state, action: GameActions.GameActions) => iGameState = MinigamesReducerContainer.getReducerFunction(miniGameType);
    !reducerFunc ? console.log('%c' + `Err ===> reducerFunction for minigameType:[${miniGameType}] didnt set correctly`, 'color: red') : ''
    return reducerFunc ? reducerFunc(state, action) : state;};
gameReducerMap.set(GameActions.INITIAL_NEW_MINIGAME, minigameActionHandler);
gameReducerMap.set(GameActions.UPDATE_MINIGAME, minigameActionHandler);
/*case GameActions.END_MINIGAME:*/
gameReducerMap.set(GameActions.END_MINIGAME,
    (state: iGameState, action: GameActions.GameActions) => {
        return {
            ...state,
            miniGamesRemaining: state.miniGamesRemaining - 1,
            miniGameState: null
        }
    });
/*case GameActions.END_GAME:*/
gameReducerMap.set(GameActions.END_GAME,
    (state: iGameState, action: GameActions.GameActions) => {
        return {
            ...state,
            GAME_STATUS: GAME_STATUS.game_ended
        }
    });
/*case GameActions.SOCKET_DISCONNECTION:*/
gameReducerMap.set(GameActions.SOCKET_DISCONNECTION,
    (state: iGameState, action: GameActions.GameActions) => {
        return {
            ...state,
            GAME_STATUS: GAME_STATUS.disconnected
        }
    });
//#endregion
export function gameReducer(state = initialState, action: GameActions.GameActions): iGameState {
    var handler:Function = gameReducerMap.get(action.type);
    if(!handler){
        return state;
    }
    return handler(state,action);
}
/**
 * ===============================================
 * EXPORT gameState & miniGameState Observables
 * ===============================================
 */

/*game - the name of the property that contain the gameReducer in the game.module | StoreModule.forFeature('game', gameReducer)
 - if component will want to recieve the gameState Observable event - he can just subscribe to getGameState
*/
export const getGameState = createFeatureSelector<iGameState>('game');

export const getMiniGameState = createSelector(getGameState,
    (state: iGameState) => state.miniGameState);

/**
 * ===============================================
 * Extend AppState interface
 * ===============================================
 */

/**extended iAppState interface so that will include also the game state */
export interface iState extends iAppState {
    game: iGameState
}


/**
 * SNIPPETS
    switch (action.type) {
        case GameActions.START_NEW_GAME:
            return {
                ...state,
                miniGamesRemaining: 3,//TODOTODO
                GAME_STATUS: GAME_STATUS.start_new_game,
            }
        case GameActions.UPDATE_NEW_GAMEROOM_DATA:
            const payload: {  partnersId: string[], playerId: string } = action.payload;
            const partnersId: string[] = payload.partnersId;
            let partners: { [partnerId: string]: iPartner } = {};
            partnersId.forEach((pId: string) => partners[pId] = { id: pId });
            const player: iPartner = { id: payload.playerId };
            return {
                ...state,
                //  roomId: payload.roomId,
                partners: partners,
                player: player
            }
        case GameActions.UPDATE_PARTNERS_DATA:
            //TODO - check naming is current and make separte method for each case
            //so ill be able to use the same var names (payload, partners etc..)
            const _payload: partner_info_exposed_PAYLOAD = action.payload;
            let _player: iPartner = { ...state.player };//current player info exposed
            //check if info exposed is of player or his partners :
            if (_player.id === _payload.playerId) {
                _player[_payload.infoPropExposed] = _payload.infoPropValue;
            } else {
                let _partners: { [partnerId: string]: iPartner } = { ...state.partners };//current partners info exposed
                _partners[_payload.playerId][_payload.infoPropExposed] = _payload.infoPropValue;
                return {
                    ...state,
                    partners: _partners
                }
            }

        case GameActions.SET_RECONNECTED_GAMEDATA:
            return {
                ...state,//not sure if necessary
                ...action.payload
            }
        case GameActions.INITIAL_NEW_MINIGAME:
        case GameActions.UPDATE_MINIGAME:

            const miniGameType: MINIGAME_TYPE = action.payload.miniGameType;
            const reducerFunc: (state, action: GameActions.GameActions) => iGameState = MinigamesReducerContainer.getReducerFunction(miniGameType);
            !reducerFunc ? console.log('%c' + `Err ===> reducerFunction for minigameType:[${miniGameType}] didnt set correctly`, 'color: red') : ''
            return reducerFunc ? reducerFunc(state, action) : state;
        case GameActions.END_MINIGAME:
            return {
                ...state,
                miniGamesRemaining: state.miniGamesRemaining - 1,
                miniGameState: null
            }

        case GameActions.END_GAME:
            return {
                ...state,
                GAME_STATUS: GAME_STATUS.game_ended
            }
        case GameActions.SOCKET_DISCONNECTION:
            return {
                ...state,
                GAME_STATUS: GAME_STATUS.disconnected
            }

        default:
            return state;
    } 
 */