"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MINIGAME_STATUS_ENUM_1 = require("./MINIGAME_STATUS_ENUM");
//
class minigameLogic {
    /**
     * declare that players are ready to start the minigame
    */
    startMiniGame(currentState) {
        if (!currentState) {
            return { valid: false, state: null };
        }
        return { valid: true, state: Object.assign({}, currentState, { minigameStatus: MINIGAME_STATUS_ENUM_1.MINIGAME_STATUS.playing }) };
    }
}
exports.minigameLogic = minigameLogic;
