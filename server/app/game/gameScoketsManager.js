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
const game__service_1 = require("./game$.service");
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
        this.waitingList = {}; //waiting for partner to play
        this.gameRooms = {}; //gameRooms - Object {key:roomId,value:iGameRoom}
        this.playersPlaying = {}; // userId:RoomId he is playing
        //TODO - handle subcriptions Observables
    }
    run() {
        this.handleDisconnections(); /**handle socket's disconnection */
        this.handleNewConnections(); /**handle socket's connections */
    }
    /**handle socket's connections */
    handleNewConnections() {
        //handle connections //TODO - check how dispose correctly
        game__service_1.game$
            .filter((gameEvent) => gameEvent.eventName === GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.connection
        // && gameEvent.socket.handshake.query.roomId
        )
            .subscribe((gameEvent) => {
            let socket = gameEvent.socket;
            Logger_1.Logger.d(TAG, `** Handle New Connection **`, 'gray');
            this.printCurrentState(socket);
            socket.emit(GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.searchForPartner);
            let partner = this.searchForPartner(socket);
            if (!partner) {
                Logger_1.Logger.d(TAG, `**inserting ${socket.user.facebook ? socket.user.facebook.name : ''} to waiting list**`, 'yellow');
                this.waitingList[socket.user._id] = socket;
            }
            else {
                //generate game room
                let gameRoom = this.generateGameRoom([socket, partner]);
                //insert them to players playing list
                this.playersPlaying[socket.user._id] = gameRoom.roomId;
                this.playersPlaying[partner.user._id] = gameRoom.roomId;
                //insert to each socket the gameroomId:
                gameRoom.players.forEach(socket => {
                    socket.gameRoomId = gameRoom.roomId;
                });
                // ==== MOVED TO gameroomManager
                // //insert the 2 players into the room
                // socket.join(gameRoom.roomId);
                // partner.join(gameRoom.roomId);
                // //tell 2 players that match is found
                // this.io.to(gameRoom.roomId).emit(GAME_SOCKET_EVENTS.found_partner, { roomId: gameRoom.roomId });
                //send the gameroom to the GameRoom manager to handle the game:
                // ==== MOVED TO gameroomManager
                //generate new Handler to handle the room
                let gameRoomManager = new gameRoomManager_1.GameRoomManager(this.io, gameRoom);
                gameRoomManager.handle();
                //if one of the players disconnected, tell the other user about it - TODO fix this
                this.io.to(gameRoom.roomId).on('disconnect', (socket) => {
                    socket.broadcast.to(gameRoom.roomId).emit(GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.partner_disconnected);
                });
                this.gameRooms[gameRoom.roomId] = gameRoom;
            }
        });
    }
    /**handle reconnection */
    handleReconnection(socket) {
    }
    /**handle socket's disconnection */
    handleDisconnections() {
        //handle disconnections //TODO - check how dispose correctly
        game__service_1.game$.filter((gameEvent) => gameEvent.eventName === GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.disconnect)
            .subscribe((gameEvent) => {
            let disconnectingUserID = gameEvent.socket.user._id;
            //remove socket from waiting list if its there
            this.waitingList[disconnectingUserID] ? Logger_1.Logger.d(TAG, `** removing ${disconnectingUserID} from [waiting list].. `, 'cyan') : '';
            this.waitingList[disconnectingUserID] = null;
            //remove socket from playersPlaying if its there
            this.playersPlaying[disconnectingUserID] ? Logger_1.Logger.d(TAG, `** removing ${disconnectingUserID} from [PlayersPlaying] list.. `, 'cyan') : '';
            this.playersPlaying[disconnectingUserID] = null;
        });
    }
    userIsAlreadyConnected(socket) {
        //TODO
    }
    printCurrentState(socket) {
        Logger_1.Logger.d(TAG, '========== Socket Details =========', 'yellow');
        console.log('socket id =' + socket.id);
        Logger_1.Logger.d(TAG, `Before handling this socket there are: \n[watingList =${Object.keys(this.waitingList).length} Sockets]\n[gameRooms = ${Object.keys(this.gameRooms).length}]`);
        Logger_1.Logger.d(TAG, '========== Socket Details =========', 'yellow');
    }
    /**search partner for socket */
    searchForPartner(socket) {
        let usersId = Object.keys(this.waitingList);
        if (usersId.length === 0) {
            return null;
        }
        else {
            //currently just get any random player available
            //TODO - change the search mechanism
            let firstUserId = usersId[0];
            let partner = this.waitingList[firstUserId];
            return partner;
        }
    }
    generateGameRoom(players) {
        let roomId = uuid();
        //generate gameRoom :
        let gameRoom = {
            roomId: roomId,
            miniGamesRemaining: 3,
            players: players
        };
        return gameRoom;
    }
}
exports.GameScoketsManager = GameScoketsManager;
