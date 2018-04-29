import { iGameRoom } from "../models/iGameRoom";
import { iGameSocket, getUserNameBySocket } from "../models/iGameSocket";
import { Logger } from "../../utils/Logger";
import { } from "./choose_partner_question/choose_partner_question";
import { GAME_SOCKET_EVENTS } from "../models/GAME_SOCKET_EVENTS.enum";
const TAG: string = 'miniGame Abstract |';
import { game$, game$Event } from '../game$.service';
import 'rxjs/add/operator/filter';
import { iSocketData } from "../models/iSocketData.model";
import { retry } from "rxjs/operator/retry";
import { iPlayAction } from "../models/iPlayData";
import { iGenericMiniGameState } from "./logic/iminiGameState.model";
export abstract class miniGame {
    protected gameRoomPlayersAmount: number;
    constructor(protected io: SocketIO.Namespace, protected gameRoom: iGameRoom) {

    }
    abstract async initMiniGame();  //declaring the mini game that should start and waiting for players to be ready

    abstract async playMiniGame(); //run the mini game
    /**@description return the players _id in the gameroom */
    protected get playersId(): string[] {
        return this.gameRoom.players.map(p => p.user._id.toString());
    }
    /**@description return the players amount the gameroom */
    protected get playersAmount(): number {
        return this.gameRoom.players.length;
    }
    /**@description return current state of the minigame */
    public abstract get MiniGameState():iGenericMiniGameState<any>;

    WaitForPlayersToBeReady() {
        return new Promise((resolve, reject) => {
            Logger.d(TAG, '** waiting for players to be ready... **', 'gray');
            let playersIdReady: string[] = [];
            //TODO - dont forget to dispose event listener
            let subscription = game$
                .filter((event: game$Event) => {
                        const eventName: string = event.eventName as GAME_SOCKET_EVENTS
                        const gameRoomId: string = event.socket.gameRoomId;
                        eventName === GAME_SOCKET_EVENTS.ready_for_mini_game && gameRoomId !== this.gameRoom.roomId ?  Logger.d(TAG, `Warning! ready_for_mini_game occur but the socket.gameRoomId=${gameRoomId}`, 'red'):'';
                        return eventName === GAME_SOCKET_EVENTS.ready_for_mini_game && gameRoomId === this.gameRoom.roomId;
                })//check if its ready_for_mini_game event + related to that gameRoomId
                .subscribe(async (data: game$Event) => {
                    try {
                        const playerReady: iGameSocket = data.socket;
                        const playerIdReady: string = playerReady.user._id.toString();
                        const playerRelatedToGameroom: boolean = this.playersId.some(pId => pId === playerIdReady);
                        playerRelatedToGameroom ? playersIdReady.push(playerIdReady) : Logger.d(TAG, 'Warning! Socket That is not related to game room emited event of ready_for_minigame', 'red');
                        Logger.d(TAG, `game room [${this.gameRoom.roomId}] | Player - ${getUserNameBySocket(playerReady)} is ready, [${playersIdReady.length}] players are ready`)

                        if (playersIdReady.length === this.playersAmount) { //all players ready_for_mini_game
                            resolve();
                        }
                    }
                    catch (e) {
                        Logger.d(TAG, 'ERR =====>' + e, 'red');
                        reject(e);
                    }
                })


        })
    }
    /**when some players do an action in the game - this method will inform the other players about the game action occurred
     * @param playerId - the player that did the action 
     */
    protected tellPlayersAboutPlayAction(playerId: string, playActionData: iPlayAction<any>) {
        const playAction: iPlayAction<any> = { ...playActionData, playerId: playerId };
        this.gameRoom.players.forEach(p => {
            if (p.user._id.toString() !== playerId) {//if its not the player that did the action
                Logger.d(TAG, `** telling the player [${this.getUserNameBySocket(p)}] about the playaction **`, 'gray');
                p.emit(GAME_SOCKET_EVENTS.partner_played, playAction)
            }
        })
    }

    /**for logs - return a user Name Or Id string */
    protected getUserNameBySocket(socket: iGameSocket) { //return userName or userId
        return socket.user.facebook ? socket.user.facebook.name : socket.user._id.toString()
    }
}