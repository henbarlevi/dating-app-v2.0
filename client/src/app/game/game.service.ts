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
//ngrx (redux)
import { iState } from './_ngrx/game.reducers';
import { Store } from '@ngrx/store';
import * as GameActions from './_ngrx/game.actions';
//==== utils
const TAG: string = 'GameService |';
@Injectable()
export class GameService {
  baseUrl: string = 'http://localhost:3000';
  private gameSocket: SocketIOClient.Socket;
  /*
  Raise events with services (BehaviourSubject,ReplaySubject) :
  https://stackoverflow.com/questions/34376854/delegation-eventemitter-or-observable-in-angular2/35568924#35568924*/
  private _game$: ReplaySubject<game$Event> = new ReplaySubject<game$Event>(1);
  public game$: Observable<game$Event> = this._game$.asObservable();

  constructor(private store: Store<iState>) {
    this.printAllEvents();//log $game events
  }

  private printAllEvents() {
    this.game$.subscribe(async (socketEvent: game$Event) => {
      try {

        console.log('%c' + `[RECEIVED] EVENT [${socketEvent.eventName}] - Occured with data:  With the Data [${socketEvent.eventData ? JSON.stringify(socketEvent.eventData) : 'None'}]`, 'color: blue');
      }
      catch (e) {
        console.log('%c' + `Err =====> while printing event ` + e, 'color: red');
      }

    })
  }
  /**estabslish web socket and return observable that emits the websocket events coming from server */
  startGame() {
    console.log('creating game socket..');
    const token: String = localStorage.getItem('token');
    //connecting :
    this.gameSocket = io.connect(this.baseUrl
      /*with token :authenction + authorization for socket.io : https://facundoolano.wordpress.com/2014/10/11/better-authentication-for-socket-io-no-query-strings/ */
      , {
        query:  { token: token } 
      });
    socketListenToAllEventsPlugin(this.gameSocket);// add the '*' option
    this.gameSocket.on('*', (data: iSocketData) => {
      this._game$.next({
        eventName: data.data[0],
        eventData: data.data[1]
      });
    });
    this.gameSocket.once('disconnect', () => {
      //emit disconnection to game$
      this._game$.next({
        eventName: GAME_SOCKET_EVENTS.disconnect,
      });
      //clean listener and observable emits
      this.gameSocket.removeAllListeners();
      this._game$ = new ReplaySubject<game$Event>(1);
      this.game$ = this._game$.asObservable();
      //change gamestate:
      this.store.dispatch(new GameActions.socketDisconnection())
    })
    //change gamestate:
    this.store.dispatch(new GameActions.StartNewGame());
    return this.game$;
  }
  /*send to server game event*/
  emitGameEvent(eventName: GAME_SOCKET_EVENTS, data?: any) {
    console.log(`%c ** [Emited] Event :[${eventName}] **`, 'color: blue');
    this.gameSocket.emit(eventName, data);
  }




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