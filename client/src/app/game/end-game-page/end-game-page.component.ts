/**component that display each time there is loading of the game/ or mini game inside the game */
import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';
import { Observable } from 'rxjs/Observable';
import {filter, first} from 'rxjs/operators'
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
const TAG: string = 'EndGamePageComponent |';
@Component({
  selector: 'end-game-page',
  templateUrl: './end-game-page.component.html',
  styleUrls: ['./end-game-page.component.scss']
})
export class EndGamePageComponent implements OnInit, OnDestroy {
  private game$: Observable<game$Event>;
  private game$Sub: Subscription;
  loadingMessage: string = 'loading...';
  constructor(
    private Router: Router,
    private route: ActivatedRoute,
    private GameService: GameService,
    private store: Store<iGameState>) { }

  ngOnInit() {
    this.GameService.disconnect();
  }
  startNewGame() {
    this.GameService.startGame();
    const gameState$: Observable<iGameState> = this.store.select(getGameState);
    gameState$
      .pipe(filter((gameState: iGameState) => gameState.GAME_STATUS === GAME_STATUS.start_new_game)
      ,first())
      .subscribe(() => {
        this.Router.navigate(['/dashboard/game']);
      })
  }
  goHome() {
    this.Router.navigate(['/']);
  }

  ngOnDestroy() {
  }

}
