// ===== models
import { iGameRoom } from "../../models/iGameRoom";
import { iGameSocket } from '../../models/iGameSocket';

import { miniGame } from "../abstract_minigame";
import { GAME_SOCKET_EVENTS } from "../../models/GAME_SOCKET_EVENTS";
// ===== utils
import questions from './questions';

import { Logger } from "../../../utils/Logger";
import { GAME_TYPE } from "../../models/GAME_TYPE_ENUM";
const TAG: string = 'choose_partner_question';
export class choose_partner_question extends miniGame {

    constructor(io: SocketIO.Namespace, gameRoom: iGameRoom) {
        super(io, gameRoom);
    }

    async initMiniGame() {
        Logger.d(TAG, `initalizing the [choose_partner_question] game..`, 'gray');
        //lading questions:
        console.log(questions);
        //declaring the mini game that should start - this is how client know to load the minigame screen:
        this.io.to(this.gameRoom.roomId).emit(GAME_SOCKET_EVENTS.init_mini_game, {
            gameType: GAME_TYPE.choose_partner_question,
            initData: questions
        });
        await this.WaitForPlayersToBeReady(); //calling super class

    }
    async startMiniGame() {
        try {
            this.initMiniGame();
            let turn: iGameSocket;
            //randomize first player:
            Math.floor(Math.random() * 2) === 0 ?
                turn = this.gameRoom.playerOne : turn = this.gameRoom.playerTwo

            // if (turn === gameRoom.playerOne) {

            // }
        }
        catch (e) {
            Logger.d(TAG, `Err =======>${e}`, 'red');
        }


    }

}