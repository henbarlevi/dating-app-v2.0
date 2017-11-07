//======imports
import * as fs from 'fs';
import * as Rx from 'rxjs';
import * as request from 'request';
import * as jwt from 'jsonwebtoken'; //jwt authentication
import * as socketIo from 'socket.io';
import * as uuid from 'uuid/v1'; //generate guid
//======db
import { UserRepository } from '../db/repository/user-rep';

//====== services
//====== models
import { GAME_STATUS } from './GAME_STATUS_ENUM';
import { iUser } from '../models';
import { iFacebookCredentials } from '../facebook/models/iFacebookCredentials.model'
import { iFacebookUserInfo } from '../facebook/models/index';
import { iGameRoom } from './models/iGameRoom';
import { GAME_SOCKET_EVENTS } from './models/GAME_SOCKET_EVENTS';
import { iGameSocket } from './models/iGameSocket';
//====== config
import * as config from 'config';
const ENV: string = process.env.ENV || 'local';
const envConfig: any = config.get(ENV);
//=======utils
import { Logger } from '../utils/Logger';
const TAG: string = 'GameSocketsManager |';


/**handle game sockets
 * after user connected:
 * 1.emit for user 'searching For partner' - if not found push socket to waiting list
 * 2.after found partner - emit to 2 players 'found partner'
 * 3.join 2 socket to generated room
 * 4.send the gameRoom to gameRoom manager to handle the game
 */
export class GameScoketsManager {
    //sockets groups
    private waitingList: iGameSocket[] = []; //waiting for partner to play
    private gameRooms: { [roomId: string]: iGameRoom } = {};//gameRooms - Object {key:roomId,value:iGameRoom}
    /**
     *
     */
    constructor(private io: SocketIO.Namespace) {


    }
    /**handle new socket connected*/
    handle(socket: iGameSocket) {
        socket.on('disconnect', function () {
            console.log('user disconnected from game');
        });
        socket.emit(GAME_SOCKET_EVENTS.searchForPartner);
        let partner: iGameSocket = this.searchForPartner(socket);
        if (!partner) {
            Logger.d(TAG, `inserting ${socket.user.facebook ? socket.user.facebook.name : ''} to waiting list`, 'yellow');
            this.waitingList.push(socket);
        } else { //if there is partner available
            //generate game room
            let gameRoom: iGameRoom = this.generateGameRoom(socket, partner);
            //insert the 2 players into the room
            socket.join(gameRoom.roomId);
            partner.join(gameRoom.roomId);
            //tell 2 players that match is found
            this.io.to(gameRoom.roomId).emit(GAME_SOCKET_EVENTS.found_partner,{roomId:gameRoom.roomId});
            //if one of the players disconnected, tell the other user about it
            this.io.to(gameRoom.roomId).on('disconnect',(socket :iGameSocket)=>{
                socket.broadcast.to(gameRoom.roomId).emit(GAME_SOCKET_EVENTS.partner_disconnected);
            });

            this.gameRooms[gameRoom.roomId] = gameRoom;

        }
    }
    /**search partner for socket */
    searchForPartner(socket: iGameSocket): iGameSocket {
        
        if (this.waitingList.length === 0) {
        }
        else {
            //currently just get any random player available
            //TODO - change the search mechanism
            let partner: iGameSocket = this.waitingList[0];
            return partner;

        }
    }
    generateGameRoom(playerOne: iGameSocket, playerTwo: iGameSocket): iGameRoom {
        let roomId: string = uuid();
        //generate gameRoom :
        let gameRoom: iGameRoom = {
            roomId: roomId,
            playerOne: playerOne,
            playerTwo: playerTwo,
            miniGamesRemaining: 3
        }
        return gameRoom;
    }
}



