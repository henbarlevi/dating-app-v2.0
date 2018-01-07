"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = require("../utils/Logger");
const ReplaySubject_1 = require("rxjs/ReplaySubject");
const GAME_SOCKET_EVENTS_1 = require("./models/GAME_SOCKET_EVENTS");
const TAG = 'Game$ |';
/**This Service purpose is to export Observable that raise event every time client send emit evetm through socket.io */
/*
  Raise events with services (BehaviourSubject,ReplaySubject) :
  https://stackoverflow.com/questions/34376854/delegation-eventemitter-or-observable-in-angular2/35568924#35568924*/
const _game$ = new ReplaySubject_1.ReplaySubject(1);
const game$ = _game$.asObservable();
exports.game$ = game$;
class Game$ {
    static init(io) {
        const middleware = require('socketio-wildcard')(); //add the * (any socket event) option
        io.use(middleware);
        io.sockets.on('connection', (socket) => {
            //emit connection event to observable:
            _game$.next({
                socket: socket,
                eventName: GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.connection
            });
            //catch all events on socket and emit them to the observable
            socket.on('*', (data) => {
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
                Logger_1.Logger.d(TAG, 'disconnect socket ' + socket.id, 'cyan');
                _game$.next({
                    socket: socket,
                    eventName: GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.disconnect
                });
            });
        });
        this.printAllEvents(); //print to console all observable events
    }
    static printAllEvents() {
        game$.subscribe((socketEvent) => __awaiter(this, void 0, void 0, function* () {
            try {
                Logger_1.Logger.d(TAG, `Client User [${socketEvent.socket.user.facebook ? socketEvent.socket.user.facebook.name : socketEvent.socket.user._id}] - Emited Event: [${socketEvent.eventName ? socketEvent.eventName : 'Unknwon'}] With the Data [${socketEvent.eventData ? JSON.stringify(socketEvent.eventData) : 'None'}]`, 'cyan');
            }
            catch (e) {
                Logger_1.Logger.d(TAG, `Err =====> while printing event ` + e, 'red');
            }
        }));
    }
}
exports.Game$ = Game$;
