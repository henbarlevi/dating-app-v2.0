//======imports
import * as Rx from 'rxjs';
import * as jwt from 'jsonwebtoken'; //jwt authentication
import * as socketIo from 'socket.io';
//======db

//====== services
import { miniGame } from "./mini_games/abstract_minigame";
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
import { GAME_TYPE } from './models/GAME_TYPE_ENUM';
import {  } from './models/GAME_SOCKET_EVENTS';
const TAG: string = 'GameRoomManager |';

// ====== Games
import { choose_partner_question } from './mini_games/choose_partner_question/choose_partner_question';
let miniGames = [
    choose_partner_question
];



// ====== / Games

/**handle an individual game room that contains 2 sockets of players
 * 
*/
export class GameRoomManager {
    constructor(private io: SocketIO.Namespace, private gameRoom: iGameRoom) {

    }
    async handle() {
        try {
           // while (this.gameRoom.miniGamesRemaining > 0) {
                //generate new mini game:
                let miniGameType: GAME_TYPE = randomizeGame();
                Logger.d(TAG, `gameRoom [${this.gameRoom.roomId}] - minigames Remaining [${this.gameRoom.miniGamesRemaining}] `);
                Logger.d(TAG, `gameRoom [${this.gameRoom.roomId}] - **generating ${miniGameType}`);

                let minigameClass = miniGames[miniGameType];

                let miniGame: miniGame = new minigameClass(this.io, this.gameRoom);


                await miniGame.playMiniGame();

           // }
        }
        catch (e) {
            Logger.d(TAG, `Err =====>${e}`, 'red')
        }

    }
    // waitForPlayersToBeReadyAndStartTheMiniGame() {
    //     return new Promise((resolve, reject) => {
    //         let playerOneRadyForMiniGame: Boolean = false;
    //         let playerTwoRadyForMiniGame: Boolean = false;

    //         this.io.to(this.gameRoom.roomId).on(GAME_SOCKET_EVENTS.ready_for_mini_game, async (socket: iGameSocket) => {
    //             try {
    //                 socket.user.facebook.id === this.gameRoom.playerOne.user.facebook.id ?
    //                     playerOneRadyForMiniGame = true : ''
    //                 socket.user.facebook.id === this.gameRoom.playerTwo.user.facebook.id ?
    //                     playerTwoRadyForMiniGame = true : ''

    //                 //if the 2 players are ready: start the mini game
    //                 playerOneRadyForMiniGame && playerTwoRadyForMiniGame ?
    //                    // TODO -startMiniGame
    //             }
    //             catch (e) {
    //                 Logger.d(TAG, 'ERR =====>' + e, 'red');
    //             }
    //         });

    //     })
    // }

}

function randomizeGame(): GAME_TYPE {
    let min: number = 0;
    let max: number = Object.keys(GAME_TYPE).length / 2-1;
    return Math.floor(Math.random() * (max - min + 1) + min);
}