import { Component, OnInit } from '@angular/core';
import { GameService } from '../../game.service';
import { Observable } from 'rxjs/Observable';
import { iSocketData } from '../../models/iSocketData.model';
import { GAME_SOCKET_EVENTS } from '../../models/GAME_SOCKET_EVENTS';
import { iQuestion } from './questions.model';
const TAG: string = 'ChoosePartnerQuestionComponent |'
@Component({
  selector: 'app-choose-partner-question',
  templateUrl: './choose-partner-question.component.html',
  styleUrls: ['./choose-partner-question.component.scss']
})
export class ChoosePartnerQuestionComponent implements OnInit {
  private game$: Observable<iSocketData>;
  questions: iQuestion[]
  playerTurn: boolean = false;
  constructor(private GameService: GameService) {
  }
 
  ngOnInit() {
    this.game$ = this.GameService.game$;
    let subscription = this.game$.subscribe((data: iSocketData) => {
      let gameEventName: GAME_SOCKET_EVENTS = data.data[0];
      if (gameEventName === GAME_SOCKET_EVENTS.init_mini_game) { //if the socket get an 'init)mini_game event'
        console.log(TAG, 'got init_game event');
        console.log(TAG, data);

        this.questions = data.data[1].initData;
        this.GameService.emitGameEvent(GAME_SOCKET_EVENTS.ready_for_mini_game);

      }

      if (gameEventName === GAME_SOCKET_EVENTS.your_turn) {
        this.playerTurn = true;
      }
    })
  }
  onQuestionSelected(question:iQuestion){
    console.log('question has been selected :'+question.q)
    if(this.playerTurn){
      
    }
  }

}


