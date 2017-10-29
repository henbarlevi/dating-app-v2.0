import { Component, OnInit } from '@angular/core';
import { GameService } from './game.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  constructor(private GameService : GameService) { }

  ngOnInit() {
    console.log('game component ngOninit');
    let game$ :Observable<any>=this.GameService.startGame();
    game$.subscribe(data=>{
      console.log(data);
    })
  }

}
