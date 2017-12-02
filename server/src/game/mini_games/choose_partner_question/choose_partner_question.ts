// ===== models
import { iGameRoom } from "../../models/iGameRoom";
import { iGameSocket } from '../../models/iGameSocket';

import { miniGame } from "../abstract_minigame";

// ===== utils
import allQuestions from './questions';
const NumberOfQuestionsPerGame: number = 7;
import { Logger } from "../../../utils/Logger";
import { GAME_TYPE } from "../../models/GAME_TYPE_ENUM";
import { GAME_SOCKET_EVENTS } from "../../models/GAME_SOCKET_EVENTS";

const TAG: string = 'choose_partner_question';
export class choose_partner_question extends miniGame {

    constructor(io: SocketIO.Namespace, gameRoom: iGameRoom) {
        super(io, gameRoom);
    }
    /**tell players what minigame theyplay + initial data for the game, and wait until they say they ready */
    async initMiniGame() {
        Logger.d(TAG, `initalizing the [choose_partner_question] game...`, 'gray');
        //lading questions:
        let randomQuestions = choose_partner_question.randomizeQuestions();
        //Logger.d(TAG,`this game random questions : ${randomQuestions.map((q)=>{return q.q})}`) //DEBUG

        //declaring the mini game that should start - this is how client know to load the minigame screen:
        this.io.to(this.gameRoom.roomId).emit(GAME_SOCKET_EVENTS.init_mini_game, {
            gameType: GAME_TYPE.choose_partner_question,
            initData: randomQuestions
        });
        await this.WaitForPlayersToBeReady(); //calling super class
        Logger.d(TAG,'players are ready!');
    }

    async playMiniGame() {
        try {
           await  this.initMiniGame();
            let active: iGameSocket;
            let passive: iGameSocket;
            //randomize first player to play:
            if (Math.floor(Math.random() * 2) === 0) {
                active = this.gameRoom.playerOne
                passive = this.gameRoom.playerTwo;
            } else {
                active = this.gameRoom.playerTwo;
                passive = this.gameRoom.playerOne;
            }
            //tell player who turn it is:
            active.emit(GAME_SOCKET_EVENTS.your_turn);
            passive.emit(GAME_SOCKET_EVENTS.partner_turn);


            this.io.to(this.gameRoom.roomId).on(GAME_SOCKET_EVENTS.play, async (socket: iGameSocket,data) => {
                Logger.d(TAG,JSON.stringify(socket))
                Logger.d(TAG,JSON.stringify(data))
                
                if (active.user._id === socket.user._id) {//if its his turn
                    //tell the other player about his partner turn

                } else {
                    Logger.d(TAG, `Warning - the player try to play when its not his turn`, 'red');
                }
            })

            //DONT FORGET TO REMOVE LISTENERS FOR EVETNS
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

