import * as GameActions from '../_ngrx/game.actions'
import { iGameState } from "./game.reducers";
import { MINIGAME_TYPE } from "../games/logic/MINIGAME_TYPE_ENUM";
let reducers = {};
 const TAG:string ='miniGamesReducer (Container) |';

export class MinigamesReducerContainer {
    public static getReducerFunction(type: MINIGAME_TYPE) {
        return reducers[MINIGAME_TYPE[type]]
    }

    public static setReducerFunction(type: MINIGAME_TYPE, func: (state, action: GameActions.GameActions) => iGameState): void {
        console.log(TAG,`Set Reducer Function for [${MINIGAME_TYPE[type]}]`)
        reducers[MINIGAME_TYPE[type]] = func;
    }
}