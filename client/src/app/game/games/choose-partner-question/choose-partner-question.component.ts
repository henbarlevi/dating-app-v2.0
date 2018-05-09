import { Component, OnInit, ViewChild } from '@angular/core';
import { GameService } from '../../game.service';
import { Observable } from 'rxjs/Observable';
// ===== models
import { iSocketData } from '../../models/iSocketData.model';
import { GAME_SOCKET_EVENTS } from '../../models/GAME_SOCKET_EVENTS.enum';

//import {test} from './_ngrx/minigame.reducer';
import { minigameReducer } from './_ngrx/minigame.reducer';//set reducerfunction for minigame (setReducerFunction in the bottom)
/**IMPORTANT! SET REDUCER IN THIS CONTIANER so it could be available in the gameRducer */
MinigamesReducerContainer.setReducerFunction(MINIGAME_TYPE.choose_partner_question, minigameReducer);

import { iQuestion } from './questions.model';
import { game$Event } from '../../models/game$Event.model';
import { iPlayAction } from '../../models/iPlayData';
import { iGameState, getMiniGameState, getGameState } from '../../_ngrx/game.reducers';
//ngrx (redux)
import * as GameActions from '../../_ngrx/game.actions'
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
// ===== logic
import { iInitData, iMiniGameState, PlayAction } from '../logic/choose_partner_question/choose_partner_question.logic';
import { MinigamesReducerContainer } from '../../_ngrx/minigames.reducers';
import { CHOOSE_QUESTIONS_PLAY_ACTIONS } from '../logic/choose_partner_question/PLAY_ACTIONS_ENUM';
import { MINIGAME_TYPE } from '../logic/MINIGAME_TYPE_ENUM';
import { Router } from '@angular/router';
// ===== utils
const TAG: string = 'ChoosePartnerQuestionComponent |';

@Component({
  selector: 'app-choose-partner-question',
  templateUrl: './choose-partner-question.component.html',
  styleUrls: ['./choose-partner-question.component.scss']
})
export class ChoosePartnerQuestionComponent implements OnInit, OnDestroy {
  playerId: string = '';
  gameState$: Observable<iGameState>;
  minigameState: iMiniGameState;//get updated each time minigameState$ raise event
  partnersPlayActions$Sub: Subscription;
  @ViewChild('partnersPlayActionsModal') partnersPlayActionsModal; //modal that pop up to present the partner actions

  constructor(
    private GameService: GameService,
    private store: Store<iGameState>,
    private router: Router) {
  }
  /**is it this player turn */
  get playerTurn() {
    return this.playerId && this.playerId === this.minigameState.playerTurnId; //is currentTurnId = to the this playerId
  }
  /**return the latest chosen question. if not exist return empty string */
  get chosenQuestion(): string {
    return this.minigameState && this.minigameState.currentQuestion ? this.minigameState.currentQuestion.q : '';
  }
  /**return the latest chosen Answer. if not exist return empty string */
  get chosenAnswer(): string {
    return this.minigameState && this.minigameState.currentAnswerIndex >= 0 ? this.minigameState.currentQuestion.a[this.minigameState.currentAnswerIndex] : '';
  }
  ngOnInit() {
    this.gameState$ = this.store.select(getGameState);
    this.gameState$.subscribe((gameState: iGameState) => {
      this.minigameState = gameState.miniGameState;
      this.playerId = gameState && gameState.player ? gameState.player.id : '';
    });
    this.handleMiniGameInitalization()/**listen to [init_mini_game] event and update the minigamestate */
    /**listen to partners play actions events and  when occurr 
    1.dispach the updateMiniGame action
    2.pop up the partnersPlayActionsModal to display the partner action
    */
    this.handlePartnersActions();
    /**listen to mini_game_ended event */
    this.handleMinigameEnd();
  }
  onQuestionSelected(questionIndex: number) {
    if (this.playerTurn) {
      //emit the play action
      console.log('question has been selected :' + questionIndex)
      const playAction: PlayAction = { type: CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question, payload: questionIndex, playerId: this.playerId };
      //send playAction to server
      this.GameService.emitGameEvent(GAME_SOCKET_EVENTS.play, playAction);
      //dispatch UPDATE minigame change:
      this.store.dispatch(new GameActions.updateMinigame({ miniGameType: MINIGAME_TYPE.choose_partner_question, playAction: playAction }));
      //this.playerTurn = false;
    } else {
      console.log(TAG, 'its not your turn');
    }
  }
  onAnswerSelected(answerIndex: number) {
    if (this.playerTurn) {
      console.log('answer has been selected :' + answerIndex)
      let playAction: PlayAction = { type: CHOOSE_QUESTIONS_PLAY_ACTIONS.answer_question, payload: answerIndex, playerId: this.playerId };
      this.GameService.emitGameEvent(GAME_SOCKET_EVENTS.play, playAction);
      this.store.dispatch(new GameActions.updateMinigame({ miniGameType: MINIGAME_TYPE.choose_partner_question, playAction: playAction }));
      //this.playerTurn = false;
    } else {
      console.log(TAG, 'its not your turn');
    }
  }
  private handleMiniGameInitalization() {
    const game$: Observable<game$Event> = this.GameService.game$;
    const initMiniGame$ = game$.filter((gameEvent: game$Event) => gameEvent.eventName === GAME_SOCKET_EVENTS.init_mini_game).first();
    initMiniGame$.subscribe((gameEvent: game$Event) => {
      const miniGameType: MINIGAME_TYPE = gameEvent.eventData.miniGameType;
      if (miniGameType === MINIGAME_TYPE.choose_partner_question) { //if the socket get an 'init)mini_game event'
        const initData: iInitData = gameEvent.eventData.initData;
        this.store.dispatch(new GameActions.initalNewMinigame({ initialData: initData, miniGameType: miniGameType }))
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
  /**listen to partners play actions events and  when occurr 
  1.dispach the updateMiniGame action
  2.pop up the partnersPlayActionsModal to display the partner action
  */
  private handlePartnersActions() {
    const partnersPlayActions$: Observable<game$Event> = this.GameService.game$.filter((gameEvent: game$Event) => gameEvent.eventName === GAME_SOCKET_EVENTS.partner_played);
    this.partnersPlayActions$Sub = partnersPlayActions$.subscribe((gameEvent: game$Event) => {
      const playAction: PlayAction = gameEvent.eventData;
      this.store.dispatch(new GameActions.updateMinigame({ miniGameType: MINIGAME_TYPE.choose_partner_question, playAction: playAction }));
      this.partnersPlayActionsModal.openModal()//TEST TODODTODO
    })
  }

  private handleMinigameEnd() {
    this.GameService
      .getGameEventsByName(GAME_SOCKET_EVENTS.mini_game_ended)
      .first()
      .subscribe(() => {
        //TODO - do some general handling when minigame ends (show modal for example before navigating to the next game)
        setTimeout(() => {
          this.GameService.emitGameEvent(GAME_SOCKET_EVENTS.mini_game_ended);//inform server that it received that the game ended
          return this.router.navigate([`/dashboard/game`]);//will navigate to loading page 
        }, 3000);
      })
  }

}


