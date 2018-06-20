"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*TODO - figure out a common status for client and server,
use in client to understand when user refresh to a specific page but
his game is a new session and he should be redirected to home/game in dashboard
*/
//currently in client
var GAME_STATUS;
(function (GAME_STATUS) {
    GAME_STATUS["not_playing"] = "not_playing";
    GAME_STATUS["loading_new_game"] = "loading_new_game";
    GAME_STATUS["loading_minigame"] = "loading_minigame";
    GAME_STATUS["playing"] = "playing";
    GAME_STATUS["game_ended"] = "game_ended";
    GAME_STATUS["disconnected"] = "disconnected"; //can occurr only in client
})(GAME_STATUS = exports.GAME_STATUS || (exports.GAME_STATUS = {}));
