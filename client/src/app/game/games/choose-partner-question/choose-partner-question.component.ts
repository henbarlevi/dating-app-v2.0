import { Component, OnInit, ViewChild } from '@angular/core';
import { GameService } from '../../game.service';
import { Observable } from 'rxjs/Observable';
// ===== models
import { iSocketData } from '../../models/iSocketData.model';
import { GAME_SOCKET_EVENTS } from '../../models/GAME_SOCKET_EVENTS';

import { CHOOSE_QUESTIONS_PLAY_ACTIONS } from '../../../../../../contract/miniGames/choose_partner_question/PLAY_ACTIONS_ENUM';

import { iQuestion } from './questions.model';
import { game$Event } from '../../models/game$Event.model';
import { iPlayAction } from '../../models/iPlayData';
import { iGameState, getMiniGameState } from '../../_ngrx/game.reducers';
//ngrx (redux)
import * as GameActions from '../../_ngrx/game.actions'
import { Store } from '@ngrx/store';
import { GAME_TYPE } from '../../models/GAME_TYPE_ENUM';
import { initialState } from './_ngrx/minigame.reducer';//set reducerfunction for minigame
import { iMiniGameState } from './_ngrx/minigame.reducer';
import { Subscription } from 'rxjs/Subscription';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { iInitData } from './iInitData.model';
// ===== utils
const TAG: string = 'ChoosePartnerQuestionComponent |';

@Component({
  selector: 'app-choose-partner-question',
  templateUrl: './choose-partner-question.component.html',
  styleUrls: ['./choose-partner-question.component.scss']
})
export class ChoosePartnerQuestionComponent implements OnInit, OnDestroy {
  playerTurn: boolean = false;
  minigameState$: Observable<iMiniGameState>;
  minigameState: iMiniGameState = initialState;//get updated each time minigameState$ raise event
  partnersPlayActions$Sub: Subscription;
  @ViewChild('partnersPlayActionsModal') partnersPlayActionsModal; //modal that pop up to present the partner actions
  constructor(private GameService: GameService,
    private store: Store<iGameState>) {
  }

  ngOnInit() {
    this.minigameState$ = this.store.select(getMiniGameState);
    this.minigameState$.subscribe((miniGameSate: iMiniGameState) => this.minigameState = miniGameSate);
    this.handleMiniGameInitalization()/**listen to [init_mini_game] event and update the minigamestate */
    this.handlePartnersActions(); /**listen to partners play actions events and  when occurr 
    1.dispach the updateMiniGame action
    2.pop up the partnersPlayActionsModal to display the partner action
    */

    this.handleTurns();/**list to your_turn event and change playerTurn to true */


  }
  onQuestionSelected(questionIndex: number) {
    if (this.playerTurn) {
      //emit the play action
      console.log('question has been selected :' + questionIndex)
      let data: iPlayAction<CHOOSE_QUESTIONS_PLAY_ACTIONS> = { type: CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question, payload: questionIndex };
      this.GameService.emitGameEvent(GAME_SOCKET_EVENTS.play, data);
      //dispatch UPDATE minigame change:
      const playAction: iPlayAction<CHOOSE_QUESTIONS_PLAY_ACTIONS> = { type: CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question, payload: questionIndex }
      this.store.dispatch(new GameActions.updateMinigame({ miniGameType: GAME_TYPE.choose_partner_question, playAction: playAction }));
      this.playerTurn = false;
    } else {
      console.log(TAG, 'its not your turn');
    }
  }
  onAnswerSelected(answerIndex: number) {
    if (this.playerTurn) {
      console.log('answer has been selected :' + answerIndex)
      let data: iPlayAction<CHOOSE_QUESTIONS_PLAY_ACTIONS> = { type: CHOOSE_QUESTIONS_PLAY_ACTIONS.answer_question, payload: answerIndex };
      this.GameService.emitGameEvent(GAME_SOCKET_EVENTS.play, data);
      const playAction: iPlayAction<CHOOSE_QUESTIONS_PLAY_ACTIONS> = { type: CHOOSE_QUESTIONS_PLAY_ACTIONS.answer_question, payload: answerIndex }
      this.store.dispatch(new GameActions.updateMinigame({ miniGameType: GAME_TYPE.choose_partner_question, playAction: playAction }));
      this.playerTurn = false;
    } else {
      console.log(TAG, 'its not your turn');
    }
  }
  private handleMiniGameInitalization() {
    const game$: Observable<game$Event> = this.GameService.game$;
    const initMiniGame$ = game$.filter((gameEvent: game$Event) => gameEvent.eventName === GAME_SOCKET_EVENTS.init_mini_game).first();
    initMiniGame$.subscribe((gameEvent: game$Event) => {
      const miniGameType: GAME_TYPE = gameEvent.eventData.miniGameType;
      if (miniGameType === GAME_TYPE.choose_partner_question) { //if the socket get an 'init)mini_game event'
        const initData: iInitData = gameEvent.eventData;
        this.store.dispatch(new GameActions.initalNewMinigame(initData))
        this.GameService.emitGameEvent(GAME_SOCKET_EVENTS.ready_for_mini_game);

      } else {
        throw new Error('the game$ emitted [init_mini_game] but not for minigameType [choose_partner_question]')
      }
    })
  }
  isInAskQuestionMode(): boolean {
    /**concated condition (this.minigameState && ...) cause error because this method called before this.miniGameState get initiated 'cant read currentGameAction of null' (event if i inital the minigameState in the ngOnInit)so i written it this way*/
    if (this.minigameState) {
      return this.minigameState.currentGameAction === CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question;
    }
    return false;
  }

  ngOnDestroy() {
    this.partnersPlayActions$Sub ? this.partnersPlayActions$Sub.unsubscribe() : '';
  }

  private handlePartnersActions() {
    const partnersPlayActions$: Observable<game$Event> = this.GameService.game$.filter((gameEvent: game$Event) => gameEvent.eventName === GAME_SOCKET_EVENTS.partner_played);
    this.partnersPlayActions$Sub = partnersPlayActions$.subscribe((gameEvent: game$Event) => {
      const playAction: iPlayAction<CHOOSE_QUESTIONS_PLAY_ACTIONS> = gameEvent.eventData;
      this.store.dispatch(new GameActions.updateMinigame({ miniGameType: GAME_TYPE.choose_partner_question, playAction: playAction }));
      this.partnersPlayActionsModal.openModal()//TEST TODODTODO
    })
  }
  private handleTurns() {
    const yourturn$: Observable<game$Event> = this.GameService.game$.filter((gameEvent: game$Event) => gameEvent.eventName === GAME_SOCKET_EVENTS.your_turn);
    yourturn$.subscribe((gameEvent: game$Event) => {
      this.playerTurn = true;
    })
  }
}


