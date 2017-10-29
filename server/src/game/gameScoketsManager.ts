//======imports
import * as fs from 'fs';
import * as Rx from 'rxjs';
import * as request from 'request';
import * as jwt from 'jsonwebtoken'; //jwt authentication
import * as socketIo from 'socket.io';

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
const TAG: string = 'GameSocketsManager |';


/**handle game sockets */
export class GameScoketsManager{
    //sockets groups
    private searchingForPartner;
    private playing
    /**
     *
     */
    constructor() {
      
        
    }
}