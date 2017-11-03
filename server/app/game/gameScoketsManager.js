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
        socket.emit(GAME_SOCKET_EVENTS.searchForPartner);
        let partner = this.searchForPartner(socket);
        if (!partner) {
            Logger_1.Logger.d(TAG, `inserting ${socket.user.facebook ? socket.user.facebook.name : ''} to waiting list`, 'yellow');
            this.waitingList.push(socket);
        }
        else {
            //generate game room
            let gameRoom = this.generateGameRoom(socket, partner);
            //insert the 2 players into the room
            socket.join(gameRoom.roomId);
            partner.join(gameRoom.roomId);
            //tell 2 players that match is found
            this.io.to(gameRoom.roomId).emit(GAME_SOCKET_EVENTS.found_partner);
            //if one of the players disconnected, tell the other user about it
            this.io.to(gameRoom.roomId).on('disconnect', (socket) => {
                socket.broadcast.to(gameRoom.roomId).emit(GAME_SOCKET_EVENTS.partner_disconnected);
            });
            this.gameRooms[gameRoom.roomId] = gameRoom;
        }
    }
    /**search partner for socket */
    searchForPartner(socket) {
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
        //generate gameRoom :
        let gameRoom = {
            roomId: roomId,
            playerOne: playerOne,
            playerTwo: playerTwo,
            miniGamesRemaining: 3
        };
        return gameRoom;
    }
}
exports.GameScoketsManager = GameScoketsManager;
var GAME_SOCKET_EVENTS;
(function (GAME_SOCKET_EVENTS) {
    GAME_SOCKET_EVENTS["searchForPartner"] = "searching_for_partner";
    GAME_SOCKET_EVENTS["found_partner"] = "found_partner";
    GAME_SOCKET_EVENTS["partner_played"] = "partner_played";
    GAME_SOCKET_EVENTS["partner_disconnected"] = "partner_disconnected";
    GAME_SOCKET_EVENTS["mini_game_ended"] = "mini_game_ended"; /**when a mini game end's */
})(GAME_SOCKET_EVENTS = exports.GAME_SOCKET_EVENTS || (exports.GAME_SOCKET_EVENTS = {}));
