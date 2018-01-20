import { Component, OnInit } from '@angular/core';
import { GameService } from '../../game.service';
import { Observable } from 'rxjs/Observable';
// ===== models
import { iSocketData } from '../../models/iSocketData.model';
import { GAME_SOCKET_EVENTS } from '../../models/GAME_SOCKET_EVENTS';

import { CHOOSE_QUESTIONS_PLAY_ACTIONS } from '../../../../../../contract/miniGames/choose_partner_question/PLAY_ACTIONS_ENUM';

import { iQuestion } from './questions.model';
import { game$Event } from '../../models/game$Event.model';
import { iPlayAction } from '../../models/iPlayData';
// ===== utils
const TAG: string = 'ChoosePartnerQuestionComponent |';

@Component({
  selector: 'app-choose-partner-question',
  templateUrl: './choose-partner-question.component.html',
  styleUrls: ['./choose-partner-question.component.scss']
})
export class ChoosePartnerQuestionComponent implements OnInit {
  private game$: Observable<game$Event>;
  questions: iQuestion[]
  playerTurn: boolean = false;
  constructor(private GameService: GameService) {
  }

  ngOnInit() {
    this.game$ = this.GameService.game$;
    let subscription = this.game$.subscribe((gameEvent: game$Event) => {
      let gameEventName: GAME_SOCKET_EVENTS = gameEvent.eventName;
      if (gameEventName === GAME_SOCKET_EVENTS.init_mini_game) { //if the socket get an 'init)mini_game event'

        this.questions = gameEvent.eventData.initData;
        this.GameService.emitGameEvent(GAME_SOCKET_EVENTS.ready_for_mini_game);

      }

      if (gameEventName === GAME_SOCKET_EVENTS.your_turn) {
        this.playerTurn = true;
      }
    })
  }
  onQuestionSelected(questionIndex: number) {
    console.log('question has been selected :' + questionIndex)
    if (this.playerTurn) {
      let data: iPlayAction<CHOOSE_QUESTIONS_PLAY_ACTIONS> = { type: CHOOSE_QUESTIONS_PLAY_ACTIONS.ask_question, payload: questionIndex };
      this.GameService.emitGameEvent(GAME_SOCKET_EVENTS.play, data);
    } else {
      console.log(TAG, 'its not your turn');
    }
  }

}


