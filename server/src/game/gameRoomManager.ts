//======imports
import * as Rx from 'rxjs';
import * as jwt from 'jsonwebtoken'; //jwt authentication
import * as socketIo from 'socket.io';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/timer';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/first';
import { ReplaySubject } from 'rxjs/ReplaySubject';

//======db

//====== services
import { miniGame } from "./mini_games/abstract_minigame";
//====== models
import { iUser } from '../models';
import { iFacebookCredentials } from '../facebook/models/iFacebookCredentials.model'
import { iFacebookUserInfo } from '../facebook/models/index';
import { iGameRoom } from './models/iGameRoom';
import { MINIGAME_TYPE } from './mini_games/logic/MINIGAME_TYPE_ENUM';

//=======utils
import { Logger } from '../utils/Logger';
import { iGameSocket } from './models/iGameSocket';
import { GAME_SOCKET_EVENTS } from './models/GAME_SOCKET_EVENTS.enum';
const TAG: string = 'GameRoomManager |';

// ====== Games
import { choose_partner_question } from './mini_games/choose_partner_question/choose_partner_question';
import { game$, game$Event, Game$ } from './game$.service';
let miniGames = [
    choose_partner_question
];
// =========================
// ====== ENV Configutations
// =========================
import * as config from 'config';
import { iGameRoomState, initialState, GAME_STATUS, iPartner, iClientGameState } from './models/iGameState.model';
import { GAMEROOM_EVENT } from './models/GAMEROOM_EVENTS';
const ENV: string = process.env.ENV || 'local';
const envConfig: any = config.get(ENV);
const reconnection_timeout: number = envConfig.game.reconnection_timeout //time to reconnect if a player is inside a game


/**handle an individual game room that contains 2 sockets (or more -in future version) of players 
 * 
*/
export class GameRoomManager {

    private gameRoomState: iGameRoomState;//save the gameroom state 
    private minigame: miniGame = null;//current minigame the players playing

