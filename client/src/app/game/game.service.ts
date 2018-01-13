import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import { Observable } from 'rxjs/Observable';

import * as io from 'socket.io-client';
import * as plugin from 'socketio-wildcard'
import { iSocketData } from './models/iSocketData.model';
import { GAME_SOCKET_EVENTS } from './models/GAME_SOCKET_EVENTS';
import { game$Event } from './models/game$Event.model';
const socketListenToAllEventsPlugin = plugin(io.Manager); //add the '*' option : https://stackoverflow.com/questions/31757188/socket-on-listen-for-any-event
//==== utils
const TAG: string = 'GameService |';
@Injectable()
export class GameService {
  baseUrl: string = 'http://localhost:3000';
  private gameSocket: SocketIOClient.Socket;
  private _game$: ReplaySubject<game$Event> = new ReplaySubject<game$Event>(1);
  public game$: Observable<game$Event> = this._game$.asObservable();
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
  /**estabslish web socket and return observable that emits the websocket events coming from server */
  startGame() {
    console.log('creating game socket..');
    let token: String = localStorage.getItem('token');
    let query: any = { token: token } //conncetion query params
    if (this.gameroomId) { query.roomId = this.gameroomId } //if user trying to recoonect
    //connecting :
    this.gameSocket = io.connect(this.baseUrl
      /*with token :authenction + authorization for socket.io : https://facundoolano.wordpress.com/2014/10/11/better-authentication-for-socket-io-no-query-strings/ */
      , {
        query: query
      });
    socketListenToAllEventsPlugin(this.gameSocket);// add the '*' option
    this.gameSocket.on('*', (data: iSocketData) => {
      console.log(TAG, `%c ** GameSocket Recieved [${data.data[0]}] event with the data [${data.data[1]}]**`, 'color: blue');


      this._game$.next({
        eventName: data.data[0],
        eventData: data.data[1]
      });
    });
    this.gameSocket.once('disconnect', () => {
      console.log(TAG, 'You have disconnected');
      //emit disconnection to game$
      this._game$.next({
        eventName: GAME_SOCKET_EVENTS.disconnect,
      });
      //delete roomId
      this.gameroomId = null;
      //clean listener and observable emits
      this.gameSocket.removeAllListeners();
      this._game$ = new ReplaySubject<game$Event>(1);
      this.game$ = this._game$.asObservable();
    })
    return this.game$;
  }
  /*send to server game event*/
  emitGameEvent(eventName: GAME_SOCKET_EVENTS, data?: any) {
    console.log(`%c ** GameSocket Emiting [${eventName}] event**`, 'color: blue');
    let roomId = this.gameroomId;
    if (roomId) {
      data ? data.roomId = roomId : data = { roomId: roomId };
    }
    this.gameSocket.emit(eventName, data);
  }

  /**get gameroomId from local storage */
  get gameroomId(): string {
    return localStorage.getItem('roomId');
  }
  set gameroomId(roomId: string) {
    if (roomId === null) { localStorage.removeItem('roomId') }
    else {

      localStorage.setItem('roomId', roomId);
    }
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



// ======= SNIPPETS

//   startGame() {
//     let token: String = localStorage.getItem('token');

//     this.game$ = new Observable(observer => {
//       console.log('creating game socket');
//       //connecting :
//       this.gameSocket = io.connect(this.baseUrl
//         /*with token :authenction + authorization for socket.io : https://facundoolano.wordpress.com/2014/10/11/better-authentication-for-socket-io-no-query-strings/ */
//         , {
//           query: {
//             token: token
//           }
//         });
//       socketListenToAllEventsPlugin(this.gameSocket);// add the '*' option
//       this.gameSocket.on('*', (data) => {
//         observer.next(data);
//       });
//       //return value = function that happen when the this Observable subscription invoke .unsubscribe()
//       return () => {
//         this.gameSocket.disconnect();
//       };
//     })
//     return this.game$;
//   }
// 