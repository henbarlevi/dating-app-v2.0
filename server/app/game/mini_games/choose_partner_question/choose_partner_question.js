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
const GAME_SOCKET_EVENTS_enum_1 = require("../../models/GAME_SOCKET_EVENTS.enum");
const utils_service_1 = require("../../../utils/utils.service");
// ===== redux
//import { createStore, Store } from 'redux';
//import { MiniGameStateReducer } from "./redux/minigame_state.reducers";
// ===== logic
const choose_partner_question_logic_1 = require("../logic/choose_partner_question/choose_partner_question.logic");
// ===== utils
const Logger_1 = require("../../../utils/Logger");
const TAG = 'choose_partner_question';
// =========================
// ====== ENV Configutations
// =========================
const config = require("config");
const MINIGAME_TYPE_ENUM_1 = require("../logic/MINIGAME_TYPE_ENUM");
const MINIGAME_STATUS_ENUM_1 = require("../logic/MINIGAME_STATUS_ENUM");
//import { iInitData } from "./iInitData.model";
const ENV = process.env.ENV || 'local';
const envConfig = config.get(ENV);
const NumberOfQuestionsPerGame = envConfig.game.mini_games.choose_partner_question.questions_per_game; //TODOTODTOD - check its get correct number and no crashing
class choose_partner_question extends abstract_minigame_1.miniGame {
    /**Ctor */
    constructor(io, gameRoom) {
        super(io, gameRoom);
    }
    get MiniGameState() {
        return this.miniGameState;
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
                questions: choose_partner_question.randomizeQuestions(NumberOfQuestionsPerGame + 1),
                firstPlayerTurnId: this.randomizeFirstTurn(playersId)
            };
            this.logic = new choose_partner_question_logic_1.choose_partner_question_logic();
            const initResult = this.logic.initMiniGame(initData);
            !initResult.valid ? Logger_1.Logger.d(TAG, `minigameState Initialization invalid. Err:${initResult.errText}`, 'red') : '';
            this.miniGameState = initResult.state;
            Logger_1.Logger.d(TAG, `init state:`, 'magenta');
            console.dir(this.miniGameState);
            //declaring the mini game that should start - this is how client know to load the minigame screen:
            this.io.to(this.gameRoom.roomId).emit(GAME_SOCKET_EVENTS_enum_1.GAME_SOCKET_EVENTS.init_mini_game, { initData: initData, miniGameType: MINIGAME_TYPE_ENUM_1.MINIGAME_TYPE.choose_partner_question });
            yield this.WaitForPlayersToBeReady(); //calling super class
            Logger_1.Logger.d(TAG, 'players are ready!');
        });
    }
    /**
     * @description the main method
     * 1. initMiniGame
     * 2. listen to players actions and manage the minigame
     *
     * will resolve when minigame ended
     */
    playMiniGame() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield this.initMiniGame();
                    //listen to minigame players actions
                    this.play$Subscription =
                        //pass only "play" game events that related to this gameroomId
                        this.getEventsByNameInGameroom(GAME_SOCKET_EVENTS_enum_1.GAME_SOCKET_EVENTS.play)
                            .subscribe((gameEvent) => __awaiter(this, void 0, void 0, function* () {
                            try {
                                const playerId = gameEvent.socket.user._id.toString();
                                const playAction = Object.assign({}, gameEvent.eventData, { playerId: playerId });
                                const result = this.logic.play(this.miniGameState, playAction);
                                if (result.valid) {
                                    this.miniGameState = result.state; //update state
                                    Logger_1.Logger.d(TAG, ` ** minigame state change **`, 'magenta');
                                    console.dir(TAG, this.miniGameState, 'magenta');
                                    this.tellPlayersAboutPlayAction(playerId, playAction);
                                    //if game ended
                                    if (this.miniGameState.minigameStatus === MINIGAME_STATUS_ENUM_1.MINIGAME_STATUS.ended) {
                                        yield this.endMinigame();
                                        resolve(); // playMiniGame ended
                                    }
                                }
                                else {
                                    Logger_1.Logger.d(TAG, `WARNING ! PLAY ACTION IS NOT VALID ${result.errText}: `, 'red');
                                }
                            }
                            catch (e) {
                                Logger_1.Logger.d(TAG, `Err =======>${e}`, 'red');
                            }
                        }));
                    //TODO
                    //DONT FORGET TO UNSBSRIBE When FOR EVETNS
                    //TODO - Handle disconnection in a middle of a game
                }
                catch (e) {
                    Logger_1.Logger.d(TAG, `Err =======>${e}`, 'red');
                    reject(e);
                }
            }));
        });
    }
    /**when game Ends - dispose all used observables */
    onDestory() {
        super.onDestory();
        this.play$Subscription ? this.play$Subscription.unsubscribe() : '';
        this.miniGameState = null;
        this.logic = null;
    }
    static randomizeQuestions(numberOfQuestions) {
        let min = 0;
        let max = questions_1.default.length - numberOfQuestions;
        let startIndex = utils_service_1.randomizeInt(min, max);
        let randomQuestions = questions_1.default.slice(startIndex, startIndex + numberOfQuestions);
        return randomQuestions;
    }
    /** randomize the first turn player _id in the this.gameroom.players arr
     * @return - Player _id
    */
    randomizeFirstTurn(playersId) {
        const playersAmount = playersId.length;
        const playerIndex = utils_service_1.randomizeInt(0, playersAmount - 1);
        return playersId[playerIndex];
    }
}
exports.choose_partner_question = choose_partner_question;
