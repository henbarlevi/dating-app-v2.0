"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/timer");
require("rxjs/add/observable/interval");
require("rxjs/add/observable/merge");
require("rxjs/add/operator/map");
require("rxjs/add/operator/first");
const MINIGAME_TYPE_ENUM_1 = require("./mini_games/logic/MINIGAME_TYPE_ENUM");
//=======utils
const Logger_1 = require("../utils/Logger");
const iGameSocket_1 = require("./models/iGameSocket");
const GAME_SOCKET_EVENTS_enum_1 = require("./models/GAME_SOCKET_EVENTS.enum");
const TAG = 'GameRoomManager |';
// ====== Games
const choose_partner_question_1 = require("./mini_games/choose_partner_question/choose_partner_question");
const game__service_1 = require("./game$.service");
let miniGames = [
    choose_partner_question_1.choose_partner_question
];
// =========================
// ====== ENV Configutations
// =========================
const config = require("config");
const iGameState_model_1 = require("./models/iGameState.model");
const GAMEROOM_EVENTS_1 = require("./models/GAMEROOM_EVENTS");
const playersExposedInfoManager_service_1 = require("./gameroom/playersExposedInfoManager.service");
const GAME_STATUS_enum_1 = require("./models/GAME_STATUS.enum");
const ENV = process.env.ENV || 'local';
const envConfig = config.get(ENV);
const reconnection_timeout = envConfig.game.reconnection_timeout; //time to reconnect if a player is inside a game
const minigames_per_game = envConfig.game.minigames_per_game;
const partner_info_exposed_time = 1000 * 4; //TODO - move to configuration file
/**handle an individual game room that contains 2 sockets (or more -in future version) of players
 *
*/
class GameRoomManager {
    constructor(io, gameRoom) {
        this.io = io;
        this.gameRoom = gameRoom;
        this.minigame = null; //current minigame the players playing
    }
    /**
     * return a default of gameroom state
     */
    get InitGameRoomState() {
        let initPlayersExposedData = {};
        this.gameRoom.players.map(p => p.user._id.toString()).forEach(playerId => {
            initPlayersExposedData[playerId] = { id: playerId };
        });
        return Object.assign({}, iGameState_model_1.initialState, { miniGamesRemaining: minigames_per_game, GAME_STATUS: GAME_STATUS_enum_1.GAME_STATUS.playing, 
            //players exposed data
            players: initPlayersExposedData });
    }
    handle() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.gameRoomState = this.InitGameRoomState;
                this.handeDisconnections();
                this.handlePlayersDataExposer(); //TODO - commented in order to easly resolve other bugs - uncomment when done
                const gameRoomId = this.gameRoom.roomId;
                //insert to each socket the gameroomId:
                this.enterPlayersToRoom(this.gameRoom.players, gameRoomId);
                //tell players that match is found and their partner/s id
                const playersId = this.gameRoom.players.map(p => p.user._id.toString());
                this.gameRoom.players.forEach((playersocket) => {
                    const playerId = playersocket.user._id.toString();
                    Logger_1.Logger.d(TAG, `emit to player [${iGameSocket_1.getUserNameBySocket(playersocket)}] found partners`, 'gray');
                    const partnersId = playersId.filter(pId => pId !== playerId);
                    playersocket.emit(GAME_SOCKET_EVENTS_enum_1.GAME_SOCKET_EVENTS.found_partner, { roomId: gameRoomId, partnersId: partnersId, playerId: playerId });
                });
                while (this.gameRoomState.miniGamesRemaining > 0) {
                    //generate new mini game:
                    let miniGameType = randomizeGame();
                    Logger_1.Logger.d(TAG, `gameRoom [${gameRoomId}] - ** generating the miniGame:[${MINIGAME_TYPE_ENUM_1.MINIGAME_TYPE[miniGameType]}] MiniGames Remaining :[${this.gameRoomState.miniGamesRemaining}]`, 'green');
                    let minigameClass = miniGames[miniGameType];
                    this.minigame = new minigameClass(this.io, this.gameRoom);
                    yield this.minigame.playMiniGame();
                    this.gameRoomState.miniGamesRemaining = this.gameRoomState.miniGamesRemaining - 1;
                    Logger_1.Logger.d(TAG, `MiniGame [${MINIGAME_TYPE_ENUM_1.MINIGAME_TYPE[miniGameType]}] Ended , MiniGames Remaining [${this.gameRoomState.miniGamesRemaining}]`, 'green');
                }
                /*game ended:*/
                this.handleGameEnded();
            }
            catch (e) {
                Logger_1.Logger.d(TAG, `Err =====>${e}`, 'red');
            }
        });
    }
    /**handle disconnections in a Gameroom
     * 1.subscribe to events of disconnected users from this room
     * 2.if disconnection  occur tell other players about disconnected user
     * 3.remove player from players list
     * 4.give a player a certien time to reconnect:
     *  a.if reconnected on time - check if the game still on , if so give the user reconnection succeded and tell the other players about reconnected user
     *                                                          if not, //TODO
     *  b.if didn't reconnected on time - tell the other players that the player left permenantly, if user will try to reconnect it will
     * receive session expierd
    */
    handeDisconnections() {
        this.disconnection$Sub = game__service_1.game$
            .filter((gameEvent) => 
        //check a socket disconnected and its from the same room
        gameEvent.eventName === GAME_SOCKET_EVENTS_enum_1.GAME_SOCKET_EVENTS.disconnect &&
            this.gameRoom.roomId === gameEvent.socket.gameRoomId)
            .subscribe((gameEvent) => this.handleDisconnection(gameEvent));
    }
    /**handle indevidual player disconnection */
    handleDisconnection(gameEvent) {
        const disconnectedSocket = gameEvent.socket;
        Logger_1.Logger.st(TAG, `handling disconnection of player ${iGameSocket_1.getUserNameBySocket(disconnectedSocket)} `, 'gray');
        Logger_1.Logger.d(TAG, `disconnected socketId #[${disconnectedSocket.id}]`, 'magenta');
        const disconnctedSocketId = disconnectedSocket.id;
        const disconnectedUserId = disconnectedSocket.user._id.toString();
        // // 2.remove player from players list
        this.gameRoom.players = this.gameRoom.players.filter(socket => socket !== disconnectedSocket);
        Logger_1.Logger.d(TAG, `** removed player from players list , there are now [${this.gameRoom.players.length}] players **`, 'gray');
        //3.tell other players about disconnected partner
        this.io.to(this.gameRoom.roomId).emit(GAME_SOCKET_EVENTS_enum_1.GAME_SOCKET_EVENTS.partner_disconnected, { partner: disconnectedSocket.user });
        //4.give a player a certien time to reconnect:
        const time_to_reconnect = reconnection_timeout; //in milisec
        Logger_1.Logger.d(TAG, `** give ${iGameSocket_1.getUserNameBySocket(disconnectedSocket)} ${reconnection_timeout / 1000} sec cahnce   to reconnect.. **`, 'gray');
        const reconnected$ = game__service_1.game$.filter((gameEvent) => 
        //check a socket connected and its the disconnected player from this room
        gameEvent.eventName === GAME_SOCKET_EVENTS_enum_1.GAME_SOCKET_EVENTS.connection &&
            gameEvent.socket.user._id.toString() === disconnectedUserId);
        const timeOut$ = Observable_1.Observable.timer(time_to_reconnect);
        Observable_1.Observable.merge(reconnected$, timeOut$).first().subscribe((gameEventOrTimeout) => {
            try {
                //reconnected on time:
                if (gameEventOrTimeout.eventName) {
                    const gameEvent = gameEventOrTimeout;
                    const reconnectedUser = gameEvent.socket;
                    Logger_1.Logger.d(TAG, `User [${iGameSocket_1.getUserNameBySocket(disconnectedSocket)}] reconnected back to gameRoomId: [${this.gameRoom.roomId}]`, 'gray');
                    Logger_1.Logger.d(TAG, `reconnected socketId #[${reconnectedUser.id}]`, 'magenta');
                    this.handleReconnection(reconnectedUser);
                }
                else {
                    //emit game_ended event
                    Logger_1.Logger.d(TAG, `User [${iGameSocket_1.getUserNameBySocket(disconnectedSocket)}] chance to reconnection passed, goomRoomId: [${this.gameRoom.roomId}]`, 'gray');
                    const playersId = this.gameRoom.players.map(p => p.user._id.toString()); //players that leaving
                    this.handleGameEnded(); //tell players game ended + dispose room
                }
            }
            catch (e) {
                Logger_1.Logger.d(TAG, `Err ====> player reconneciton process failed: ${e}`, 'red');
            }
        });
    }
    /**
     * @description when user temp disconnected and reconnected, the server need to
     * 1.tell his partners he reconnected
     * 2.inform the reconnected player the current game state (in case he didnt cached it)
     * 3.add him to the players list (gameroom.players)
     * 4.add him to room
     * @param socket - reconnected player
     */
    handleReconnection(socket) {
        //1.tell his partners he reconnected
        const reconnectedUserId = socket.user.id.toString();
        this.gameRoom.players.forEach(s => {
            s.emit(GAME_SOCKET_EVENTS_enum_1.GAME_SOCKET_EVENTS.partner_reconnected, { partner: reconnectedUserId });
        });
        //2.inform the reconnected player the current game state (in case he didnt cached it)
        this.gameRoomState.miniGameState = this.minigame ? Object.assign({}, this.minigame.MiniGameState) : null; //assign minigame state to gameroom state
        const clientGameState = this.RoomState_To_ClientGameState(this.gameRoomState, socket);
        socket.emit(GAME_SOCKET_EVENTS_enum_1.GAME_SOCKET_EVENTS.reconnection_data, clientGameState);
        //3.add him to the players list (gameroom.players)
        this.gameRoom.players.push(socket);
        Logger_1.Logger.d(TAG, `Current players socket in gameroom = ${this.gameRoom.players.length}`, 'gray');
        //4.add him to room
        this.enterPlayerToRoom(socket, this.gameRoom.roomId);
    }
    enterPlayersToRoom(sockets, roomId) {
        Logger_1.Logger.st(TAG, `** GameroomId:[${roomId}] entering Sockets To Gameroom **`, 'gray');
        sockets.forEach(s => this.enterPlayerToRoom(s, roomId));
    }
    /**
     * @description
     * 1.insert socket to room (socket.join)
     * 2.assing to socket the roomid
     * @param socket
     */
    enterPlayerToRoom(socket, roomId) {
        socket.join(roomId);
        socket.gameRoomId = roomId;
    }
    /**
     * @description
     * the difference is that gameRoomState saving all the players exposed data in the 'players' property
     * while in client this data is seperated - 'player' contain the player exposed data , 'partners' - his partners exposed data
     * @param gameroomState
     */
    RoomState_To_ClientGameState(gameRoomState, player) {
        const playerId = player.user._id.toString();
        const playerExposedData = Object.assign({}, gameRoomState.players[playerId]);
        let hisPartnersExposedData = Object.assign({}, gameRoomState.players);
        delete hisPartnersExposedData[playerId];
        const clientState = Object.assign({}, gameRoomState, { partners: hisPartnersExposedData, player: playerExposedData });
        delete clientState.players;
        return clientState;
    }
    /**
     * handleGameEnded
     * a. emit gameroom event 'game_ended'
     * b. call onDestory to dispose gameroom
     * @param disconnectedSocket - in case of game ended because some user disconnected - the user that disconnected
     */
    handleGameEnded(disconnectedSocket) {
        Logger_1.Logger.d(TAG, '**handle Game Ended**');
        Logger_1.Logger.d(TAG, `** emit [game_ended] to ${this.gameRoom.players.map(s => `${iGameSocket_1.getUserNameBySocket(s) + 'that in room' + Object.keys(s.rooms)},`)}`);
        //emit to players game eneded
        this.io.to(this.gameRoom.roomId).emit(GAME_SOCKET_EVENTS_enum_1.GAME_SOCKET_EVENTS.game_ended);
        //emit to server
        const playersId = this.gameRoom.players.map(p => p.user._id.toString()); //players that leaving        
        const gameroomEvent = { eventName: GAMEROOM_EVENTS_1.GAMEROOM_EVENT.gameroom_session_ended, socket: disconnectedSocket, eventData: { roomId: this.gameRoom.roomId, playersId: playersId } };
        game__service_1.Game$.emit(gameroomEvent);
        //dispose gameroom
        this.onDestory();
    }
    onDestory() {
        Logger_1.Logger.d(TAG, `** disposing gameroom ${this.gameRoom.roomId}`, 'gray');
        this.disconnection$Sub ? this.disconnection$Sub.unsubscribe() : '';
        this.playerInfoExposed$Sub ? this.playerInfoExposed$Sub.unsubscribe() : '';
        if (this.minigame) {
            this.minigame.onDestory();
            this.minigame = null;
        }
    }
    /**
 * @description
 * in the begining of the game
 * the player will know nothing about his partner/partners he is playing with,
 * as the game proceed , each certian of time the player receive a new info about his matched partner (name/age etc.)
 this method will call a service that will be responsible to emit to players the player info.
@param exposerTrigger - each time the observable emit event - [partner_info_exposed] will be emited.
*/
    handlePlayersDataExposer() {
        const exposerTrigger$ = Observable_1.Observable.interval(partner_info_exposed_time).map(() => this.gameRoomState);
        playersExposedInfoManager_service_1.PlayersExposedInfoManager.handleExposer(this.gameRoom, this.io, exposerTrigger$);
        const playerInfoExposed$ = game__service_1.Game$
            .getByEventName(GAME_SOCKET_EVENTS_enum_1.GAME_SOCKET_EVENTS.partner_info_exposed)
            .filter(gameEvent => gameEvent.socket.gameRoomId === this.gameRoom.roomId); //check its realted to this gameroomId
        this.playerInfoExposed$Sub = playerInfoExposed$.subscribe((gameEvent) => {
            //update gameroomState (update player exposer state)
            const eventData = gameEvent.eventData;
            const exposedPlayerId = eventData.playerId;
            let playerExposerState = Object.assign({}, this.gameRoomState.players[exposedPlayerId]);
            playerExposerState[eventData.infoPropExposed] = eventData.infoPropValue;
            this.gameRoomState.players[exposedPlayerId] = playerExposerState;
            Logger_1.Logger.d(TAG, '** [GameroomState] [UPDATED] **', 'gray');
        });
    }
} //TODO - when gameroom diposed - PlayersExposedInfoManager should unsubscribe
exports.GameRoomManager = GameRoomManager;
//
function randomizeGame() {
    let min = 0;
    let max = Object.keys(MINIGAME_TYPE_ENUM_1.MINIGAME_TYPE).length / 2 - 1;
    return Math.floor(Math.random() * (max - min + 1) + min);
}
