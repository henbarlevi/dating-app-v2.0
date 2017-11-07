"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//event that occurred between server and client in a game socket
var GAME_SOCKET_EVENTS;
(function (GAME_SOCKET_EVENTS) {
    GAME_SOCKET_EVENTS["searchForPartner"] = "searching_for_partner";
    GAME_SOCKET_EVENTS["found_partner"] = "found_partner";
    GAME_SOCKET_EVENTS["mini_game_ended"] = "mini_game_ended";
    GAME_SOCKET_EVENTS["init_mini_game"] = "init_mini_game";
    GAME_SOCKET_EVENTS["ready_for_mini_game"] = "ready_for_mini_game";
    GAME_SOCKET_EVENTS["partner_played"] = "partner_played";
    GAME_SOCKET_EVENTS["partner_disconnected"] = "partner_disconnected";
})(GAME_SOCKET_EVENTS = exports.GAME_SOCKET_EVENTS || (exports.GAME_SOCKET_EVENTS = {}));
