// ===== models
import { iGameRoom } from "../models/iGameRoom";
import { iGameSocket } from '../models/iGameSocket';

import { miniGame } from "./abstract_minigame";
import { GAME_SOCKET_EVENTS } from "../models/GAME_SOCKET_EVENTS";
import { Logger } from "../../utils/Logger";
const TAG: string = 'choose_partner_question';
export class choose_partner_question extends miniGame {

    constructor(io: SocketIO.Namespace, gameRoom: iGameRoom) {
        super(io, gameRoom);
    }

    async initMiniGame() {
        //declaring the mini game that should start - this is how client know to load the minigame screen:
        this.io.to(this.gameRoom.roomId).emit(GAME_SOCKET_EVENTS.init_mini_game, { initData: {} });
        await this.WaitForPlayersToBeReady();

    }
    async startMiniGame() {
        try {
            this.initMiniGame();
            let turn: iGameSocket;
            //randomize first player:
            Math.floor(Math.random() * 2) === 0 ?
                turn = this.gameRoom.playerOne : turn = this.gameRoom.playerTwo

            if (turn === gameRoom.playerOne) {
                
            }
        }
        catch (e) {
            Logger.d(TAG, `Err =======>${e}`, 'red');
        }


    }

}