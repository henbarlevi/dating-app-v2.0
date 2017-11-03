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
//====== config
import * as config from 'config';
const ENV: string = process.env.ENV || 'local';
const envConfig: any = config.get(ENV);
//=======utils
import { Logger } from '../utils/Logger';
import { iGameSocket } from './models/iGameSocket';
const TAG: string = 'GameSocketsManager |';


/**handle game sockets */
export class GameScoketsManager {
    //sockets groups
    private waitingList: iGameSocket[] = []; //waiting for partner to play
    private gameRooms: { [roomId: string]: iGameRoom } = {};//gameRooms - Object {key:roomId,value:iGameRoom}
    /**
     *
     */
    constructor(private io: SocketIO.Namespace) {


    }
    /**accept new socket connected
     * 1.searching for the GameScoket a partner to play
     * 2.when finding one - generate a GameRoom for them
     */
    handle(socket: iGameSocket) {
        socket.on('disconnect', function () {
            console.log('user disconnected from game');
        });
        let partner: iGameSocket = this.searchForPartner(socket);
        if (!partner) {
            Logger.d(TAG, `inserting ${socket.user.facebook? socket.user.facebook.name :''} to waiting list`, 'yellow');
            this.waitingList.push(socket);
        } else { //if there is partner available
            //generate game room
            let gameRoom: iGameRoom = this.generateGameRoom(socket, partner);
            this.gameRooms[3] = gameRoom;
        }
    }
    /**search partner for socket */
    searchForPartner(socket: iGameSocket): iGameSocket {
        socket.emit(GAME_SOCKET_EVENTS.searchingForPlayer);
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
        //insert the 2 players into the room
        playerOne.join(GAME_SOCKET_EVENTS.found_match);
        playerTwo.join(GAME_SOCKET_EVENTS.found_match);
        //tell 2 players that match is found
        this.io.to(roomId).emit(GAME_SOCKET_EVENTS.found_match);
        //generate gameRoom :
        let gameRoom: iGameRoom = {
            roomId: roomId,
            playerOne: playerOne,
            playerTwo: playerTwo,
            gamesRemaining: 3
        }
        return gameRoom;
    }
}

export enum GAME_SOCKET_EVENTS {
    searchingForPlayer = 'searching_for_player',
    found_match = 'found_match'
}

