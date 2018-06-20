"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//event names that occurred between server and client in a game socket
var GAME_SOCKET_EVENTS;
(function (GAME_SOCKET_EVENTS) {
    /**connection | disconnection */
    GAME_SOCKET_EVENTS["disconnect"] = "disconnect";
    GAME_SOCKET_EVENTS["connection"] = "connection";
    GAME_SOCKET_EVENTS["leave_game"] = "leave_game";
    GAME_SOCKET_EVENTS["partner_left_game"] = "partner_left_game";
    GAME_SOCKET_EVENTS["partner_disconnected"] = "partner_disconnected";
    GAME_SOCKET_EVENTS["partner_reconnection_time_ended"] = "partner_reconnection_time_ended";
    GAME_SOCKET_EVENTS["partner_reconnected"] = "partner_reconnected";
    /**general game events */
    GAME_SOCKET_EVENTS["game_ended"] = "game_ended";
    GAME_SOCKET_EVENTS["partner_info_exposed"] = "partner_info_exposed";
    /** search for game*/
    GAME_SOCKET_EVENTS["searchForPartner"] = "searching_for_partner";
    GAME_SOCKET_EVENTS["found_partner"] = "found_partner";
    /**mini game */
    GAME_SOCKET_EVENTS["mini_game_ended"] = "mini_game_ended";
    GAME_SOCKET_EVENTS["init_mini_game"] = "init_mini_game";
    /**ready */
    GAME_SOCKET_EVENTS["ready_for_mini_game"] = "ready_for_mini_game";
    GAME_SOCKET_EVENTS["ready"] = "ready";
    /**turn - 3 options */
    GAME_SOCKET_EVENTS["player_turn"] = "player_turn";
    GAME_SOCKET_EVENTS["your_turn"] = "your_turn";
    GAME_SOCKET_EVENTS["partner_turn"] = "partner_turn";
    GAME_SOCKET_EVENTS["partner_played"] = "partner_played";
    GAME_SOCKET_EVENTS["play"] = "play";
    //edge cases
    GAME_SOCKET_EVENTS["already_connected"] = "already_connected";
    GAME_SOCKET_EVENTS["reconnection_data"] = "reconnection_data"; //server tell user that he has reconnted to game along with the current gamestate details
})(GAME_SOCKET_EVENTS = exports.GAME_SOCKET_EVENTS || (exports.GAME_SOCKET_EVENTS = {}));
