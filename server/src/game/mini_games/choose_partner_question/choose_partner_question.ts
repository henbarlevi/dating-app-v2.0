// ===== models
import { iGameRoom } from "../../models/iGameRoom";
import { iGameSocket } from '../../models/iGameSocket';

import { miniGame } from "../abstract_minigame";
import { GAME_SOCKET_EVENTS } from '../../../../../contract/GAME_SOCKET_EVENTS';
// ===== utils
import allQuestions from './questions';
const NumberOfQuestionsPerGame: number = 7;
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
        console.log(allQuestions);
        let randomQuestions = choose_partner_question.randomizeQuestions();
        //declaring the mini game that should start - this is how client know to load the minigame screen:
        this.io.to(this.gameRoom.roomId).emit(GAME_SOCKET_EVENTS.init_mini_game, {
            gameType: GAME_TYPE.choose_partner_question,
            initData: randomQuestions
        });
        await this.WaitForPlayersToBeReady(); //calling super class

    }

    async playMiniGame() {
        try {
            this.initMiniGame();
            let turn: iGameSocket;
            let passive:iGameSocket;
            //randomize first player to play:
            Math.floor(Math.random() * 2) === 0 ?
                turn = this.gameRoom.playerOne : turn = this.gameRoom.playerTwo

            this.io.to(this.gameRoom.roomId).on(GAME_SOCKET_EVENTS.play, async (socket: iGameSocket) => {
                if (turn === socket) {//if its his turn
                    //tell the other player about his partner turn
                    
                } else {
                    Logger.d(TAG, `Warning - the player try to play when its not his turn`, 'red');
                }
            })
            //tell to socket that its turn to play
            turn.emit(GAME_SOCKET_EVENTS.player_turn,true);
            
            //DOENT FORGET TO REMOVE LISTENERS FOR EVETNS
        }
        catch (e) {
            Logger.d(TAG, `Err =======>${e}`, 'red');
        }


    }

    private static randomizeQuestions(): Array<any> {
        let min: number = 0;
        let max: number = allQuestions.length - NumberOfQuestionsPerGame;
        let startIndex = Math.floor(Math.random() * (max - min + 1) + min);
        let randomQuestions = allQuestions.slice(startIndex, startIndex + NumberOfQuestionsPerGame);
        return randomQuestions
    }

}

interface iPlayData<T> {
    playType: T
    data: any
}
enum QuestionPlayType {
    ask_question,
    answer_question
}