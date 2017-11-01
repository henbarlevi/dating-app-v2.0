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
const TAG = 'GameSockets |';
// SOCKET.IO with TOKEN BASED : https://auth0.com/blog/auth-with-socket-io/
module.exports = function (io) {
    Logger_1.Logger.d(TAG, 'establishing sockets.io for games..');
    let gameSockectManager = new gameScoketsManager_1.GameScoketsManager();
    /*authenction + authorization for socket.io : https://facundoolano.wordpress.com/2014/10/11/better-authentication-for-socket-io-no-query-strings/ */
    io.use((socket, next) => {
        console.log(socket.handshake.query);
        var token = socket.handshake.query ? socket.handshake.query.token : null;
        if (token) {
            middlewares_1.verifyToken(token)
                .then(() => next())
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
    io.sockets.on('connection', (socket) => {
        console.log('user connected');
        socket.on('disconnect', function () {
            console.log('user disconnected');
        });
        socket.on('add-message', (message) => {
            io.emit('message', { type: 'new-message', text: message });
        });
    });
};
//-------------------------------------SNIPPETS-------------------------
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
