"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GAME_STATUS_enum_1 = require("./GAME_STATUS.enum");
//init state
exports.initialState = {
    GAME_STATUS: GAME_STATUS_enum_1.GAME_STATUS.loading_new_game,
    miniGamesRemaining: 0,
    miniGameState: null,
    players: null
};
