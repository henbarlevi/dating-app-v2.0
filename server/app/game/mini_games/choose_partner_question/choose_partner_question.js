"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_minigame_1 = require("../abstract_minigame");
const questions_1 = require("./questions");
const NumberOfQuestionsPerGame = 7;
const GAME_TYPE_ENUM_1 = require("../../models/GAME_TYPE_ENUM");
const GAME_SOCKET_EVENTS_1 = require("../../models/GAME_SOCKET_EVENTS");
const utils_service_1 = require("../../../utils/utils.service");
const game__service_1 = require("../../game$.service");
const PLAY_ACTIONS_ENUM_1 = require("./PLAY_ACTIONS_ENUM");
// ===== redux
const redux_1 = require("redux");
const minigame_state_reducers_1 = require("./redux/minigame_state.reducers");
// ===== utils
const Logger_1 = require("../../../utils/Logger");
const TAG = 'choose_partner_question';
class choose_partner_question extends abstract_minigame_1.miniGame {
    /**Ctor */
    constructor(io, gameRoom) {
        super(io, gameRoom);
        const initialState = {
            currentAnswerIndex: -1,
            currentQuestionIndex: -1,
            currentGameAction: PLAY_ACTIONS_ENUM_1.CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question,
            questionsRemaining: NumberOfQuestionsPerGame,
            numberOfPlayers: 2,
            numberOfPlayersLeftToAnswer: 2
        };
        this.miniGameState = redux_1.createStore(minigame_state_reducers_1.MiniGameStateReducer, initialState);
    }
    /**tell players what minigame theyplay + initial data for the game, and wait until they say they ready */
    initMiniGame() {
        return __awaiter(this, void 0, void 0, function* () {
            Logger_1.Logger.d(TAG, `initalizing the [choose_partner_question] game...`, 'gray');
            //lading questions:
            this.randomQuestions = choose_partner_question.randomizeQuestions();
            //Logger.d(TAG,`this game random questions : ${randomQuestions.map((q)=>{return q.q})}`) //DEBUG
            //declaring the mini game that should start - this is how client know to load the minigame screen:
            this.io.to(this.gameRoom.roomId).emit(GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.init_mini_game, {
                gameType: GAME_TYPE_ENUM_1.GAME_TYPE.choose_partner_question,
                initData: this.randomQuestions
            });
            yield this.WaitForPlayersToBeReady(); //calling super class
            Logger_1.Logger.d(TAG, 'players are ready!');
        });
    }
    playMiniGame() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.initMiniGame();
                let turn; //who socket turn is
                //randomize first player to play:
                let firstTurnPlayerIndex = this.randomizeFirstTurn();
                //tell players who's turn is
                turn = this.gameRoom.players[firstTurnPlayerIndex];
                this.gameRoom.players.forEach(player => {
                    player === turn ?
                        player.emit(GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.your_turn) : player.emit(GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.partner_turn);
                });
                //mini game initial state
                // let miniGameState: iMiniGameState = {
                //     currentAnswerIndex: -1,//answer not yet chosen
                //     currentQuestionIndex: -1,//question not yet chosen
                //     currentGameAction: CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question //game waiting for player to choose a -question
                // }
                //listen to minigame players actions
                let play$Subscription = game__service_1.game$.filter((gameEvent) => gameEvent.eventName === GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.play &&
                    gameEvent.socket.gameRoomId === this.gameRoom.roomId)
                    .subscribe((gameEvent) => {
                    if (turn.user._id === gameEvent.socket.user._id) {
                        const playActionData = gameEvent.eventData;
                        this.miniGameState.dispatch(playActionData);
                        //const playActionIsValid: boolean = this.ValidatePlayAction(miniGameState, playActionData);
                        // if (playActionIsValid) {
                        //miniGameState = updateMiniGameState(miniGameState, playActionData);
                        this.gameRoom.players.forEach(p => p.user._id !== turn.user._id ? p.emit(GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.partner_played, { turn }) : '');
                        // }
                    }
                    else {
                        Logger_1.Logger.d(TAG, `Warning - the player try to play when its not his turn`, 'red');
                    }
                });
                this.miniGameState.subscribe(() => {
                    Logger_1.Logger.d(TAG, `miniGame (gameRoomId=${this.gameRoom.roomId.slice(0, 5)}..) State Changed :`, 'magenta');
                    Logger_1.Logger.d(TAG, this.miniGameState.getState(), 'magenta');
                }); //TODOTODO continue implement the migration to redux .getState()
                //TODO
                //DONT FORGET TO UNSBSRIBE When FOR EVETNS
                //TODO - Handle disconnection in a middle of a game
            }
            catch (e) {
                Logger_1.Logger.d(TAG, `Err =======>${e}`, 'red');
            }
        });
    }
    //TODOTODOTODO transfer this to be handled by redux structure 
    updateMiniGameState(miniGameState, playActionData) {
        if (playActionData.type === PLAY_ACTIONS_ENUM_1.CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question) {
            return {
                currentAnswerIndex: miniGameState
            };
        }
        return {
            currentAnswerIndex
        };
    }
    randomizeFirstTurn() {
        return utils_service_1.utilsService.randomizeInt(0, this.gameRoomPlayersAmount - 1);
    }
    /**receive 'play' event that accure on the gameroom and return if its valid or not
     * by considering the state of the game
     */
    ValidatePlayAction(miniGameState, playActionData) {
        if (!playActionData || !playActionData.payload) {
            return false;
        } ///TODOTODOTODO decide how client will send the play action data -currently client send the full question string but index its enough
        if (playActionData.type !== miniGameState.currentGameAction) {
            return false;
        }
        //if player choose a question
        let emitedValue = playActionData.payload;
        if (typeof emitedValue === 'number') {
            Logger_1.Logger.d(TAG, `the emittedvalue is not a number, its a ${typeof emitedValue}`, 'red');
        }
        if (miniGameState.currentGameAction === PLAY_ACTIONS_ENUM_1.CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question) {
            //check its a valid question index value:
            let chosenQuestionIndex = playActionData.payload;
            let questionsMaxIndex = this.randomQuestions.length - 1; //max valid index
            return !(chosenQuestionIndex < 0 || chosenQuestionIndex > questionsMaxIndex);
        }
        else {
            //check its a valid answer index value:
            let currentQuestionIndex = miniGameState.currentQuestionIndex;
            let chosenAnswerIndex = playActionData.payload;
            let AnswersMaxIndex = this.randomQuestions[currentQuestionIndex].a.length - 1; //max valid index
            return !(chosenAnswerIndex < 0 || chosenAnswerIndex > AnswersMaxIndex);
        }
    }
    static randomizeQuestions() {
        let min = 0;
        let max = questions_1.default.length - NumberOfQuestionsPerGame;
        let startIndex = Math.floor(Math.random() * (max - min + 1) + min);
        let randomQuestions = questions_1.default.slice(startIndex, startIndex + NumberOfQuestionsPerGame);
        return randomQuestions;
    }
}
exports.choose_partner_question = choose_partner_question;
