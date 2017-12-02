"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//====== services
const gameScoketsManager_1 = require("./gameScoketsManager");
const middlewares_1 = require("../helpers/middlewares");
//====== config
const config = require("config");
const ENV = process.env.ENV || 'local';
const envConfig = config.get(ENV);
//=======utils
const Logger_1 = require("../utils/Logger");
const GAME_SOCKET_EVENTS_1 = require("./models/GAME_SOCKET_EVENTS");
const TAG = 'GameSockets |';
let alreadyConnectedUsers = {};
// SOCKET.IO with TOKEN BASED : https://auth0.com/blog/auth-with-socket-io/
module.exports = function (io) {
    Logger_1.Logger.d(TAG, 'establishing sockets.io for games..');
    let gameSocketsManager = new gameScoketsManager_1.GameScoketsManager(io);
    /*authenction + authorization for socket.io : https://facundoolano.wordpress.com/2014/10/11/better-authentication-for-socket-io-no-query-strings/ */
    io.use((socket, next) => {
        console.log(socket.handshake.query);
        var token = socket.handshake.query ? socket.handshake.query.token : null;
        if (token) {
            middlewares_1.verifyToken(token)
                .then((user) => {
                Logger_1.Logger.d(TAG, 'user socket authenticated', 'green');
                Logger_1.Logger.d(TAG, JSON.stringify(alreadyConnectedUsers));
                //if the user alredy connected - prevent duplication (user start multi game at once)
                if (alreadyConnectedUsers[user._id]) {
                    socket.emit(GAME_SOCKET_EVENTS_1.GAME_SOCKET_EVENTS.already_connected);
                    next(new Error("Already Connected"));
                    Logger_1.Logger.d(TAG, 'user already connected from another tab/device', 'red');
                }
                else {
                    Logger_1.Logger.d(TAG, 'saving ' + user._id + ' into alradyConnectedUsers');
                    alreadyConnectedUsers[user._id] = true;
                    //set user into socket socket.user
                    socket.user = user;
                    next();
                }
            })
                .catch(e => {
                next(new Error("not authenticated"));
                Logger_1.Logger.d(TAG, 'user socket not authenticated', 'red');
            });
        }
        else {
            next(new Error("not authenticated"));
            Logger_1.Logger.d(TAG, 'user socket not authenticated', 'red');
        }
    });
    const middleware = require('socketio-wildcard')(); //add the * (any socket event) option
    io.use(middleware);
    /*handle connection*/
    io.sockets.on('connection', (socket) => {
        console.log('user connected');
        gameSocketsManager.handle(socket);
        socket.on('disconnect', () => {
            //remove player from alreadyConnectedUsers
            let userId = socket.user._id;
            alreadyConnectedUsers[userId] ? alreadyConnectedUsers[userId] = false : '';
            console.log('user disconnected');
        });
        socket.on('*', (packet) => {
            Logger_1.Logger.d(TAG, `Event From Client : ${JSON.stringify(packet)}`, 'cyan');
        });
        socket.on('ready_for_mini_game', (socket) => {
            Logger_1.Logger.d(TAG, `Got Ready for miniGame`, 'cyan');
        }); //
        // socket.on('add-message', (message) => {
        //     io.emit('message', { type: 'new-message', text: message });
        // });
    });
    io.sockets.on('ready_for_mini_game', (socket) => {
        Logger_1.Logger.d(TAG, `Godddddt Ready for miniGame`, 'cyan');
    });
};
//-------------------------------------SNIPPETS-------------------------
/*removing listeners:
- https://stackoverflow.com/questions/23092624/socket-io-removing-specific-listener
 -https://stackoverflow.com/questions/9418697/how-to-unsubscribe-from-a-socket-io-subscription
To unsubscribe all listeners of an event
socket.off('event-name');
to unsubscribe a certain listener
socket.off('event-name', listener);
If you want to create listeners that "listens" only once use socket.once('news',func). Socket.io automatically will distroy the listener after the event happened - it's called "volatile listener"

*/
//CONVERTING NODE FS callback to REACTIVE
// fs.readdir('./dist/routes',(err,items)=>{
//     if(err){
//         console.log(err);
//     }
//     else{
//         console.log(items);
//     }
// })
// //converting node callback function to reactive version:
// const readdir$ = Rx.Observable.bindNodeCallback(fs.readdir); //save it as a function
// readdir$('./dist/routes').subscribe(items=>{console.log(items)}); 
