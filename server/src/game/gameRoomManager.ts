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
import { GAME_TYPE } from './models/GAME_TYPE_ENUM';
import { GAME_SOCKET_EVENTS } from './models/GAME_SOCKET_EVENTS';
const TAG: string = 'GameRoomManager |';

// ====== Games
import { choose_partner_question } from './mini_games/choose_partner_question';
let miniGames = [
    choose_partner_question
]



// ====== / Games

/**handle an individual game room that contains 2 sockets of players
 * 
*/
export class GameRoomManager {
    constructor(private io: SocketIO.Namespace, private gameRoom: iGameRoom) {

    }
    async handle() {
        while (this.gameRoom.miniGamesRemaining > 0) {

            //generate new mini game:
            let miniGameType: GAME_TYPE = randomizeGame();
            let minigameClass = miniGames[miniGameType];
            let miniGame =  new minigameClass();
            //TODO -transfer the minigame into the mini gameclass (waitForPlayersToBeReadyAndStartTheMiniGame) etc..
            //and maybe create super class 

            //declaring the mini game that should start - this is how client know to load the minigame screen:
            this.io.to(this.gameRoom.roomId).emit(GAME_SOCKET_EVENTS.init_mini_game, { miniGame: miniGameType });


        }
    }
    waitForPlayersToBeReadyAndStartTheMiniGame() {
        return new Promise((resolve, reject) => {
            let playerOneRadyForMiniGame: Boolean = false;
            let playerTwoRadyForMiniGame: Boolean = false;

            this.io.to(this.gameRoom.roomId).on(GAME_SOCKET_EVENTS.ready_for_mini_game, async (socket: iGameSocket) => {
                try {
                    socket.user.facebook.id === this.gameRoom.playerOne.user.facebook.id ?
                        playerOneRadyForMiniGame = true : ''
                    socket.user.facebook.id === this.gameRoom.playerTwo.user.facebook.id ?
                        playerTwoRadyForMiniGame = true : ''

                    //if the 2 players are ready: start the mini game
                    playerOneRadyForMiniGame && playerTwoRadyForMiniGame ?
                       // TODO -startMiniGame
                }
                catch (e) {
                    Logger.d(TAG, 'ERR =====>' + e, 'red');
                }
            });

        })
    }

}

function randomizeGame(): GAME_TYPE {
    let min: number = 0;
    let max: number = Object.keys(GAME_TYPE).length / 2
    return Math.floor(Math.random() * (max - min + 1) + min);
}