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
  private questions: iQuestion[]
  constructor(private GameService: GameService) {
  }

  ngOnInit() {
    this.game$ = this.GameService.game$;
    this.game$.subscribe((data: iSocketData) => {
      console.log(TAG, 'got info from socket');
      console.log(TAG, data);
      let gameEventName: GAME_SOCKET_EVENTS = data.data[0];
      if (GAME_SOCKET_EVENTS.init_mini_game) {
        this.questions = data.data[1];
      }

    })
  }

}
