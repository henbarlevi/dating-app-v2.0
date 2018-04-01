import { GAME_TYPE } from "../game.service";
import * as GameActions from '../_ngrx/game.actions'
import { iGameState } from "./game.reducers";
let reducers = {};
 const TAG:string ='miniGamesReducer (Container) |';

export class MinigamesReducerContainer {
    public static getReducerFunction(type: GAME_TYPE) {
        return reducers[GAME_TYPE[type]]
    }

    public static setReducerFunction(type: GAME_TYPE, func: (state, action: GameActions.GameActions) => iGameState): void {
        console.log(TAG,`Set Reducer Function for [${GAME_TYPE[type]}]`)
        reducers[GAME_TYPE[type]] = func;
    }
}