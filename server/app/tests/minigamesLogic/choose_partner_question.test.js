"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// ==========
// ===== imports
// ==========
const chai_1 = require("chai");
// ===========
// ===== models
// ===========
const choose_partner_question_logic_1 = require("../../game/mini_games/logic/choose_partner_question/choose_partner_question.logic");
const PLAY_ACTIONS_ENUM_1 = require("../../game/mini_games/logic/choose_partner_question/PLAY_ACTIONS_ENUM");
const Logger_1 = require("../../utils/Logger");
const MINIGAME_STATUS_ENUM_1 = require("../../game/mini_games/logic/MINIGAME_STATUS_ENUM");
const TAG = 'choose_partner_question_logic TESTS |';
let logic = null;
describe('choose_partner_question_logic', () => {
    let mockQUestiosn;
    let questionsRemaining;
    let playersId;
    let firstPlayerId;
    before((done) => {
        done();
    });
    beforeEach((done) => {
        logic = new choose_partner_question_logic_1.choose_partner_question_logic();
        mockQUestiosn = [{ q: 'daa', a: ['answer1', 'answer2'] }, { q: 'daa', a: ['answer1', 'answer2'] }, { q: 'daa', a: ['answer1', 'answer2'] }];
        questionsRemaining = 3;
        playersId = ['A', 'B', 'C'];
        firstPlayerId = 'A';
        done();
    });
    /**initMiniGame */
    describe('initMiniGame', () => {
        it('should return valid=false if initialization data not exist', () => {
            //init
            //action
            const result = logic.initMiniGame(null);
            //asset
            chai_1.assert.equal(result.valid, false);
        });
        it('should return valid=false if initialization data of playersId contain 1 player', () => {
            //init
            const mockQUestiosn = [{ q: 'daa', a: ['answer1', 'answer2'] }, { q: 'daa', a: ['answer1', 'answer2'] }, { q: 'daa', a: ['answer1', 'answer2'] }];
            const initData = { questions: mockQUestiosn, questionsRemaining: mockQUestiosn.length, playersId: ['player1'], firstPlayerTurnId: 'player1' };
            //action
            const result = logic.initMiniGame(initData);
            //asset
            chai_1.assert.equal(result.valid, false);
        });
        it('should return valid=false if initialization data not conatain [firstPlayerTurnId]', () => {
            //init
            const initData = { questions: mockQUestiosn, questionsRemaining: questionsRemaining, playersId: playersId, firstPlayerTurnId: null };
            //action
            const result = logic.initMiniGame(initData);
            //asset
            chai_1.assert.equal(result.valid, false);
        });
        it('should return [playerTurnId] equal to the provided [firstPlayerTurnId] in the result.state', () => {
            //init
            const firstPlayerId = 'A';
            const initData = { questions: mockQUestiosn, questionsRemaining: questionsRemaining, playersId: playersId, firstPlayerTurnId: firstPlayerId };
            //action
            const result = logic.initMiniGame(initData);
            //asset
            chai_1.expect(result.state.playerTurnId).to.equal(firstPlayerId);
        });
    });
    /**play */
    describe('play', () => {
        beforeEach(() => {
        });
        it('should [Change] [playerTrunId] to the next id in the [playersId] Array - when player ask a [Question] and playAction is [Valid]', () => {
            //init
            const initResult = logic.initMiniGame({ questions: mockQUestiosn, questionsRemaining: questionsRemaining, playersId: playersId, firstPlayerTurnId: firstPlayerId });
            chai_1.expect(playersId).to.include(firstPlayerId);
            Logger_1.Logger.d(TAG, `firstPlayerId=${firstPlayerId}`, 'cyan');
            const firstPlayerIdIndex = playersId.findIndex(pId => pId === firstPlayerId);
            //action
            const playAction = { type: PLAY_ACTIONS_ENUM_1.CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question, payload: 0, playerId: firstPlayerId }; //chose first question
            const firstTurnResult = logic.play(initResult.state, playAction);
            const secondPlayerId = firstTurnResult.state.playerTurnId;
            Logger_1.Logger.d(TAG, `secondPlayerId=${secondPlayerId}`, 'cyan');
            //assert
            chai_1.expect(playersId).to.include(secondPlayerId);
            if (firstPlayerIdIndex === playersId.length - 1) {
                chai_1.expect(secondPlayerId).to.equal(playersId[0]);
            }
            else {
                chai_1.expect(secondPlayerId).to.equal(playersId[firstPlayerIdIndex + 1]);
            }
        });
        it('should [NOT] [Change] [playerTrunId] to the next id in the [playersId] Array - when player [Answer] and playActions are [Valid]', () => {
            //init        
            const initResult = logic.initMiniGame({ questions: mockQUestiosn, questionsRemaining: questionsRemaining, playersId: playersId, firstPlayerTurnId: firstPlayerId });
            const askAction = { type: PLAY_ACTIONS_ENUM_1.CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question, payload: 0, playerId: initResult.state.playerTurnId }; //chose first question
            const firstTurnResult = logic.play(initResult.state, askAction);
            const AnswerPlayerId = firstTurnResult.state.playerTurnId;
            //action
            const answerAction = { type: PLAY_ACTIONS_ENUM_1.CHOOSE_QUESTIONS_PLAY_ACTIONS.answer_question, payload: 0, playerId: AnswerPlayerId }; //chose first question
            const secondTurnResult = logic.play(firstTurnResult.state, answerAction);
            const AskerPlayerId = secondTurnResult.state.playerTurnId;
            chai_1.expect(secondTurnResult.valid).to.be.true;
            chai_1.expect(AnswerPlayerId).to.eq(AskerPlayerId);
            //assert
        });
        it('should [Decrease] [questionsRemaining] By 1 each time player [Answer] and playActions are [Valid]', () => {
            //init        
            const initResult = logic.initMiniGame({ questions: mockQUestiosn, questionsRemaining: questionsRemaining, playersId: playersId, firstPlayerTurnId: firstPlayerId });
            console.dir(initResult);
            chai_1.expect(initResult.valid).to.be.true;
            const askAction = { type: PLAY_ACTIONS_ENUM_1.CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question, payload: 0, playerId: initResult.state.playerTurnId }; //chose first question
            const firstTurnResult = logic.play(initResult.state, askAction);
            const AnswerPlayerId = firstTurnResult.state.playerTurnId;
            //action
            const answerAction = { type: PLAY_ACTIONS_ENUM_1.CHOOSE_QUESTIONS_PLAY_ACTIONS.answer_question, payload: 0, playerId: AnswerPlayerId }; //chose first question
            const secondTurnResult = logic.play(firstTurnResult.state, answerAction);
            const questionRemainingAfterAnswer = secondTurnResult.state.questionsRemaining;
            //assert
            chai_1.expect(questionRemainingAfterAnswer).to.eq(questionsRemaining - 1);
        });
        it('should [NOT] [Decrease] [questionsRemaining] By 1 when player [Ask] and playActions are [Valid]', () => {
            //init
            const initResult = logic.initMiniGame({ questions: mockQUestiosn, questionsRemaining: questionsRemaining, playersId: playersId, firstPlayerTurnId: firstPlayerId });
            const askAction = { type: PLAY_ACTIONS_ENUM_1.CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question, payload: 0, playerId: initResult.state.playerTurnId }; //chose first question
            //action
            const firstTurnResult = logic.play(initResult.state, askAction);
            const questionRemainingAfterAsking = firstTurnResult.state.questionsRemaining;
            //assert
            chai_1.expect(questionRemainingAfterAsking).to.eq(questionsRemaining);
        });
        it('should change [minigameStatus] to [ended] when [questionsRemaining] equal [0] and playActions are [Valid]', () => {
            //init        
            const initQuestionRemaining = 1;
            const initResult = logic.initMiniGame({ questions: mockQUestiosn, questionsRemaining: initQuestionRemaining, playersId: playersId, firstPlayerTurnId: firstPlayerId });
            const askerPlayerId = initResult.state.playerTurnId;
            const askAction = { type: PLAY_ACTIONS_ENUM_1.CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question, payload: 0, playerId: askerPlayerId }; //chose first question
            const firstTurnResult = logic.play(initResult.state, askAction);
            //action
            const answerPlayerId = firstTurnResult.state.playerTurnId;
            const answerAction = { type: PLAY_ACTIONS_ENUM_1.CHOOSE_QUESTIONS_PLAY_ACTIONS.answer_question, payload: 0, playerId: answerPlayerId }; //chose first question
            const secondTurnResult = logic.play(firstTurnResult.state, answerAction);
            const minigamestatus = secondTurnResult.state.minigameStatus;
            //assert
            chai_1.expect(minigamestatus).to.eq(MINIGAME_STATUS_ENUM_1.MINIGAME_STATUS.ended);
        });
        it('should return [Valid=false] when the playAction contain Wrong player Turn', () => {
            //init
            const firstPlayerId = 'A';
            const initResult = logic.initMiniGame({ questions: mockQUestiosn, questionsRemaining: questionsRemaining, playersId: playersId, firstPlayerTurnId: firstPlayerId });
            //action
            const wrongPlayerTurn = 'B';
            const playAction = { type: PLAY_ACTIONS_ENUM_1.CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question, payload: 0, playerId: wrongPlayerTurn }; //chose first question
            const firstTurnResult = logic.play(initResult.state, playAction);
            //assert
            chai_1.expect(firstTurnResult.valid).to.be.false;
        });
    });
});
