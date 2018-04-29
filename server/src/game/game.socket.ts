//======imports
import * as express from 'express';
import * as fs from 'fs';
import * as Rx from 'rxjs';
import * as request from 'request';
import * as jwt from 'jsonwebtoken'; //jwt authentication

import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/timer';

//======db
import { UserRepository } from '../db/repository/user-rep';

//====== services

import { GameScoketsManager } from './gameScoketsManager';
import { verifyToken } from '../helpers/middlewares';
//====== models
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
                    Logger.d(TAG, `Already Connected Users _id = ${Object.keys(alreadyConnectedUsers).join()}`)
                    const userId: string = user._id.toString();
                    Logger.d(TAG, `This User _id =  ${userId}`)
                    Logger.d(TAG, `${alreadyConnectedUsers[userId]}`)

                    //if the user alredy connected - prevent duplication (disconnect the first tab)
                    if (alreadyConnectedUsers[userId]) {
                        Logger.d(TAG, 'user already connected from another tab/device, **disconnect previous connection and saving the new socket into [alreadyConnectedUsers] **', 'yellow');
                        //alreadyConnectedUsers[user._id].emit(GAME_SOCKET_EVENTS.already_connected);

                        alreadyConnectedUsers[userId].disconnect();
                        //set user into socket socket.user
                        socket.user = user;
                        //saving into alreadyConnectedUsers
                        alreadyConnectedUsers[userId] = socket;
                        next();


                    } else {

                        Logger.d(TAG, 'user socket authenticated', 'green');
                        Logger.d(TAG, 'saving ' + user._id + ' into alradyConnectedUsers');
                        //set user into socket socket.user
                        socket.user = user;
                        //saving into alreadyConnectedUsers
                        alreadyConnectedUsers[userId] = socket;
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
        let connectionQueryParams = socket.handshake.query;

        socket.on('disconnect', () => {
            //remove player from alreadyConnectedUsers

            const userId: string = (socket as iGameSocket).user._id.toString()
            if (alreadyConnectedUsers[userId]) {
                Logger.d(TAG, `** removing ${userId} from [alreadyConnectedUsers] **`, 'gray')
                delete alreadyConnectedUsers[userId];
            } else { Logger.d(TAG, `Warning! -Diconnected User ${userId} not exist in the [alreadyConnectedUsers]`, 'red') };
        });
        //handle reconnection - [Deprecated] - reconnection suppose to be handled by the relevant gameroom
        if (socket.handshake.query.roomId) {
            socket.gameRoomId = socket.handshake.query.roomId;
            Logger.d(TAG, `user is trying to reconnect to room ${socket.handshake.query.roomId}..`, 'gray')
            //TODO
            // let userId = (socket as iGameSocket).user._id
            // alreadyConnectedUsers[userId] ? alreadyConnectedUsers[userId] = null : ''
            // //socket.disconnect();

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
