//======imports
import * as express from 'express';
import * as fs from 'fs';
import * as Rx from 'rxjs';
import * as request from 'request';
import * as jwt from 'jsonwebtoken'; //jwt authentication
//======db
import { UserRepository } from '../db/repository/user-rep';

//====== services
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
const TAG: string = 'GameSockets |';



module.exports = function(io) {
    Logger.d(TAG,'establishing sockets.io for games..');
    io.sockets.on('connection', (socket) => {
        console.log('user connected');
        console.log(socket);
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
