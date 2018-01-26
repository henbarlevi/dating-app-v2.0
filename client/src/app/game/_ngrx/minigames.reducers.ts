import { GAME_TYPE } from "../game.service";
import * as GameActions from '../_ngrx/game.actions'
import { iGameState } from "./game.reducers";
let reducers = {};
 

export class MinigamesReducer {
    public static getReducerFunction(type: GAME_TYPE) {
        return reducers[GAME_TYPE[type]]
    }

    public static setReducerFunction(type: GAME_TYPE, func: (state, action: GameActions.GameActions) => iGameState): void {
        reducers[GAME_TYPE[type]] = func;
    }
}