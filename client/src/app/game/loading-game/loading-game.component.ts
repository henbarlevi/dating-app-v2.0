/**component that display each time there is loading of the game/ or mini game inside the game */
import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';
import { Observable } from 'rxjs/Observable';
import { iSocketData } from '../models/iSocketData.model';

@Component({
  selector: 'app-loading-game',
  templateUrl: './loading-game.component.html',
  styleUrls: ['./loading-game.component.scss']
})
export class LoadingGameComponent implements OnInit {
  private game$: Observable<any>;
   loadingMessage: string = 'loading...';
  constructor(private GameService: GameService) { }

  ngOnInit() {
    this.game$ = this.GameService.game$;

    this.game$.subscribe((data:iSocketData) =>{
      this.loadingMessage = data.data[0] as string;
    })
  }

}
