"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GAME_STATUS;
(function (GAME_STATUS) {
    GAME_STATUS[GAME_STATUS["not_playing"] = 0] = "not_playing";
    GAME_STATUS[GAME_STATUS["searching_player"] = 1] = "searching_player";
    GAME_STATUS[GAME_STATUS["playing"] = 2] = "playing";
    GAME_STATUS[GAME_STATUS["game_ended"] = 3] = "game_ended";
})(GAME_STATUS = exports.GAME_STATUS || (exports.GAME_STATUS = {}));
