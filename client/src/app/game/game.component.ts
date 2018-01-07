import { Component, OnInit } from '@angular/core';
import { GameService } from './game.service';
import { Observable } from 'rxjs/Observable';
import { game$Event } from './models/game$Event.model';
import { GAME_SOCKET_EVENTS } from './models/GAME_SOCKET_EVENTS';
import { Router } from '@angular/router';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit,OnDestroy {
  private game$subscription:Subscription
  constructor(private GameService: GameService, private router:Router) { }

  ngOnInit() {
    //debug
    // console.log('will refresh in 20 sec');
    // setTimeout(function() {
    //   location.reload();
    // }, 1000*20);

    console.log('game component ngOninit');
    let game$: Observable<game$Event> = this.GameService.startGame();
     this.game$subscription = game$.subscribe(event => {
      if(event.eventName === GAME_SOCKET_EVENTS.disconnect){
        console.log(`%c ** Emiting Socket Event : ${event.eventName}**`, 'color: red');
        //this.GameService.gameroomId =null;
        this.router.navigate(['/dashboard']);

      }
    })

  }
  ngOnDestroy(){
    console.log('ending sub');
    this.game$subscription ? this.game$subscription.unsubscribe() :''
  }

}
