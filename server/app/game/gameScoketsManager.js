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
}
exports.GameScoketsManager = GameScoketsManager;
