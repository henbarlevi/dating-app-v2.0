"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//====== config
const config = require("config");
const ENV = process.env.ENV || 'local';
const envConfig = config.get(ENV);
const TAG = 'GameRoomManager |';
/**handle an individual game room that contains 2 sockets of players*/
class GameRoomManager {
    constructor() {
    }
    static handle(gameRoom) {
    }
}
exports.GameRoomManager = GameRoomManager;
