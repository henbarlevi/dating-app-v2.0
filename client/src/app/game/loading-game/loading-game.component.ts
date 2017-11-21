/**component that display each time there is loading of the game/ or mini game inside the game */
import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';
import { Observable } from 'rxjs/Observable';
import { iSocketData } from '../models/iSocketData.model';
import { GAME_SOCKET_EVENTS } from '../models/GAME_SOCKET_EVENTS';
import { Router, ActivatedRoute } from '@angular/router';
import { GAME_TYPE } from '../models/GAME_TYPE_ENUM';
const TAG: string = 'LoadingGame |';
@Component({
  selector: 'app-loading-game',
  templateUrl: './loading-game.component.html',
  styleUrls: ['./loading-game.component.scss']
})
export class LoadingGameComponent implements OnInit {
  private game$: Observable<any>;
  loadingMessage: string = 'loading...';
  constructor(private Router: Router,
    private route: ActivatedRoute,
    private GameService: GameService) { }

  ngOnInit() {
    this.game$ = this.GameService.game$;

    let subscription = this.game$.subscribe((event: iSocketData) => {
      switch (event.data[0] as GAME_SOCKET_EVENTS) {
        case GAME_SOCKET_EVENTS.searchForPartner:
          return this.loadingMessage = 'searching for partner';
        case GAME_SOCKET_EVENTS.found_partner:
          return this.loadingMessage = 'Found Partner';
        case GAME_SOCKET_EVENTS.init_mini_game:
          this.loadingMessage = 'Initializing game';
          //navigating to game
          let initGameData: any = event.data[1];
          let gameName: string = GAME_TYPE[initGameData.gameType];
          console.log(TAG, `initing the game :` + gameName);
          return this.Router.navigate(['../' + gameName], { relativeTo: this.route });
        default:
          break;
      }
    })
  }

}
