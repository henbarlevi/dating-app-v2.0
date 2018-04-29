// ===== models
import { iGameRoom } from "../../models/iGameRoom";
import { iGameSocket } from '../../models/iGameSocket';

import { miniGame } from "../abstract_minigame";

import allQuestions from './questions';
import { GAME_SOCKET_EVENTS } from "../../models/GAME_SOCKET_EVENTS.enum";
import {  randomizeInt } from "../../../utils/utils.service";
import { game$, game$Event } from "../../game$.service";
import { Subscription } from "rxjs/Subscription";
import { iQuestion } from "./questions.model";
//import { iPlayAction } from "../../models/iPlayData";
import { CHOOSE_QUESTIONS_PLAY_ACTIONS } from "./PLAY_ACTIONS_ENUM";
// ===== redux
//import { createStore, Store } from 'redux';
//import { MiniGameStateReducer } from "./redux/minigame_state.reducers";
// ===== logic
import { choose_partner_question_logic, iMiniGameState, iInitData, PlayAction } from "../logic/choose_partner_question/choose_partner_question.logic";
// ===== utils
import { Logger } from "../../../utils/Logger";
const TAG: string = 'choose_partner_question';
// =========================
// ====== ENV Configutations
// =========================
import * as config from 'config';
import { MINIGAME_TYPE } from "../logic/MINIGAME_TYPE_ENUM";
//import { iInitData } from "./iInitData.model";
const ENV: string = process.env.ENV || 'local';
const envConfig: any = config.get(ENV);
const NumberOfQuestionsPerGame: number = envConfig.game.mini_games.choose_partner_question.questions_per_game;//TODOTODTOD - check its get correct number and no crashing


export class choose_partner_question extends miniGame {
    private miniGameState: iMiniGameState;//NEW
    private logic: choose_partner_question_logic;//NEW


    /**Ctor */
    constructor(io: SocketIO.Namespace, gameRoom: iGameRoom) {
        super(io, gameRoom);

    }

    get MiniGameState():iMiniGameState {
        return this.miniGameState;
    }

    /**tell players what minigame theyplay + initial data for the game, and wait until they say they ready */
    async initMiniGame() {
        Logger.d(TAG, `initalizing the [choose_partner_question] game...`, 'gray');
        //new
        const playersId: string[] = this.gameRoom.players.map(p => p.user._id.toString());
        const initData: iInitData = {
            questionsRemaining: NumberOfQuestionsPerGame,
            playersId: playersId,
            questions: choose_partner_question.randomizeQuestions(),
            firstPlayerTurnId: this.randomizeFirstTurn(playersId)
        }
        this.logic = new choose_partner_question_logic();
        const initResult = this.logic.initMiniGame(initData);
        !initResult.valid ? Logger.d(TAG, `minigameState Initialization invalid. Err:${initResult.errText}`, 'red') : '';
        this.miniGameState = initResult.state;
        Logger.d(TAG, `init state:`, 'magenta');
        console.dir(this.miniGameState);

        //declaring the mini game that should start - this is how client know to load the minigame screen:
        this.io.to(this.gameRoom.roomId).emit(GAME_SOCKET_EVENTS.init_mini_game, { initData: initData, miniGameType: MINIGAME_TYPE.choose_partner_question });
        await this.WaitForPlayersToBeReady(); //calling super class
        Logger.d(TAG, 'players are ready!');
    }

    /**
     * @description the main method
     * 1.initMiniGame
     * 2. listen to players actions and manage the minigame
     * 
     * will resolve when minigame ended
     */
    async playMiniGame(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.initMiniGame();
                //listen to minigame players actions
                let play$Subscription: Subscription = game$
                    //pass only "play" game events that related to this gameroomId
                    .filter((gameEvent: game$Event) => {
                        const isPlayEvent: boolean = gameEvent.eventName === GAME_SOCKET_EVENTS.play;
                        const isThisRoom: boolean = gameEvent.socket.gameRoomId === this.gameRoom.roomId;
                        isPlayEvent && !isThisRoom ? Logger.d(TAG, `this gameroom id is [${this.gameRoom.roomId}] but the socket is related to ${gameEvent.socket.gameRoomId}`, 'yellow') : '';
                        return gameEvent.eventName === GAME_SOCKET_EVENTS.play &&
                            gameEvent.socket.gameRoomId === this.gameRoom.roomId
                    })
                    .subscribe((gameEvent: game$Event) => {

                        const playerId: string = gameEvent.socket.user._id.toString();
                        const playAction: PlayAction = { ...gameEvent.eventData, playerId: playerId };
                        const result = this.logic.play(this.miniGameState, playAction);
                        if (result.valid) {
                            this.miniGameState = result.state;//update state
                            Logger.d(TAG, ` ** minigame state change **`, 'magenta');
                            console.dir(TAG, this.miniGameState, 'magenta');
                            this.tellPlayersAboutPlayAction(playerId, playAction);

                        } else {
                            Logger.d(TAG, `WARNING ! PLAY ACTION IS NOT VALID ${result.errText}: `, 'red');
                        }

                    })

                //TODO
                //DONT FORGET TO UNSBSRIBE When FOR EVETNS
                //TODO - Handle disconnection in a middle of a game
            }
            catch (e) {
                Logger.d(TAG, `Err =======>${e}`, 'red');
                reject(e);
            }
        })

    }


    private static randomizeQuestions(): Array<iQuestion> {
        let min: number = 0;
        let max: number = allQuestions.length - NumberOfQuestionsPerGame;
        let startIndex =randomizeInt(min,max);
        let randomQuestions = allQuestions.slice(startIndex, startIndex + NumberOfQuestionsPerGame);
        return randomQuestions
    }
    /** randomize the first turn player _id in the this.gameroom.players arr
     * @return - Player _id
    */
    private randomizeFirstTurn(playersId: string[]): string {
        const playersAmount = playersId.length;
        const playerIndex: number = randomizeInt(0, playersAmount - 1);
        return playersId[playerIndex];
    }

}


