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
import { onDestroy } from "../../models";
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs";
export abstract class miniGame implements onDestroy {
    private ready$Subscription: Subscription = null;
    constructor(protected io: SocketIO.Namespace, protected gameRoom: iGameRoom) {

    }
    abstract async initMiniGame();  //declaring the mini game that should start and waiting for players to be ready
    abstract async playMiniGame(); //run the mini game
    //responsible to dispose all observables of the miniGame
    onDestory() {
        try {
            this.ready$Subscription ? this.ready$Subscription.unsubscribe() : '';
            this.io = this.gameRoom = null;
        } catch (e) {
            Logger.d(TAG, 'ERR =====> onDestory' + e, 'red');
        }
    }
    /**@description return the players _id in the gameroom */
    protected get playersId(): string[] {
        return this.gameRoom.players.map(p => p.user._id.toString());
    }
    /**@description return the players amount the gameroom */
    protected get playersAmount(): number {
        return this.gameRoom.players.length;
    }
    /**@description @return Observable that raise gameSocket Events from the specified eventName 
     * and are related to the gameRoom */
    protected getEventsByNameInGameroom(eventName: GAME_SOCKET_EVENTS): Observable<game$Event> {
        return game$
            .filter((event: game$Event) => {
                const evName: GAME_SOCKET_EVENTS = event.eventName as GAME_SOCKET_EVENTS;
                if (!event.socket) { return false; }
                const gameRoomId: string = event.socket.gameRoomId;
                evName === eventName && gameRoomId !== this.gameRoom.roomId ? Logger.d(TAG, `Warning! [${eventName}] occur but the socket.gameRoomId:[${gameRoomId}] Instead Of [${this.gameRoom.roomId}]`, 'red') : '';
                return evName === eventName && gameRoomId === this.gameRoom.roomId;
            })//check if its the event in the Input + related to this gameRoomId
    }
    /**@description return current state of the minigame */
    public abstract get MiniGameState(): iGenericMiniGameState<any>;

    WaitForPlayersToBeReady() {
        return new Promise((resolve, reject) => {
            Logger.d(TAG, '** waiting for players to be ready... **', 'gray');
            let playersIdReady: string[] = [];
            //TODO - dont forget to dispose event listener
            this.ready$Subscription = this.getEventsByNameInGameroom(GAME_SOCKET_EVENTS.ready_for_mini_game)//check if its ready_for_mini_game event + related to that gameRoomId
                .subscribe(async (data: game$Event) => {
                    try {
                        const playerReady: iGameSocket = data.socket;
                        const playerIdReady: string = playerReady.user._id.toString();
                        const playerRelatedToGameroom: boolean = this.playersId.some(pId => pId === playerIdReady);
                        playerRelatedToGameroom ? playersIdReady.push(playerIdReady) : Logger.d(TAG, 'Warning! Socket That is not related to game room emited event of ready_for_minigame', 'red');
                        Logger.d(TAG, `game room [${this.gameRoom.roomId}] | Player - ${getUserNameBySocket(playerReady)} is ready, [${playersIdReady.length}] players are ready`)
                        if (playersIdReady.length === this.playersAmount) { //all players ready_for_mini_game
                            this.ready$Subscription.unsubscribe();//unsubscribe from observable 
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
                Logger.d(TAG, `** telling the player [${getUserNameBySocket(p)}] about the playaction **`, 'gray');
                p.emit(GAME_SOCKET_EVENTS.partner_played, playAction)
            }
        })
    }

    /**@description - called when minigame ends, it will 
     * 1.inform the players that minigame ended (GAME_SOCKET_EVENTS.mini_game_ended) 
     * 2.wait for them to confirm
     * 3.dispose this class (onDestroy)
     */
    protected endMinigame(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                //1
                this.io.to(this.gameRoom.roomId).emit(GAME_SOCKET_EVENTS.mini_game_ended);
                //2
                await this.WaitForPlayersToConfirmMinigameEnded();
                //3
                this.onDestory();
                resolve();
            }
            catch (e) {
                Logger.d(TAG, 'ERR =====>' + e, 'red');
                reject(e);
            }

        })
    }

    protected WaitForPlayersToConfirmMinigameEnded(): Promise<void> {
        return new Promise((resolve, reject) => {
            let playersIdConfirmed: string[] = []
            const endingConfirm$Sub: Subscription = this.getEventsByNameInGameroom(GAME_SOCKET_EVENTS.mini_game_ended)
                .subscribe(async gameEvent => {
                    try {
                        const playerIdConfirmed: string = gameEvent.socket.user._id.toString();
                        const didntAlreadyConfirmed: boolean = playersIdConfirmed.every(pId => pId !== playerIdConfirmed);
                        didntAlreadyConfirmed ? playersIdConfirmed.push(playerIdConfirmed) : ''
                        if (playersIdConfirmed.length === this.playersAmount) {//if all players confirmed
                            endingConfirm$Sub.unsubscribe();
                            resolve();
                        }
                    } catch (e) {
                        reject(e);
                    }
                })
        })
    }

}