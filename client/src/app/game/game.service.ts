import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import * as io from 'socket.io-client';
@Injectable()
export class GameService {
  baseUrl = 'http://localhost:3000';
  private gameSocket: SocketIOClient.Socket;
  private game$
  //private game$ :Observable<any>
  /*
  Raise events with services (BehaviourSubject,ReplaySubject) :
  https://stackoverflow.com/questions/34376854/delegation-eventemitter-or-observable-in-angular2/35568924#35568924*/
  private _gameStatusChanged = new BehaviorSubject<GAME_STATUS>(GAME_STATUS.not_playing);
  public gameStatusChanged$ = this._gameStatusChanged.asObservable();
  raiseGameStatusChange(gameStatus: GAME_STATUS) {
    this._gameStatusChanged.next(gameStatus);
  }


  constructor() {

  }

  startGame() {
    this.game$ = new Observable(observer => {
      console.log('creating game socket');
      this.gameSocket = io(this.baseUrl);//connecting
      this.gameSocket.on('message', (data) => {
        observer.next(data);
      });
      //return value = function that happen when the this Observable subscription invoke .unsubscribe()
      return () => {
        this.gameSocket.disconnect();
      };
    })
    return this.game$;
  }
}

export enum GAME_STATUS {
  not_playing,
  searching_player,
  playing,
  game_ended
}

export enum GAME_TYPE {
  choose_partner_question /**a game where the partner decide what question the other player will answer */
}

export interface iGameSocketData{
  
}