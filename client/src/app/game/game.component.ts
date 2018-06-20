import { Component, OnInit } from '@angular/core';
import { GameService } from './game.service';
import { Observable } from 'rxjs/Observable';
import { game$Event } from './models/game$Event.model';
import { GAME_SOCKET_EVENTS } from './models/GAME_SOCKET_EVENTS.enum';
import { Router } from '@angular/router';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { Subscription } from 'rxjs/Subscription';
//ngrx (redux)
import { iGameState, getMiniGameState, getGameState, iState } from './_ngrx/game.reducers';
import { Store } from '@ngrx/store';
import * as GameActions from './_ngrx/game.actions';
import { GAME_STATUS } from './models/GAME_STATUS.enum';
import { iPartner } from './models/iPartner.model';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {
  private disconnection$Subscription: Subscription
   gameState: iGameState;
   gameState$Sub :Subscription
  constructor(private store: Store<iState>,
    private GameService: GameService, private router: Router) { }

  ngOnInit() {
    //debug
    // console.log('will refresh in 20 sec');
    // setTimeout(function() {
    //   location.reload();
    // }, 1000*20);


    //
    this.gameState$Sub =this.store.select( getGameState).subscribe(gameState=>this.gameState=gameState);//TODO work on display exposed partners info
    
    console.log('game component ngOninit');
    const game$: Observable<game$Event> = this.GameService.startGame();
    // const startGame$: Observable<iGameState> = this.gameState.filter((gameState: iGameState) => gameState.GAME_STATUS === GAME_STATUS.start_new_game)
    // startGame$.subscribe((gameState: iGameState) => {

    // })
    //listen to disconneciton event - if disconnected - navigate back to dashboard:
    const gamesocketDisconnection$ =this.GameService.getGameEventsByName( GAME_SOCKET_EVENTS.disconnect);
    this.disconnection$Subscription = gamesocketDisconnection$.subscribe(async event => {
      if (event.eventName === GAME_SOCKET_EVENTS.disconnect) {
        console.log(`%c ** Emiting Socket Event : ${event.eventName}**`, 'color: red');

      }
    })

  }
  ngOnDestroy() {
    this.disconnection$Subscription ? this.disconnection$Subscription.unsubscribe() : ''
  }

  objectKeys(obj) {
    return Object.keys(obj);
  }

  /**get player exposed data and filter the unrelevant ones (id for now) */
  filterPlayerUnExposableProps(player:iPartner):string[]{
    const exposeDataProps:string[] =Object.keys(player);
    return exposeDataProps.filter(prop => prop!='id' && prop!='profile_link');
  }


  /**
   * TO BE DELETED - currently there is only 1 parnter in the game (=2 players)
   *so it @returns the partner exposed info
   */
  get partner(){
    const partnerId = Object.keys(this.gameState.partners)[0];
    return this.gameState.partners[partnerId];
  }

}
