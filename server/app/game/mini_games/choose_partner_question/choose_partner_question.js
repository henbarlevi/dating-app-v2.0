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
const GAME_TYPE_ENUM_1 = require("../../models/GAME_TYPE_ENUM");
const GAME_SOCKET_EVENTS_1 = require("../../models/GAME_SOCKET_EVENTS");
const utils_service_1 = require("../../../utils/utils.service");
const game__service_1 = require("../../game$.service");
// ===== logic
const choose_partner_question_logic_1 = require("../logic/choose_partner_question/choose_partner_question.logic");
// ===== utils
const Logger_1 = require("../../../utils/Logger");
const TAG = 'choose_partner_question';
// =========================
// ====== ENV Configutations
// =========================
const config = require("config");
//import { iInitData } from "./iInitData.model";
const ENV = process.env.ENV || 'local';
const envConfig = config.get(ENV);
const NumberOfQuestionsPerGame = envConfig.game.mini_games.choose_partner_question.questions_per_game; //TODOTODTOD - check its get correct number and no crashing
class choose_partner_question extends abstract_minigame_1.miniGame {
    /**Ctor */
    constructor(io, gameRoom) {
        super(io, gameRoom);
        //OLD
        // const initialState: iMiniGameState = {
        //     currentAnswerIndex: -1,//answer not yet chosen
        //     currentQuestionIndex: -1,//question not yet chosen
        //     currentGameAction: CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question, //game waiting for player to choose a -question
        //     questionsRemaining: NumberOfQuestionsPerGame,
        //     playersId: this.gameRoom.players.map(p => p.user._id.toString()),//players _id
        //     turnUserId: this.randomizeFirstTurn()
        // };
        // this.miniGameState = createStore(MiniGameStateReducer, initialState);
    }
    /**tell players what minigame theyplay + initial data for the game, and wait until they say they ready */
    initMiniGame() {
        return __awaiter(this, void 0, void 0, function* () {
            Logger_1.Logger.d(TAG, `initalizing the [choose_partner_question] game...`, 'gray');
            //new
            const playersId = this.gameRoom.players.map(p => p.user._id.toString());
            const initData = {
                questionsRemaining: NumberOfQuestionsPerGame,
                playersId: playersId,
                questions: choose_partner_question.randomizeQuestions(),
                firstPlayerTurnId: this.randomizeFirstTurn(playersId)
            };
            this.logic = new choose_partner_question_logic_1.choose_partner_question_logic();
            const initResult = this.logic.initMiniGame(initData);
            !initResult.valid ? Logger_1.Logger.d(TAG, `minigameState Initialization invalid. Err:${initResult.errText}`, 'red') : '';
            this.miniGameState = initResult.state;
            Logger_1.Logger.d(TAG, `init state:`, 'magenta');
            console.dir(this.miniGameState);
            //OLD
            // //lading questions:
            // this.randomQuestions = choose_partner_question.randomizeQuestions();
            // //Logger.d(TAG,`this game random questions : ${randomQuestions.map((q)=>{return q.q})}`) //DEBUG
            // const initData: iInitData = {
            //     miniGameType: GAME_TYPE.choose_partner_question,
            //     initialData: { questions: this.randomQuestions, questionsPerGame: NumberOfQuestionsPerGame }
            // }
            //declaring the mini game that should start - this is how client know to load the minigame screen:
            this.io.to(this.gameRoom.roomId).emit(GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.init_mini_game, { initData: initData, miniGameType: GAME_TYPE_ENUM_1.GAME_TYPE.choose_partner_question });
            yield this.WaitForPlayersToBeReady(); //calling super class
            Logger_1.Logger.d(TAG, 'players are ready!');
        });
    }
    playMiniGame() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.initMiniGame();
                //randomize first player to play:
                //const firstTurnPlayer_id: string = this.miniGameState.getState().turnUserId;
                //tell players who's turn is
                //this.tellPlayersWhoTurnItIs(firstTurnPlayer_id)//OLD
                //listen to minigame players actions
                let play$Subscription = game__service_1.game$
                    .filter((gameEvent) => {
                    return gameEvent.eventName === GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.play &&
                        gameEvent.socket.gameRoomId === this.gameRoom.roomId;
                })
                    .filter((gameEvent) => {
                    // OLD
                    // const playActionValid: boolean = this.ValidatePlayAction(this.miniGameState.getState(), gameEvent);
                    // !playActionValid ? Logger.d(TAG, 'WARNING ! PLAY ACTION IS NOT VALID', 'red') : Logger.d(TAG, 'Play Action Valid', 'gray');
                    // return playActionValid
                    return true;
                })
                    .subscribe((gameEvent) => {
                    // const playActionData: iPlayAction<CHOOSE_QUESTIONS_PLAY_ACTIONS> = gameEvent.eventData as iPlayAction<CHOOSE_QUESTIONS_PLAY_ACTIONS>;
                    // Logger.d(TAG, ` ** disapching minigame state change **`, 'magenta');
                    // this.miniGameState.dispatch({ ...playActionData, playerId: gameEvent.socket.user._id.toString() });
                    // const playerId: string = gameEvent.socket.user._id.toString();
                    // this.tellPlayersAboutPlayAction(playerId, playActionData);
                    const playerId = gameEvent.socket.user._id.toString();
                    const playAction = Object.assign({}, gameEvent.eventData, { playerId: playerId });
                    const result = this.logic.play(this.miniGameState, playAction);
                    if (result.valid) {
                        this.miniGameState = result.state; //update state
                        Logger_1.Logger.d(TAG, ` ** minigame state change **`, 'magenta');
                        console.dir(TAG, this.miniGameState, 'magenta');
                        this.tellPlayersAboutPlayAction(playerId, playAction);
                    }
                    else {
                        Logger_1.Logger.d(TAG, `WARNING ! PLAY ACTION IS NOT VALID ${result.errText}: `, 'red');
                    }
                    // this.miniGameState.dispatch({ ...playActionData, playerId: gameEvent.socket.user._id.toString() });
                    // const playerId: string = gameEvent.socket.user._id.toString();
                    //this.tellPlayersAboutPlayAction(playerId, playActionData);
                });
                //log minigame state when it change
                //OLD                
                // this.miniGameState.subscribe(() => {
                //     Logger.d(TAG, `miniGame (gameRoomId=${this.gameRoom.roomId.slice(0, 5)}..) State Changed :`, 'magenta');
                //     let newCurrentState: iMiniGameState = this.miniGameState.getState()
                //     for (let key of Object.keys(newCurrentState)) {
                //         Logger.d(TAG, `${key} = ${newCurrentState[key]}`, 'magenta');
                //     }
                //     this.tellPlayersWhoTurnItIs(newCurrentState.turnUserId);
                // })
                //TODO
                //DONT FORGET TO UNSBSRIBE When FOR EVETNS
                //TODO - Handle disconnection in a middle of a game
            }
            catch (e) {
                Logger_1.Logger.d(TAG, `Err =======>${e}`, 'red');
            }
        });
    }
    tellPlayersWhoTurnItIs(CurrentTurnPlayerId) {
        Logger_1.Logger.d(TAG, '** telling users who turn it is **', 'gray');
        this.gameRoom.players.forEach((playerSocket, playerIndex) => {
            playerSocket.user._id.toString() === CurrentTurnPlayerId ? playerSocket.emit(GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.your_turn) : playerSocket.emit(GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.partner_turn, { playerId: CurrentTurnPlayerId });
        });
    }
    /**receive 'play' event that accure on the gameroom and return if its valid or not
     * by considering the state of the game.
     * 1.validate if its the player turn
     * 2. if player choose a question - check its a valid question index value:
          if player choose an answer - """"""""
     */
    // private ValidatePlayAction(miniGameState: iMiniGameState, gameEvent: game$Event): boolean {
    //     const playActionData: iPlayAction<CHOOSE_QUESTIONS_PLAY_ACTIONS> = gameEvent.eventData as iPlayAction<CHOOSE_QUESTIONS_PLAY_ACTIONS>;
    //     if (miniGameState.turnUserId !== gameEvent.socket.user._id.toString()) {
    //         //if its NOT his turn
    //         Logger.d(TAG, `Warning - the player try to play when its not his turn`, 'red');
    //         console.log(gameEvent);
    //         return false
    //     }
    //     if (!playActionData || (!playActionData.payload && playActionData.payload !== 0)) {
    //         Logger.d(TAG, `Warning - PlayAction is null/not contain payload`, 'red');
    //         return false
    //     }
    //     if (playActionData.type !== miniGameState.currentGameAction) {
    //         Logger.d(TAG, `Warning - PlayAction type not valid for current state - playActionData.type :[${CHOOSE_QUESTIONS_PLAY_ACTIONS[playActionData.type]}] != currentState[${miniGameState.currentGameAction}]`, 'red');
    //         return false
    //     }
    //     //if player choose a question
    //     let emitedValue = playActionData.payload;
    //     if (typeof emitedValue !== 'number') {
    //         Logger.d(TAG, `the emittedvalue is not a number, its a ${typeof emitedValue}`, 'red');
    //         return false;
    //     }
    //     if (miniGameState.currentGameAction === CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question) {
    //         //check its a valid question index value:
    //         let chosenQuestionIndex = playActionData.payload as number;
    //         let questionsMaxIndex: number = this.randomQuestions.length - 1;//max valid index
    //         return !(chosenQuestionIndex < 0 || chosenQuestionIndex > questionsMaxIndex);
    //     } else {//if player choose an answer
    //         //check its a valid answer index value:
    //         const currentQuestionIndex = miniGameState.currentQuestionIndex;
    //         const chosenAnswerIndex = playActionData.payload as number;
    //         const AnswersMaxIndex: number = this.randomQuestions[currentQuestionIndex].a.length - 1;//max valid index
    //         return !(chosenAnswerIndex < 0 || chosenAnswerIndex > AnswersMaxIndex);
    //     }
    // }
    static randomizeQuestions() {
        let min = 0;
        let max = questions_1.default.length - NumberOfQuestionsPerGame;
        let startIndex = Math.floor(Math.random() * (max - min + 1) + min);
        let randomQuestions = questions_1.default.slice(startIndex, startIndex + NumberOfQuestionsPerGame);
        return randomQuestions;
    }
    /** randomize the first turn player _id in the this.gameroom.players arr
     * @return - Player _id
    */
    randomizeFirstTurn(playersId) {
        const playersAmount = playersId.length;
        const playerIndex = utils_service_1.utilsService.randomizeInt(0, playersAmount - 1);
        return playersId[playerIndex];
    }
}
exports.choose_partner_question = choose_partner_question;
