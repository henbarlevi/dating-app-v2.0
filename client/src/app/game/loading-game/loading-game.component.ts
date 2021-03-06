/**component that display each time there is loading of the game/ or mini game inside the game */
import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';
import { Observable } from 'rxjs/Observable';
import { iSocketData } from '../models/iSocketData.model';
import { GAME_SOCKET_EVENTS } from '../models/GAME_SOCKET_EVENTS.enum';
import { Router, ActivatedRoute } from '@angular/router';
import { game$Event } from '../models/game$Event.model';
import { Subscription } from 'rxjs/Subscription';
//ngrx (redux)
import { iGameState, getGameState } from '../_ngrx/game.reducers';
import { Store } from '@ngrx/store';
import * as GameActions from '../_ngrx/game.actions'
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { MINIGAME_TYPE } from '../games/logic/MINIGAME_TYPE_ENUM';
import { GAME_STATUS } from '../models/GAME_STATUS_ENUM';
//utils
const TAG: string = 'LoadingGame |';
@Component({
  selector: 'app-loading-game',
  templateUrl: './loading-game.component.html',
  styleUrls: ['./loading-game.component.scss']
})
export class LoadingGameComponent implements OnInit, OnDestroy {
  private game$: Observable<game$Event>;
  private game$Sub: Subscription;
  private gameState$Sub: Subscription;
  loadingMessage: string = 'loading...';
  constructor(
    private Router: Router,
    private route: ActivatedRoute,
    private GameService: GameService,
    private store: Store<iGameState>) { }

  async ngOnInit() {
 
    this.game$ = this.GameService.game$;

    this.game$Sub = this.game$.subscribe((event: game$Event) => {
      switch (event.eventName as GAME_SOCKET_EVENTS) {
        case GAME_SOCKET_EVENTS.searchForPartner:
          return this.loadingMessage = 'searching for partner';
        case GAME_SOCKET_EVENTS.found_partner:
          //change state:
          this.store.dispatch(new GameActions.updateNewGameroomData(event.eventData))
          return this.loadingMessage = 'Found Partner';
        case GAME_SOCKET_EVENTS.init_mini_game:
          this.loadingMessage = 'Initializing game';
          //navigating to game
          const initGameData: any = event.eventData;
          const gameName: string = MINIGAME_TYPE[initGameData.miniGameType];
          console.log(TAG, `initing the game :` + gameName);
          return this.Router.navigate(['../' + gameName], { relativeTo: this.route });     
        default:
          break;
      }
    })
  }

  ngOnDestroy() {
    this.game$Sub ? this.game$Sub.unsubscribe() : '';
  }

}
