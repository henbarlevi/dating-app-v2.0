"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GAME_STATUS;
(function (GAME_STATUS) {
    GAME_STATUS["start_new_game"] = "start_new_game";
    GAME_STATUS["loading_minigame"] = "loading_minigame";
    GAME_STATUS["playing"] = "playing";
    GAME_STATUS["game_ended"] = "game_ended";
    //disconnected = 'disconnected' //only exist in client
})(GAME_STATUS = exports.GAME_STATUS || (exports.GAME_STATUS = {}));
//init state
exports.initialState = {
    GAME_STATUS: GAME_STATUS.start_new_game,
    miniGamesRemaining: 0,
    miniGameState: null,
    players: null
};
