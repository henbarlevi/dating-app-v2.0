// ===== models
import { iGameRoom } from "../../models/iGameRoom";
import { iGameSocket } from '../../models/iGameSocket';

import { miniGame } from "../abstract_minigame";

import allQuestions from './questions';
const NumberOfQuestionsPerGame: number = 7;
import { GAME_TYPE } from "../../models/GAME_TYPE_ENUM";
import { GAME_SOCKET_EVENTS } from "../../models/GAME_SOCKET_EVENTS";
import { utilsService } from "../../../utils/utils.service";
import { game$, game$Event } from "../../game$.service";
import { Subscription } from "rxjs/Subscription";
import { iQuestion } from "./questions.model";
import { iPlayAction } from "../../models/iPlayData";
import { CHOOSE_QUESTIONS_PLAY_ACTIONS } from "./PLAY_ACTIONS_ENUM";
import { iGenericMiniGameState } from "../iminiGameState.model";
// ===== redux
import { createStore, Store } from 'redux';
import { MiniGameStateReducer, iMiniGameState } from "./redux/minigame_state.reducers";

// ===== utils
import { Logger } from "../../../utils/Logger";
const TAG: string = 'choose_partner_question';
export class choose_partner_question extends miniGame {
    private randomQuestions: iQuestion[];
    private miniGameState: Store<iMiniGameState>;
    /**Ctor */
    constructor(io: SocketIO.Namespace, gameRoom: iGameRoom) {
        super(io, gameRoom);
        const initialState: iMiniGameState = {
            currentAnswerIndex: -1,//answer not yet chosen
            currentQuestionIndex: -1,//question not yet chosen
            currentGameAction: CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question, //game waiting for player to choose a -question
            questionsRemaining: NumberOfQuestionsPerGame,
            numberOfPlayers: 2,//number of playerS is 2 if nothing say otherwise [should be permanent]
            numberOfPlayersLeftToAnswer: 2
        };
        this.miniGameState = createStore(MiniGameStateReducer, initialState);
    }
    /**tell players what minigame theyplay + initial data for the game, and wait until they say they ready */
    async initMiniGame() {
        Logger.d(TAG, `initalizing the [choose_partner_question] game...`, 'gray');
        //lading questions:
        this.randomQuestions = choose_partner_question.randomizeQuestions();
        //Logger.d(TAG,`this game random questions : ${randomQuestions.map((q)=>{return q.q})}`) //DEBUG

        //declaring the mini game that should start - this is how client know to load the minigame screen:
        this.io.to(this.gameRoom.roomId).emit(GAME_SOCKET_EVENTS.init_mini_game, {
            gameType: GAME_TYPE.choose_partner_question,
            initData: this.randomQuestions
        });
        await this.WaitForPlayersToBeReady(); //calling super class
        Logger.d(TAG, 'players are ready!');
    }

