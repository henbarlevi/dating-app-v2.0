"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("rxjs/add/observable/merge");
require("rxjs/add/observable/timer");
//====== services
const gameScoketsManager_1 = require("./gameScoketsManager");
const middlewares_1 = require("../helpers/middlewares");
//====== config
const config = require("config");
const ENV = process.env.ENV || 'local';
const envConfig = config.get(ENV);
//=======utils
const Logger_1 = require("../utils/Logger");
const game__service_1 = require("./game$.service");
const TAG = 'GameSockets |';
let alreadyConnectedUsers = {};
// SOCKET.IO with TOKEN BASED : https://auth0.com/blog/auth-with-socket-io/
module.exports = function (io) {
    Logger_1.Logger.d(TAG, 'establishing sockets.io for games..');
    let gameSocketsManager = new gameScoketsManager_1.GameScoketsManager(io);
    gameSocketsManager.run();
    /*authenction + authorization for socket.io : https://facundoolano.wordpress.com/2014/10/11/better-authentication-for-socket-io-no-query-strings/ */
    io.use((socket, next) => {
        console.log(socket.handshake.query);
        var token = socket.handshake.query ? socket.handshake.query.token : null;
        if (token) {
            middlewares_1.verifyToken(token)
                .then((user) => {
                Logger_1.Logger.d(TAG, `Already Connected Users : ${Object.keys(alreadyConnectedUsers).join()}`);
                //if the user alredy connected - prevent duplication (disconnect the first tab)
                if (alreadyConnectedUsers[user._id]) {
                    Logger_1.Logger.d(TAG, 'user already connected from another tab/device', 'yellow');
                    //alreadyConnectedUsers[user._id].emit(GAME_SOCKET_EVENTS.already_connected);
                    alreadyConnectedUsers[user._id].disconnect();
                    //set user into socket socket.user
                    socket.user = user;
                    //saving into alreadyConnectedUsers
                    alreadyConnectedUsers[user._id] = socket;
                    next();
                }
                else {
                    Logger_1.Logger.d(TAG, 'user socket authenticated', 'green');
                    Logger_1.Logger.d(TAG, 'saving ' + user._id + ' into alradyConnectedUsers');
                    //set user into socket socket.user
                    socket.user = user;
                    //saving into alreadyConnectedUsers
                    alreadyConnectedUsers[user._id] = socket;
                    next();
                }
            })
                .catch(e => {
                next(new Error("not authenticated"));
                Logger_1.Logger.d(TAG, `user socket not authenticated ${e}`, 'red');
            });
        }
        else {
            next(new Error("not authenticated"));
            Logger_1.Logger.d(TAG, 'user socket not authenticated - client didnt sent token', 'red');
        }
    });
    //service that export Observable that raise event every time client send emit evetm through socket.io
    game__service_1.Game$.init(io);
    /*handle connection*/
    io.sockets.on('connection', (socket) => {
        let connectionQueryParams = socket.handshake.query;
        socket.on('disconnect', () => {
            //remove player from alreadyConnectedUsers
            let userId = socket.user._id;
            alreadyConnectedUsers[userId] ? alreadyConnectedUsers[userId] = null : Logger_1.Logger.d(TAG, `Warning! -Diconnected User ${userId} not exist in the alreadyConnectedUsers`, 'red');
        });
        //handle reconnection - TODO
        if (socket.handshake.query.roomId) {
            socket.gameRoomId = socket.handshake.query.roomId;
            Logger_1.Logger.d(TAG, `user is trying to reconnect to room ${socket.handshake.query.roomId}..`, 'gray');
            //TODO
            let userId = socket.user._id;
            alreadyConnectedUsers[userId] ? alreadyConnectedUsers[userId] = null : '';
            //socket.disconnect();
        }
        //
        // socket.on('add-message', (message) => {
        //     io.emit('message', { type: 'new-message', text: message });
        // });
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
