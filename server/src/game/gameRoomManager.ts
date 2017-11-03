//======imports
import * as Rx from 'rxjs';
import * as jwt from 'jsonwebtoken'; //jwt authentication
import * as socketIo from 'socket.io';
//======db

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
const TAG: string = 'GameRoomManager |';


/**handle an individual game room that contains 2 sockets of players*/
export class GameRoomManager {
    constructor(){

    }
    static handle(gameRoom :iGameRoom){
        
    }
}