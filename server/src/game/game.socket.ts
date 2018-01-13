//======imports
import * as express from 'express';
import * as fs from 'fs';
import * as Rx from 'rxjs';
import * as request from 'request';
import * as jwt from 'jsonwebtoken'; //jwt authentication

//======db
import { UserRepository } from '../db/repository/user-rep';

//====== services

import { GameScoketsManager } from './gameScoketsManager';
import { verifyToken } from '../helpers/middlewares';
//====== models
import { GAME_STATUS } from './GAME_STATUS_ENUM';
import { iUser } from '../models';
import { iFacebookCredentials } from '../facebook/models/iFacebookCredentials.model'
import { iFacebookUserInfo } from '../facebook/models/index';
//====== config
import * as config from 'config';
const ENV: string = process.env.ENV || 'local';
const envConfig: any = config.get(ENV);
//=======utils
import { Logger } from '../utils/Logger';
import { iGameSocket } from './models/iGameSocket';
import { GAME_SOCKET_EVENTS } from './models/GAME_SOCKET_EVENTS';
import { Game$ } from './game$.service';
const TAG: string = 'GameSockets |';

let alreadyConnectedUsers: { [user_id: string]: iGameSocket } = {};
// SOCKET.IO with TOKEN BASED : https://auth0.com/blog/auth-with-socket-io/
module.exports = function (io) {
    Logger.d(TAG, 'establishing sockets.io for games..');
    let gameSocketsManager: GameScoketsManager = new GameScoketsManager(io);
    gameSocketsManager.run();
    /*authenction + authorization for socket.io : https://facundoolano.wordpress.com/2014/10/11/better-authentication-for-socket-io-no-query-strings/ */
    io.use((socket: iGameSocket, next) => {
        console.log(socket.handshake.query);
        var token = socket.handshake.query ? socket.handshake.query.token : null;
        if (token) {
            verifyToken(token)
                .then((user: iUser) => {
                    Logger.d(TAG, `Already Connected Users : ${Object.keys(alreadyConnectedUsers).join()}`)

                    //if the user alredy connected - prevent duplication (disconnect the first tab)
                    if (alreadyConnectedUsers[user._id]) {
                        Logger.d(TAG, 'user already connected from another tab/device', 'yellow');
                        //alreadyConnectedUsers[user._id].emit(GAME_SOCKET_EVENTS.already_connected);

                        alreadyConnectedUsers[user._id].disconnect();
                        //set user into socket socket.user
                        socket.user = user;
                        //saving into alreadyConnectedUsers
                        alreadyConnectedUsers[user._id] = socket;
                        next();


                    } else {

                        Logger.d(TAG, 'user socket authenticated', 'green');
                        Logger.d(TAG, 'saving ' + user._id + ' into alradyConnectedUsers');
                        //set user into socket socket.user
                        socket.user = user;
                        //saving into alreadyConnectedUsers
                        alreadyConnectedUsers[user._id] = socket;
                        next();
                    }


                })
                .catch(e => {
                    next(new Error("not authenticated"));
                    Logger.d(TAG, `user socket not authenticated ${e}`, 'red');

                })
        } else {
            next(new Error("not authenticated"));
            Logger.d(TAG, 'user socket not authenticated - client didnt sent token', 'red');
        }
    });

    //service that export Observable that raise event every time client send emit evetm through socket.io
    Game$.init(io);
    /*handle connection*/
    io.sockets.on('connection', (socket: iGameSocket) => {
        let connectionQueryParams =socket.handshake.query;
        
        socket.on('disconnect', () => {
            //remove player from alreadyConnectedUsers
            let userId = (socket as iGameSocket).user._id
            alreadyConnectedUsers[userId] ? alreadyConnectedUsers[userId] = null : '';
        });
        //handle reconnection - TODO
        if (socket.handshake.query.roomId) {
            socket.gameRoomId = socket.handshake.query.roomId;
            Logger.d(TAG, `user is trying to reconnect to room ${socket.handshake.query.roomId}..`, 'gray')
            //TODO
            let userId = (socket as iGameSocket).user._id
            alreadyConnectedUsers[userId] ? alreadyConnectedUsers[userId] = null : ''
            //socket.disconnect();

        }
//

        // socket.on('add-message', (message) => {
        //     io.emit('message', { type: 'new-message', text: message });
        // });
    });




}



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
