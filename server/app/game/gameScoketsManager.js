"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid = require("uuid/v1"); //generate guid
//====== services
const gameRoomManager_1 = require("./gameRoomManager");
const GAME_SOCKET_EVENTS_1 = require("./models/GAME_SOCKET_EVENTS");
//====== config
const config = require("config");
const ENV = process.env.ENV || 'local';
const envConfig = config.get(ENV);
//=======utils
const Logger_1 = require("../utils/Logger");
const TAG = 'GameSocketsManager |';
/**handle game sockets
 * after user connected:
 * 1.emit for user 'searching For partner' - if not found push socket to waiting list
 * 2.after found partner - emit to 2 players 'found partner'
 * 3.Generate game room for the 2 players and join 2 socket to generated room
 * 4.send the gameRoom to gameRoom manager to handle the game
 */
class GameScoketsManager {
    /**
     *
     */
    constructor(io) {
        this.io = io;
        //sockets groups
        this.waitingList = []; //waiting for partner to play
        this.gameRooms = {}; //gameRooms - Object {key:roomId,value:iGameRoom}
        this.allSockets = []; //that helps check if the user already created socket from another tab
    }
    /**handle new socket connected*/
    handle(socket) {
        this.printCurrentState(socket);
        socket.on('disconnect', () => {
            console.log('user disconnected from game');
        });
        // if (this.userIsAlreadyConnected(socket)) {
        //     socket.emit(GAME_SOCKET_EVENTS.already_connected);
        //     socket.disconnect();
        // }
        socket.emit(GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.searchForPartner);
        let partner = this.searchForPartner(socket);
        if (!partner) {
            Logger_1.Logger.d(TAG, `**inserting ${socket.user.facebook ? socket.user.facebook.name : ''} to waiting list**`, 'yellow');
            this.waitingList.push(socket);
        }
        else {
            //generate game room
            let gameRoom = this.generateGameRoom(socket, partner);
            //insert the 2 players into the room
            socket.join(gameRoom.roomId);
            partner.join(gameRoom.roomId);
            //tell 2 players that match is found
            this.io.to(gameRoom.roomId).emit(GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.found_partner, { roomId: gameRoom.roomId });
            //send the gameroom to the GameRoom manager to handle the game:
            let gameRoomManager = new gameRoomManager_1.GameRoomManager(this.io, gameRoom);
            gameRoomManager.handle();
            //if one of the players disconnected, tell the other user about it
            this.io.to(gameRoom.roomId).on('disconnect', (socket) => {
                socket.broadcast.to(gameRoom.roomId).emit(GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.partner_disconnected);
            });
            this.gameRooms[gameRoom.roomId] = gameRoom;
        }
    }
    userIsAlreadyConnected(socket) {
        //TODO
    }
    printCurrentState(socket) {
        Logger_1.Logger.d(TAG, '========== Socket Details =========', 'yellow');
        console.log('socket id =' + socket.id);
        Logger_1.Logger.d(TAG, `Before handling this socket there are: \n[watingList =${this.waitingList.length} Sockets]\n[gameRooms = ${Object.keys(this.gameRooms).length}]`);
        Logger_1.Logger.d(TAG, '========== Socket Details =========', 'yellow');
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
