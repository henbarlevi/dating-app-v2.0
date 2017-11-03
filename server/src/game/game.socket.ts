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
const TAG: string = 'GameSockets |';


// SOCKET.IO with TOKEN BASED : https://auth0.com/blog/auth-with-socket-io/
module.exports = function (io) {
    Logger.d(TAG, 'establishing sockets.io for games..');
    let gameSocketsManager: GameScoketsManager = new GameScoketsManager(io);

    /*authenction + authorization for socket.io : https://facundoolano.wordpress.com/2014/10/11/better-authentication-for-socket-io-no-query-strings/ */
    io.use((socket: iGameSocket, next) => {
        console.log(socket.handshake.query);
        var token = socket.handshake.query ? socket.handshake.query.token : null;
        if (token) {
            verifyToken(token)
                .then((user: iUser) => {
                    Logger.d(TAG, 'user socket authenticated', 'green');
                    //set user into socket socket.user
                    socket.user = user;
                    next()
                })
                .catch(e => {
                    next(new Error("not authenticated"));
                    Logger.d(TAG, 'user socket not authenticated', 'red');

                })
        } else {
            next(new Error("not authenticated"));
            Logger.d(TAG, 'user socket not authenticated', 'red');
        }
    });
    /*handle connection*/
    io.sockets.on('connection', (socket: SocketIO.Socket) => {
        console.log('user connected');
        gameSocketsManager.handle(socket);
        socket.on('disconnect', function () {
            console.log('user disconnected');
        });

        socket.on('add-message', (message) => {
            io.emit('message', { type: 'new-message', text: message });
        });
    });



}



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
