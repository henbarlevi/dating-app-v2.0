"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid = require("uuid/v1"); //generate guid
//====== config
const config = require("config");
const ENV = process.env.ENV || 'local';
const envConfig = config.get(ENV);
//=======utils
const Logger_1 = require("../utils/Logger");
const TAG = 'GameSocketsManager |';
/**handle game sockets */
class GameScoketsManager {
    /**
     *
     */
    constructor(io) {
        this.io = io;
        //sockets groups
        this.waitingList = []; //waiting for partner to play
        this.gameRooms = {}; //gameRooms - Object {key:roomId,value:iGameRoom}
    }
    /**accept new socket connected
     * 1.searching for the GameScoket a partner to play
     * 2.when finding one - generate a GameRoom for them
     */
    handle(socket) {
        socket.on('disconnect', function () {
            console.log('user disconnected from game');
        });
        let partner = this.searchForPartner(socket);
        if (!partner) {
            Logger_1.Logger.d(TAG, `inserting ${socket.user.facebook ? socket.user.facebook.name : ''} to waiting list`, 'yellow');
            this.waitingList.push(socket);
        }
        else {
            //generate game room
            let gameRoom = this.generateGameRoom(socket, partner);
            this.gameRooms[3] = gameRoom;
        }
    }
    /**search partner for socket */
    searchForPartner(socket) {
        socket.emit(GAME_SOCKET_EVENTS.searchingForPlayer);
        if (this.waitingList.length === 0) {
        }
        else {
            //currently just get any random player available
            //TODO - change the search mechanism
            let partner = this.waitingList[0];
            return partner;
        }
    }
    generateGameRoom(playerOne, playerTwo) {
        let roomId = uuid();
        //insert the 2 players into the room
        playerOne.join(GAME_SOCKET_EVENTS.found_match);
        playerTwo.join(GAME_SOCKET_EVENTS.found_match);
        //tell 2 players that match is found
        this.io.to(roomId).emit(GAME_SOCKET_EVENTS.found_match);
        //generate gameRoom :
        let gameRoom = {
            roomId: roomId,
            playerOne: playerOne,
            playerTwo: playerTwo,
            gamesRemaining: 3
        };
        return gameRoom;
    }
}
exports.GameScoketsManager = GameScoketsManager;
var GAME_SOCKET_EVENTS;
(function (GAME_SOCKET_EVENTS) {
    GAME_SOCKET_EVENTS["searchingForPlayer"] = "searching_for_player";
    GAME_SOCKET_EVENTS["found_match"] = "found_match";
})(GAME_SOCKET_EVENTS = exports.GAME_SOCKET_EVENTS || (exports.GAME_SOCKET_EVENTS = {}));
