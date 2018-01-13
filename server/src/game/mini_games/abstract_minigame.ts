import { iGameRoom } from "../models/iGameRoom";
import { iGameSocket } from "../models/iGameSocket";
import { Logger } from "../../utils/Logger";
import { GAME_TYPE } from "../models/GAME_TYPE_ENUM";
import { } from "./choose_partner_question/choose_partner_question";
import { GAME_SOCKET_EVENTS } from "../models/GAME_SOCKET_EVENTS";
const TAG: string = 'miniGame Abstract |';
import { game$, game$Event } from '../game$.service';
import 'rxjs/add/operator/filter';
import { iSocketData } from "../models/iSocketData.model";
import { retry } from "rxjs/operator/retry";
export abstract class miniGame {
    protected gameRoomPlayersAmount: number;
    constructor(protected io: SocketIO.Namespace, protected gameRoom: iGameRoom) {
        this.gameRoomPlayersAmount = gameRoom.players.length;
    }
    abstract async initMiniGame();  //declaring the mini game that should start and waiting for players to be ready

    abstract async playMiniGame(); //run the mini game

    WaitForPlayersToBeReady() {
        return new Promise((resolve, reject) => {
            Logger.d(TAG, '** waiting for players to be ready... **', 'gray');
            let playersReady: iGameSocket[] = [];
            //TODO - dont forget to dispose event listener
           let subscription = game$
                .filter((event: game$Event) => {
                    if (event.eventData) {
                        let gameroomId: string = event.eventData.roomId;
                        let eventName: string = event.eventName as GAME_SOCKET_EVENTS
                        Logger.d(TAG, `Game room ${this.gameRoom.roomId} received event : ${eventName} related to ${gameroomId} to game room ${gameroomId}`, 'gray');
                        return eventName === GAME_SOCKET_EVENTS.ready_for_mini_game && gameroomId === this.gameRoom.roomId;
                    }
                    return false;
                })//check if its ready_for_mini_game event + related to that gameRoomId
                .subscribe(async (data: game$Event) => {
                    try {

                        let playerReady: iGameSocket = data.socket;
                        let playerRelatedToGameroom = this.gameRoom.players.find(p => p.id === playerReady.id);
                        playerRelatedToGameroom ? playersReady.push(playerReady) : 'Warning! Socket That is not related to game room emited event of ready_for_minigame';
                        Logger.d(TAG, `game room [${this.gameRoom.roomId}] | Player - ${playerReady.user.facebook ? playerReady.user.facebook.name : playerReady.user._id} is ready`)

                        if (playersReady.length === this.gameRoomPlayersAmount) { //all players ready_for_mini_game
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
}