    async playMiniGame() {
        try {
            await this.initMiniGame();
            let turn: iGameSocket;//who socket turn is
            //randomize first player to play:
            let firstTurnPlayerIndex: number = this.randomizeFirstTurn();
            //tell players who's turn is
            turn = this.gameRoom.players[firstTurnPlayerIndex];
            this.gameRoom.players.forEach(player => {
                player === turn ?
                    player.emit(GAME_SOCKET_EVENTS.your_turn) : player.emit(GAME_SOCKET_EVENTS.partner_turn);
            })
            //mini game initial state
            // let miniGameState: iMiniGameState = {
            //     currentAnswerIndex: -1,//answer not yet chosen
            //     currentQuestionIndex: -1,//question not yet chosen
            //     currentGameAction: CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question //game waiting for player to choose a -question
            // }
            //listen to minigame players actions

            let play$Subscription: Subscription = game$.filter((gameEvent: game$Event) =>
                gameEvent.eventName === GAME_SOCKET_EVENTS.play &&
                gameEvent.socket.gameRoomId === this.gameRoom.roomId)
                .subscribe((gameEvent: game$Event) => {
                    if (turn.user._id === gameEvent.socket.user._id) {//if its his turn
                        const playActionData: iPlayAction<CHOOSE_QUESTIONS_PLAY_ACTIONS> = gameEvent.eventData as iPlayAction<CHOOSE_QUESTIONS_PLAY_ACTIONS>;
                        this.miniGameState.dispatch(playActionData);
                        //const playActionIsValid: boolean = this.ValidatePlayAction(miniGameState, playActionData);
                        // if (playActionIsValid) {
                        //miniGameState = updateMiniGameState(miniGameState, playActionData);
                        this.gameRoom.players.forEach(p => p.user._id !== turn.user._id ? p.emit(GAME_SOCKET_EVENTS.partner_played, { turn }) : '')
                        // }
                    } else {
                        Logger.d(TAG, `Warning - the player try to play when its not his turn`, 'red');
                    }
                })
            // this.miniGameState.subscribe(() => {
            //     Logger.d(TAG, `miniGame (gameRoomId=${this.gameRoom.roomId.slice(0, 5)}..) State Changed :`, 'magenta');
            //     Logger.d(TAG, this.miniGameState.getState(), 'magenta');

            // }) //TODOTODO continue implement the migration to redux .getState()
            //TODO
            //DONT FORGET TO UNSBSRIBE When FOR EVETNS
            //TODO - Handle disconnection in a middle of a game
        }
        catch (e) {
            Logger.d(TAG, `Err =======>${e}`, 'red');
        }


    }
    //TODOTODOTODO transfer this to be handled by redux structure 
    // private updateMiniGameState(miniGameState: iMiniGameState, playActionData: iPlayAction<CHOOSE_QUESTIONS_PLAY_ACTIONS>): iMiniGameState {
    //     if (playActionData.type === CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question) {
    //         return {
    //             currentAnswerIndex: miniGameState
    //         }
    //     }
    //     return {
    //         currentAnswerIndex
    //     }
    // }
    private randomizeFirstTurn(): number {
        return utilsService.randomizeInt(0, this.gameRoomPlayersAmount - 1);

    }
    /**receive 'play' event that accure on the gameroom and return if its valid or not
     * by considering the state of the game
     */
    private ValidatePlayAction(miniGameState: iMiniGameState, playActionData: iPlayAction<CHOOSE_QUESTIONS_PLAY_ACTIONS>): boolean {
        if (!playActionData || !playActionData.payload) { return false }///TODOTODOTODO decide how client will send the play action data -currently client send the full question string but index its enough
        if (playActionData.type !== miniGameState.currentGameAction) { return false }
        //if player choose a question
        let emitedValue = playActionData.payload;
        if (typeof emitedValue === 'number') {
            Logger.d(TAG, `the emittedvalue is not a number, its a ${typeof emitedValue}`, 'red');
        }
        if (miniGameState.currentGameAction === CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question) {
            //check its a valid question index value:
            let chosenQuestionIndex = playActionData.payload as number;
            let questionsMaxIndex: number = this.randomQuestions.length - 1;//max valid index
            return !(chosenQuestionIndex < 0 || chosenQuestionIndex > questionsMaxIndex);

        } else {//if player choose an answer
            //check its a valid answer index value:
            let currentQuestionIndex = miniGameState.currentQuestionIndex;
            let chosenAnswerIndex = playActionData.payload as number;
            let AnswersMaxIndex: number = this.randomQuestions[currentQuestionIndex].a.length - 1;//max valid index
            return !(chosenAnswerIndex < 0 || chosenAnswerIndex > AnswersMaxIndex);
        }
    }
    private static randomizeQuestions(): Array<iQuestion> {
        let min: number = 0;
        let max: number = allQuestions.length - NumberOfQuestionsPerGame;
        let startIndex = Math.floor(Math.random() * (max - min + 1) + min);
        let randomQuestions = allQuestions.slice(startIndex, startIndex + NumberOfQuestionsPerGame);
        return randomQuestions
    }

}


