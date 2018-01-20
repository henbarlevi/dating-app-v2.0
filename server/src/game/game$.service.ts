import { Logger } from "../utils/Logger";
import { iGameSocket } from "./models/iGameSocket";
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import { iSocketData } from "./models/iSocketData.model";
import { GAME_SOCKET_EVENTS } from "./models/GAME_SOCKET_EVENTS";

const TAG: string = 'Game$ |';
/**This Service purpose is to export Observable that raise event every time client send emit evetm through socket.io */


/*
  Raise events with services (BehaviourSubject,ReplaySubject) :
  https://stackoverflow.com/questions/34376854/delegation-eventemitter-or-observable-in-angular2/35568924#35568924*/
const _game$: ReplaySubject<game$Event> = new ReplaySubject<game$Event>(1);
const game$: Observable<game$Event> = _game$.asObservable();


export class Game$ {
    static init(io: SocketIO.Server) {
        const middleware = require('socketio-wildcard')();//add the * (any socket event) option
        io.use(middleware);
        io.sockets.on('connection', (socket: iGameSocket) => {
            //emit connection event to observable:
            _game$.next({
                socket: socket,
                eventName: GAME_SOCKET_EVENTS.connection
            });
            //catch all events on socket and emit them to the observable
            socket.on('*', (data: iSocketData) => {
                if (socket && data && data.data && data.data[0]) {
                    _game$.next({
                        socket: socket,
                        eventName: data.data[0],
                        eventData: data.data[1]
                    });
                }
            });
            //also catch disconnection and emit to observable
            //TODO - remove all listeners when diconnected
            socket.on('disconnect', () => {
               // Logger.d(TAG,'disconnect socket '+socket.id,'cyan');
                _game$.next({
                    socket: socket,
                    eventName: GAME_SOCKET_EVENTS.disconnect
                });
            })

        })
        this.printAllEvents(); //print to console all observable events
    }

    private static printAllEvents() {
        game$.subscribe(async(socketEvent: game$Event) => {
            try{
                
                Logger.d(TAG, `Client User [${socketEvent.socket.user.facebook ? socketEvent.socket.user.facebook.name : socketEvent.socket.user._id}] - Emited Event: [${socketEvent.eventName ?  socketEvent.eventName : 'Unknwon'}] With the Data [${socketEvent.eventData ? JSON.stringify(socketEvent.eventData) : 'None'}]`, 'cyan');
            }
            catch(e){
                Logger.d(TAG,`Err =====> while printing event `+e,'red');
            }

        })
    }
}

export interface game$Event {
    socket: iGameSocket,//socket that emitted the event
    eventName: GAME_SOCKET_EVENTS, // ready_for_minigame etc...
    eventData?: any //data that emitted along with the event (if exist)
}
export { game$ }