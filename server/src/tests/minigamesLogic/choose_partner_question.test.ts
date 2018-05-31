// ==========
// ===== imports
// ==========
import { assert, expect } from 'chai';

import * as config from 'config';
// ===========
// ===== models
// ===========
import { choose_partner_question_logic, iMiniGameState, iInitData, PlayAction } from '../../game/mini_games/logic/choose_partner_question/choose_partner_question.logic';
import { iQuestion } from '../../game/mini_games/choose_partner_question/questions.model';
import { iPlayAction } from '../../game/models/iPlayData';
import { CHOOSE_QUESTIONS_PLAY_ACTIONS } from '../../game/mini_games/logic/choose_partner_question/PLAY_ACTIONS_ENUM';
import { Logger } from '../../utils/Logger';
import { MINIGAME_STATUS } from '../../game/mini_games/logic/MINIGAME_STATUS_ENUM';
const TAG: string = 'choose_partner_question_logic TESTS |'
let logic: choose_partner_question_logic = null;


describe('choose_partner_question_logic', () => {
    let mockQUestiosn: iQuestion[];
    let questionsRemaining: number;
    let playersId;
    let firstPlayerId: string;
    before((done) => {

        done();
    })
    beforeEach((done) => {
        logic = new choose_partner_question_logic();
        mockQUestiosn = [{ q: 'q1', a: ['answer1', 'answer2'] }, { q: 'q2', a: ['answer1', 'answer2'] }, { q: 'q3', a: ['answer1', 'answer2'] }];
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
            const result: { valid: boolean, state: iMiniGameState } = logic.initMiniGame(null);
            //asset
            assert.equal(result.valid, false);
        });

        it('should return valid=false if initialization data of playersId contain 1 player', () => {
            //init
            const mockQUestiosn: iQuestion[] = [{ q: 'daa', a: ['answer1', 'answer2'] }, { q: 'daa', a: ['answer1', 'answer2'] }, { q: 'daa', a: ['answer1', 'answer2'] }];
            const initData: iInitData = { questions: mockQUestiosn, questionsRemaining: mockQUestiosn.length, playersId: ['player1'], firstPlayerTurnId: 'player1' };
            //action
            const result: { valid: boolean, state: iMiniGameState } = logic.initMiniGame(initData);
            //asset
            assert.equal(result.valid, false);
        });

        it('should return valid=false if initialization data not conatain [firstPlayerTurnId]', () => {
            //init
            const initData: iInitData = { questions: mockQUestiosn, questionsRemaining: questionsRemaining, playersId: playersId, firstPlayerTurnId: null };
            //action
            const result: { valid: boolean, state: iMiniGameState } = logic.initMiniGame(initData);
            //asset
            assert.equal(result.valid, false);
        });

        it('should return [playerTurnId] equal to the provided [firstPlayerTurnId] in the result.state', () => {
            //init
            const firstPlayerId = 'A';
            const initData: iInitData = { questions: mockQUestiosn, questionsRemaining: questionsRemaining, playersId: playersId, firstPlayerTurnId: firstPlayerId };
            //action
            const result: { valid: boolean, state: iMiniGameState } = logic.initMiniGame(initData);
            //asset
            expect(result.state.playerTurnId).to.equal(firstPlayerId);
        });

    });
    /**play */
    describe('play', () => {

        beforeEach(() => {

        });

        it('should [Change] [playerTrunId] to the next id in the [playersId] Array - when player ask a [Question] and playAction is [Valid]', () => {
            //init
            const initResult: { valid: boolean, state: iMiniGameState } = logic.initMiniGame({ questions: mockQUestiosn, questionsRemaining: questionsRemaining, playersId: playersId, firstPlayerTurnId: firstPlayerId });
            expect(playersId).to.include(firstPlayerId);
            Logger.d(TAG, `firstPlayerId=${firstPlayerId}`, 'cyan');
            const firstPlayerIdIndex = playersId.findIndex(pId => pId === firstPlayerId);
            //action
            const playAction: PlayAction = { type: CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question, payload: 0, playerId: firstPlayerId }//chose first question
            const firstTurnResult = logic.play(initResult.state, playAction);
            const secondPlayerId: string = firstTurnResult.state.playerTurnId;
            Logger.d(TAG, `secondPlayerId=${secondPlayerId}`, 'cyan');

            //assert
            expect(playersId).to.include(secondPlayerId)
            if (firstPlayerIdIndex === playersId.length - 1) { expect(secondPlayerId).to.equal(playersId[0]) }
            else {
                expect(secondPlayerId).to.equal(playersId[firstPlayerIdIndex + 1])
            }
        });



        it('should [NOT] [Change] [playerTrunId] to the next id in the [playersId] Array - when player [Answer] and playActions are [Valid]', () => {
            //init        
            const initResult: { valid: boolean, state: iMiniGameState } = logic.initMiniGame({ questions: mockQUestiosn, questionsRemaining: questionsRemaining, playersId: playersId, firstPlayerTurnId: firstPlayerId });
            const askAction: PlayAction = { type: CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question, payload: 0, playerId: initResult.state.playerTurnId }//chose first question
            const firstTurnResult = logic.play(initResult.state, askAction);
            const AnswerPlayerId: string = firstTurnResult.state.playerTurnId;
            //action
            const answerAction: PlayAction = { type: CHOOSE_QUESTIONS_PLAY_ACTIONS.answer_question, payload: 0, playerId: AnswerPlayerId }//chose first question
            const secondTurnResult = logic.play(firstTurnResult.state, answerAction);
            const AskerPlayerId = secondTurnResult.state.playerTurnId;
            expect(secondTurnResult.valid).to.be.true;
            expect(AnswerPlayerId).to.eq(AskerPlayerId);
            //assert
        });

        it('should [Decrease] [questionsRemaining] By 1 each time player [Answer] and playActions are [Valid]', () => {
            //init        
            const initResult: { valid: boolean, state: iMiniGameState } = logic.initMiniGame({ questions: mockQUestiosn, questionsRemaining: questionsRemaining, playersId: playersId, firstPlayerTurnId: firstPlayerId });
            expect(initResult.valid).to.be.true;
            const askAction: PlayAction = { type: CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question, payload: 0, playerId: initResult.state.playerTurnId }//chose first question
            const firstTurnResult = logic.play(initResult.state, askAction);
            const AnswerPlayerId: string = firstTurnResult.state.playerTurnId;
            //action
            const answerAction: PlayAction = { type: CHOOSE_QUESTIONS_PLAY_ACTIONS.answer_question, payload: 0, playerId: AnswerPlayerId }//chose first question
            const secondTurnResult = logic.play(firstTurnResult.state, answerAction);
            const questionRemainingAfterAnswer = secondTurnResult.state.questionsRemaining;
            //assert
            expect(questionRemainingAfterAnswer).to.eq(questionsRemaining - 1);
        });

        it('should [NOT] [Decrease] [questionsRemaining] By 1 when player [Ask] and playActions are [Valid]', () => {
            //init
            const initResult: { valid: boolean, state: iMiniGameState } = logic.initMiniGame({ questions: mockQUestiosn, questionsRemaining: questionsRemaining, playersId: playersId, firstPlayerTurnId: firstPlayerId });
            const askAction: PlayAction = { type: CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question, payload: 0, playerId: initResult.state.playerTurnId }//chose first question
            //action
            const firstTurnResult = logic.play(initResult.state, askAction);
            const questionRemainingAfterAsking = firstTurnResult.state.questionsRemaining;
            //assert
            expect(questionRemainingAfterAsking).to.eq(questionsRemaining);
        });

        it('should [Substract] the chosen question when player [Ask] it', () => {
            //init        
            const initResult: { valid: boolean, state: iMiniGameState } = logic.initMiniGame({ questions: mockQUestiosn, questionsRemaining: questionsRemaining, playersId: playersId, firstPlayerTurnId: firstPlayerId });
            expect(initResult.valid).to.be.true;
            const questionsNumber: number = mockQUestiosn.length;
            console.dir(initResult);
            const askAction: PlayAction = { type: CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question, payload: 0, playerId: initResult.state.playerTurnId }//chose first question
            const firstTurnResult = logic.play(initResult.state, askAction);
            console.dir(firstTurnResult);
            const leftQuestionsNumber: number = firstTurnResult.state.questions.length;
            expect(leftQuestionsNumber).to.eq(questionsNumber - 1);
        });
        it('should change [minigameStatus] to [ended] when [questionsRemaining] equal [0] and playActions are [Valid]', () => {
            //init        
            const initQuestionRemaining: number = 1;
            const initResult: { valid: boolean, state: iMiniGameState } = logic.initMiniGame({ questions: mockQUestiosn, questionsRemaining: initQuestionRemaining, playersId: playersId, firstPlayerTurnId: firstPlayerId });
            const askerPlayerId: string = initResult.state.playerTurnId;
            const askAction: PlayAction = { type: CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question, payload: 0, playerId: askerPlayerId }//chose first question
            const firstTurnResult = logic.play(initResult.state, askAction);
            //action
            const answerPlayerId: string = firstTurnResult.state.playerTurnId;
            const answerAction: PlayAction = { type: CHOOSE_QUESTIONS_PLAY_ACTIONS.answer_question, payload: 0, playerId: answerPlayerId }//chose first question
            const secondTurnResult = logic.play(firstTurnResult.state, answerAction);
            const minigamestatus: MINIGAME_STATUS = secondTurnResult.state.minigameStatus;
            //assert
            expect(minigamestatus).to.eq(MINIGAME_STATUS.ended);
        });

        it('should return [Valid=false] when the playAction contain Wrong player Turn', () => {
            //init
            const firstPlayerId: string = 'A'
            const initResult: { valid: boolean, state: iMiniGameState } = logic.initMiniGame({ questions: mockQUestiosn, questionsRemaining: questionsRemaining, playersId: playersId, firstPlayerTurnId: firstPlayerId });
            //action
            const wrongPlayerTurn: string = 'B';
            const playAction: PlayAction = { type: CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question, payload: 0, playerId: wrongPlayerTurn }//chose first question
            const firstTurnResult = logic.play(initResult.state, playAction);

            //assert
            expect(firstTurnResult.valid).to.be.false;

        });
    });
});