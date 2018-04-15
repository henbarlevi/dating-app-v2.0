import { Logger } from "../utils/Logger";
import { iGameSocket } from "./models/iGameSocket";
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import { iSocketData } from "./models/iSocketData.model";
import { GAME_SOCKET_EVENTS } from "./models/GAME_SOCKET_EVENTS";
import { GAMEROOM_EVENT } from "./models/GAMEROOM_EVENTS";

const TAG: string = 'Game$ |';
/**This Service purpose is to export Observable that raise event every time client send emit event through socket.io */


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
    static emit(gameEvent: game$Event) {
        _game$.next(gameEvent);
    }
    private static printAllEvents() {
        this.printAllGameSocketEvents();
        this.printAllGameroomEvents();
    }
    private static printAllGameSocketEvents(){
        game$.subscribe(async (gameEvent: game$Event) => {
            try {
                const eventName: GAME_SOCKET_EVENTS | GAMEROOM_EVENT = gameEvent.eventName
                if (isGAME_SOCKET_EVENT(eventName))
                    Logger.d(TAG, `Client User [${gameEvent.socket.user.facebook ? gameEvent.socket.user.facebook.name : gameEvent.socket.user._id}] - Emited Event: [${eventName ? eventName : 'Unknwon'}] With the Data [${gameEvent.eventData ? JSON.stringify(gameEvent.eventData) : 'None'}]`, 'cyan');
            }
            catch (e) {
                Logger.d(TAG, `Err =====> while printing event ` + e, 'red');
            }

        })
    }
    private static printAllGameroomEvents(): any {
        game$.subscribe(async (gameEvent: game$Event) => {
            try {
                const eventName: GAME_SOCKET_EVENTS | GAMEROOM_EVENT = gameEvent.eventName
                if (isGAMEROOM_EVENT(eventName))
                    Logger.d(TAG, `GAMEROOM [] - Emited Event: [${eventName ? eventName : 'Unknwon'}] With the Data [${gameEvent.eventData ? JSON.stringify(gameEvent.eventData) : 'None'}]`, 'cyan');
            }
            catch (e) {
                Logger.d(TAG, `Err =====> while printing event ` + e, 'red');
            }

        })
    }
}

export interface game$Event {
    socket: iGameSocket,//socket that emitted the event
    eventName: GAME_SOCKET_EVENTS |GAMEROOM_EVENT, // ready_for_minigame etc...
    eventData?: any //data that emitted along with the event (if exist)
}
export { game$ }

const gameSocketEventsNames: string[] = Object.keys(GAME_SOCKET_EVENTS).map(e => GAME_SOCKET_EVENTS[e]);
function isGAME_SOCKET_EVENT(event_name: String) :boolean {
    return gameSocketEventsNames.some(evName => evName === event_name);
}
const gameRoomEvents: string[] = Object.keys(GAMEROOM_EVENT).map(e => GAMEROOM_EVENT[e]);
function isGAMEROOM_EVENT(event_name: String) :boolean{
    return gameRoomEvents.some(evName => evName === event_name);

}