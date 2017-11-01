"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//====== config
const config = require("config");
const ENV = process.env.ENV || 'local';
const envConfig = config.get(ENV);
const TAG = 'GameSocketsManager |';
/**handle game sockets */
class GameScoketsManager {
    /**
     *
     */
    constructor() {
    }
    /**accept new socket connected */
    handle(socket) {
        socket.on('disconnect', function () {
            console.log('user disconnected');
        });
        this.searchForPartner(socket);
    }
    /**search partner for socket */
    searchForPartner(socket) {
        socket.emit(GAME_SOCKET_EVENTS.searchingForPlayer);
        if (this.waitingList.length === 0) {
            this.waitingList.push(socket);
        }
        else {
            //currently just get any random player available
            let partner = this.waitingList[0];
        }
    }
}
exports.GameScoketsManager = GameScoketsManager;
var GAME_SOCKET_EVENTS;
(function (GAME_SOCKET_EVENTS) {
    GAME_SOCKET_EVENTS["searchingForPlayer"] = "searching_for_player";
})(GAME_SOCKET_EVENTS = exports.GAME_SOCKET_EVENTS || (exports.GAME_SOCKET_EVENTS = {}));
