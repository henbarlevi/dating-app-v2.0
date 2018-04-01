//======imports
import * as Rx from 'rxjs';
import * as jwt from 'jsonwebtoken'; //jwt authentication
import * as socketIo from 'socket.io';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/timer';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/first';
//======db

//====== services
import { miniGame } from "./mini_games/abstract_minigame";
//====== models
import { GAME_STATUS } from './GAME_STATUS_ENUM';
import { iUser } from '../models';
import { iFacebookCredentials } from '../facebook/models/iFacebookCredentials.model'
import { iFacebookUserInfo } from '../facebook/models/index';
import { iGameRoom } from './models/iGameRoom';

//=======utils
import { Logger } from '../utils/Logger';
import { iGameSocket } from './models/iGameSocket';
import { GAME_TYPE } from './models/GAME_TYPE_ENUM';
import { GAME_SOCKET_EVENTS } from './models/GAME_SOCKET_EVENTS';
const TAG: string = 'GameRoomManager |';

// ====== Games
import { choose_partner_question } from './mini_games/choose_partner_question/choose_partner_question';
import { game$, game$Event } from './game$.service';
let miniGames = [
    choose_partner_question
];
// =========================
// ====== ENV Configutations
// =========================
import * as config from 'config';
const ENV: string = process.env.ENV || 'local';
const envConfig: any = config.get(ENV);
const reconnection_timeout: number = envConfig.game.reconnection_timeout //time to reconnect if a player is inside a game


// ====== / Games

/**handle an individual game room that contains 2 sockets of players (or more -in future version)
 * 
*/
export class GameRoomManager {
    constructor(private io: SocketIO.Namespace, private gameRoom: iGameRoom) {

    }
    async handle() {
        try {
            this.handeDisconnections();
            let gameRoomId = this.gameRoom.roomId;
            //insert the players into the room
            this.gameRoom.players.forEach(playerSocket => {
                playerSocket.join(gameRoomId);
            })
            //tell players that match is found and their partner/s id
            //OLD -this.io.to(gameRoomId).emit(GAME_SOCKET_EVENTS.found_partner, { roomId: gameRoomId });
            const playersId: string[] = this.gameRoom.players.map(p => p.user._id.toString())
            this.gameRoom.players.forEach((playersocket: iGameSocket) => {
                const playerId:string =playersocket.user._id.toString();
                Logger.d(TAG, `emit to player [${this.getUserNameBySocket(playersocket)}] found partners`, 'gray')
                const partnersId = playersId.filter(pId => pId !== playerId);
                playersocket.emit(GAME_SOCKET_EVENTS.found_partner, { roomId: gameRoomId, partnersId: partnersId,playerId:playerId })
            })
            // while (this.gameRoom.miniGamesRemaining > 0) {
            //generate new mini game:

            let miniGameType: GAME_TYPE = randomizeGame();
            Logger.d(TAG, `gameRoom [${gameRoomId}] - minigames Remaining [${this.gameRoom.miniGamesRemaining}] `);
            Logger.d(TAG, `gameRoom [${gameRoomId}] - ** generating the miniGame ${GAME_TYPE[miniGameType]}`);

            let minigameClass = miniGames[miniGameType];

            let miniGame: miniGame = new minigameClass(this.io, this.gameRoom);


            await miniGame.playMiniGame();

            // }
        }
        catch (e) {
            Logger.d(TAG, `Err =====>${e}`, 'red')
        }

    }
    /**handle disconnections in a Gameroom 
     * 1.subscribe to events of disconnected users from this room
     * 2.if disconnection  occur tell other players about disconnected user
     * 3.give a player a certien time to reconnect:
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
        Logger.d(TAG, `** handling disconnection of player ${gameEvent.socket.user.facebook ? gameEvent.socket.user.facebook.name : gameEvent.socket.user._id} **`, 'gray');
        //2.tell other players about disconnected partner
        let disconnectedSocket: iGameSocket = gameEvent.socket;
        let disconnctedSocketId = disconnectedSocket.id;
        let disconnectedUserId: string = disconnectedSocket.user._id.toString();//TODOTODOTODO - Bug here - filter -filters the reconneciton process (same UserId false) 
        this.gameRoom.players.filter(socket => socket.id !== disconnctedSocketId).forEach(s => {
            s.emit(GAME_SOCKET_EVENTS.partner_disconnected, { player: disconnectedSocket.user })
        })
        //3.give a player a certien time to reconnect:
        const time_to_reconnect: number = reconnection_timeout;//in milisec
        let reconnected$ = game$.filter((gameEvent: game$Event) =>
            //check a socket connected and its the disconnected player from this room
            gameEvent.eventName === GAME_SOCKET_EVENTS.connection &&
            gameEvent.socket.user._id.toString() === disconnectedUserId.toString()
        );
        let timeOut$ = Observable.timer(time_to_reconnect);
        Observable.merge(reconnected$, timeOut$).first().subscribe(
            (gameEventOrTimeout: any) => {
                //reconnected on time:
                if (gameEventOrTimeout.eventName) {
                    const gameEvent = gameEventOrTimeout as game$Event;
                    Logger.d(TAG, `User [${this.getUserNameBySocket(disconnectedSocket)}] reconnected back to gameRoomId: [${this.gameRoom.roomId}]`, 'gray');

                } else {//timeout //TODOTODOTOD - think how to handle the reconnection issue + who will handle the list of players that can reconnect
                    Logger.d(TAG, `User [${this.getUserNameBySocket(disconnectedSocket)}] chance to reconnection passed, goomRoomId: [${this.gameRoom.roomId}]`, 'gray');

                }
            }
        )
    }
    private getUserNameBySocket(socket: iGameSocket) { //return userName or userId
        return socket.user.facebook ? socket.user.facebook.name : socket.user._id
    }

}

function randomizeGame(): GAME_TYPE {
    let min: number = 0;
    let max: number = Object.keys(GAME_TYPE).length / 2 - 1;
    return Math.floor(Math.random() * (max - min + 1) + min);
}