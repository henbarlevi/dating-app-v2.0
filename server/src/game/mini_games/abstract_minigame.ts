import { iGameRoom } from "../models/iGameRoom";
import { iGameSocket } from "../models/iGameSocket";
import { Logger } from "../../utils/Logger";
import { GAME_TYPE } from "../models/GAME_TYPE_ENUM";
import {  } from "./choose_partner_question/choose_partner_question";
import { GAME_SOCKET_EVENTS } from "../models/GAME_SOCKET_EVENTS";
const TAG: string = 'miniGame Abstract |';
export abstract class miniGame {

    constructor(protected io: SocketIO.Namespace, protected gameRoom: iGameRoom) {

    }
    abstract async initMiniGame();  //declaring the mini game that should start and waiting for players to be ready

    abstract async playMiniGame(); //run the mini game

    WaitForPlayersToBeReady() {
        return new Promise((resolve, reject) => {

            let playerOneRadyForMiniGame: Boolean = false;
            let playerTwoRadyForMiniGame: Boolean = false;
            //TODO - dont forget to dispose event listener
            this.io.to(this.gameRoom.roomId).on(GAME_SOCKET_EVENTS.ready_for_mini_game, async (socket: iGameSocket) => {
                try {
                    Logger.d(TAG,`the user :${socket.user._id}(=_id) is ready to play`);
                    socket.user.facebook.id === this.gameRoom.playerOne.user.facebook.id ?
                        playerOneRadyForMiniGame = true : ''
                    socket.user.facebook.id === this.gameRoom.playerTwo.user.facebook.id ?
                        playerTwoRadyForMiniGame = true : ''

                    //if the 2 players are ready: start the mini game
                    if (playerOneRadyForMiniGame && playerTwoRadyForMiniGame) {
                        Logger.d(TAG, '2 players are ready to play', 'green');

                        resolve();
                    }
                }
                catch (e) {
                    Logger.d(TAG, 'ERR =====>' + e, 'red');
                    reject(e);
                }
            });



        })
    }
}