    constructor(private io: SocketIO.Namespace, private gameRoom: iGameRoom) {

    }
    /**
     * return a default of gameroom state
     */
    get InitGameRoomState(): iGameRoomState {
        let initPlayersExposedData: { [partnerId: string]: iPartner } = {};
        this.gameRoom.players.map(p => p.user._id.toString()).forEach(playerId => {
            initPlayersExposedData[playerId] = { id: playerId };
        })
        return {
            ...initialState,
            miniGamesRemaining: this.gameRoom.miniGamesRemaining,
            GAME_STATUS: GAME_STATUS.playing,
            //players exposed data
            players: initPlayersExposedData
        }
    }
    async handle() {
        try {
            this.gameRoomState = this.InitGameRoomState

            this.handeDisconnections();
            const gameRoomId: string = this.gameRoom.roomId;
            //insert to each socket the gameroomId:
            this.gameRoom.players.forEach(socket => {
                this.enterPlayerToRoom(socket, gameRoomId);
            })

            //tell players that match is found and their partner/s id
            const playersId: string[] = this.gameRoom.players.map(p => p.user._id.toString())
            this.gameRoom.players.forEach((playersocket: iGameSocket) => {
                const playerId: string = playersocket.user._id.toString();
                Logger.d(TAG, `emit to player [${this.getUserNameBySocket(playersocket)}] found partners`, 'gray')
                const partnersId = playersId.filter(pId => pId !== playerId);
                playersocket.emit(GAME_SOCKET_EVENTS.found_partner, { roomId: gameRoomId, partnersId: partnersId, playerId: playerId })
            })
            while (this.gameRoom.miniGamesRemaining > 0) {
                //generate new mini game:

                let miniGameType: MINIGAME_TYPE = randomizeGame();
                Logger.d(TAG, `gameRoom [${gameRoomId}] - minigames Remaining [${this.gameRoom.miniGamesRemaining}] `);
                Logger.d(TAG, `gameRoom [${gameRoomId}] - ** generating the miniGame ${MINIGAME_TYPE[miniGameType]}`);

                let minigameClass = miniGames[miniGameType];

                this.minigame = new minigameClass(this.io, this.gameRoom);

                await this.minigame.playMiniGame();

            }
        }
        catch (e) {
            Logger.d(TAG, `Err =====>${e}`, 'red')
        }

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
        game$
            .filter((gameEvent: game$Event) =>
                //check a socket disconnected and its from the same room
                gameEvent.eventName === GAME_SOCKET_EVENTS.disconnect &&
                this.gameRoom.roomId === gameEvent.socket.gameRoomId
            )
            //1.subscribe to events of disconnected users from this room
            .subscribe((gameEvent: game$Event) => this.handleDisconnection(gameEvent));
    }
    /**handle indevidual player disconnection */
    handleDisconnection(gameEvent: game$Event) {
        const disconnectedSocket: iGameSocket = gameEvent.socket;
        Logger.st(TAG, `handling disconnection of player ${this.getUserNameBySocket(disconnectedSocket)} `, 'gray');
        const disconnctedSocketId = disconnectedSocket.id;
        const disconnectedUserId: string = disconnectedSocket.user._id.toString();
        // // 2.remove player from players list
        // this.gameRoom.players = this.gameRoom.players.filter(socket => socket !== disconnectedSocket);
        // Logger.d(TAG, `** removed player from players list , there are now [${this.gameRoom.players.length}] players **`, 'gray');
        //3.tell other players about disconnected partner
        this.io.to(this.gameRoom.roomId).emit(GAME_SOCKET_EVENTS.partner_disconnected, { partner: disconnectedSocket.user });
        //4.give a player a certien time to reconnect:
        const time_to_reconnect: number = reconnection_timeout;//in milisec
        Logger.d(TAG, `** give ${this.getUserNameBySocket(disconnectedSocket)} ${reconnection_timeout / 1000} sec cahnce   to reconnect.. **`, 'gray')

        const reconnected$ = game$.filter((gameEvent: game$Event) =>
            //check a socket connected and its the disconnected player from this room
            gameEvent.eventName === GAME_SOCKET_EVENTS.connection &&
            gameEvent.socket.user._id.toString() === disconnectedUserId
        );
        const timeOut$ = Observable.timer(time_to_reconnect);
        Observable.merge(reconnected$, timeOut$).first().subscribe(
            (gameEventOrTimeout: any) => {
                //reconnected on time:
                if (gameEventOrTimeout.eventName) {
                    const gameEvent = gameEventOrTimeout as game$Event;
                    const reconnectedUser: iGameSocket = gameEvent.socket;
                    Logger.d(TAG, `User [${this.getUserNameBySocket(disconnectedSocket)}] reconnected back to gameRoomId: [${this.gameRoom.roomId}]`, 'gray');
                    this.handleReconnection(reconnectedUser);

                } else {//timeout 
                    //emit game_ended event
                    Logger.d(TAG, `User [${this.getUserNameBySocket(disconnectedSocket)}] chance to reconnection passed, goomRoomId: [${this.gameRoom.roomId}]`, 'gray');
                    const playersId: string[] = this.gameRoom.players.map(p => p.user._id.toString()) //players that leaving
                    this.gameRoom.players.forEach(p => p.disconnect());
                    const gameroomEvent: game$Event = { eventName: GAMEROOM_EVENT.game_ended, socket: disconnectedSocket, eventData: { roomId: this.gameRoom.roomId, playersId: playersId } }
                    Game$.emit(gameroomEvent);
                    this.onDestory();//TODO - make sure unsubscribing from all subscription before disconnecting the sockets(2 lines above)
                }
            }
        )
    }
    /**
     * @description when user temp disconnected and reconnected, the server need to 
     * 1.tell his partners he reconnected
     * 2.inform the reconnected player the current game state (in case he didnt cached it)
     * 3.add him to the players list (gameroom.players)
     * 4.add him to room
     * @param socket - reconnected player
     */
    private handleReconnection(socket: iGameSocket) {
        //1.tell his partners he reconnected
        const reconnectedUserId: string = socket.user.id.toString();

        this.gameRoom.players.forEach(s => {
            s.emit(GAME_SOCKET_EVENTS.partner_reconnected, { partner: reconnectedUserId })
        })
        //2.inform the reconnected player the current game state (in case he didnt cached it)
        this.gameRoomState.miniGameState = this.minigame ? { ...this.minigame.MiniGameState } : null;//assign minigame state to gameroom state
        const clientGameState: iClientGameState = this.RoomState_To_ClientGameState(this.gameRoomState, socket);
        socket.emit(GAME_SOCKET_EVENTS.reconnection_data, clientGameState);
        //3.add him to the players list (gameroom.players)
        this.gameRoom.players.push(socket);
        //4.add him to room
        this.enterPlayerToRoom(socket, this.gameRoom.roomId);
    }
    /**
     * @description 
     * 1.insert socket to room (socket.join)
     * 2.assing to socket the roomid
     * @param socket 
     */
    private enterPlayerToRoom(socket: iGameSocket, roomId: string) {
        socket.join(roomId);
        socket.gameRoomId = roomId;
    }
    /**
     * @description the difference is that gameRoomState saving all the players exposed data in the 'players' property
     * while in client this data is seperated - 'player' contain the player exposed data , 'partners' - his partners exposed data
     * @param gameroomState 
     */
    private RoomState_To_ClientGameState(gameRoomState: iGameRoomState, player: iGameSocket): iClientGameState {


        const playerId: string = player.user._id.toString();
        const playerExposedData: iPartner = { ...gameRoomState.players[playerId] };
        let hisPartnersExposedData: { [playerId: string]: iPartner } = { ...gameRoomState.players };
        delete hisPartnersExposedData[playerId];


        const clientState: any = {
            ...gameRoomState,
            partners: hisPartnersExposedData,
            player: playerExposedData
        }
        delete clientState.players;
        return clientState as iClientGameState;
    }
    private getUserNameBySocket(socket: iGameSocket) { //return userName or userId
        return socket.user.facebook ? socket.user.facebook.name : socket.user._id
    }

    onDestory(): any {
        Logger.d(TAG, `** disposing gameroom ${this.gameRoom.roomId}`, 'gray');
    }
}

function randomizeGame(): MINIGAME_TYPE {
    let min: number = 0;
    let max: number = Object.keys(MINIGAME_TYPE).length / 2 - 1;
    return Math.floor(Math.random() * (max - min + 1) + min);
}