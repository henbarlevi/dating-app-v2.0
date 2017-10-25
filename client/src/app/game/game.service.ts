import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
@Injectable()
export class GameService {
  /*
  Raise events with services (BehaviourSubject,ReplaySubject)
  https://stackoverflow.com/questions/34376854/delegation-eventemitter-or-observable-in-angular2/35568924#35568924*/
  
  private _gameStatusChanged = new BehaviorSubject<GAME_STATUS>(GAME_STATUS.not_playing);
  public gameStatusChanged$ = this._gameStatusChanged.asObservable();
  raiseGameStatusChange(gameStatus:GAME_STATUS){
    this._gameStatusChanged.next(gameStatus);
   }

  constructor() {

   }
  


}

export enum GAME_STATUS{
  not_playing,
  playing,
  game_ended
}

export enum GAME_TYPE{
  choose_partner_question /**a game where the partner decide what question the other player will answer */
}