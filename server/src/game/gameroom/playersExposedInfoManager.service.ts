import { iGameRoom } from "../models/iGameRoom";
import { iGameRoomState } from "../models/iGameState.model";
import { GAME_SOCKET_EVENTS, partner_info_exposed_PAYLOAD } from "../models/GAME_SOCKET_EVENTS.enum";
import { iPartner } from "../models/iPartner.model";
import { iDBUser } from "../../db/schemas/user";
import { UserToPartnerAdapter } from "./userToPartner.converter";
import { Logger } from "../../utils/Logger";
import { randomizeInt } from "../../utils/utils.service";
import { game$, Game$, game$Event } from "../game$.service";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/timer';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/takeUntil';

import { relative } from "path";
import { GAMEROOM_EVENT } from "../models/GAMEROOM_EVENTS";
const TAG: string = 'PlayersExposedInfoManager |';
/**
 * @description  decide when and what data of the player (name/age/location/photo) to expose to the other players in the game room
 * 
 * NOTE -i made this class stateless so it will be safer but the con is that its slower
 */
export class PlayersExposedInfoManager {

    /**
     * @description Main Method - will handle all the  [partner_info_exposed] events in the gameroom specified in the function's input
     * @param gameroom 
     * @param gameroomState 
     * @param io 
     * @param exposerTrigger$ - observable that emit event any time an [partner_info_exposed] should be exposed, 
     * the event will emit the current state of the gameroom
     */
    static handleExposer(gameroom: iGameRoom, io: SocketIO.Namespace, exposerTrigger$: Observable<iGameRoomState>) {
        const gameEnded$: Observable<game$Event> = Game$.getByEventName(GAMEROOM_EVENT.gameroom_session_ended)
            .filter(gameEvent=>gameEvent.eventData.roomId === gameroom.roomId).first();
                
                gameEnded$.first().subscribe(()=>Logger.d(TAG, `** Finished emitting [partner_info_exposed] in gameroom [${gameroom.roomId}] (reason: game eneded) **`, 'yellow');)
        const subscription = exposerTrigger$.takeUntil(gameEnded$).subscribe((gameroomState: iGameRoomState) => {
            const exposed: boolean = this.expose(gameroom, gameroomState, io);
            Logger.d(TAG, `** Emited [partner_info_exposed] in gameroom [${gameroom.roomId}] **`, 'gray');
            if (!exposed) {//there are no more players info to expose
                subscription.unsubscribe();
                Logger.d(TAG, `** Finished emitting [partner_info_exposed] in gameroom [${gameroom.roomId}] (reason:no data left to emit)**`, 'yellow');
            }
        })
    }

    /**
     * @description decide which player to expose and what info about him to expose, return false if there is no more 
     * player's info left to expose
     * @param gameroom 
     * @param gameroomState 
     * @param io 
     */
    static expose(gameroom: iGameRoom, gameroomState: iGameRoomState, io: SocketIO.Namespace): boolean {
        try {

            const gameroomId: string = gameroom.roomId;
            const playersInfo: iDBUser[] = gameroom.players.map(s => s.user);
            const playersId: string[] = playersInfo.map(u => u._id.toString());
            // Logger.d(TAG,"all players info:",'red');
            // console.dir(playersInfo);
            // Logger.d(TAG,"players exposed info:",'red');

            const currentPlayersInfoExposer: { [index: string/*playerId*/]: iPartner } = gameroomState.players;
            const currentPlayersInfoExposerArr: iPartner[] = [];
            playersId.forEach(pId => currentPlayersInfoExposerArr.push(currentPlayersInfoExposer[pId]));
            //choose who to expose//
            const leastExposedPlayer: iPartner = this.chooseWhoToExpose(currentPlayersInfoExposerArr);
            /*choose what to expose*/
            const allPlayerInfo: iPartner = UserToPartnerAdapter.convert(playersInfo.find(u => u._id.toString() === leastExposedPlayer.id));
            const chosenPropToExpose: string = this.chooseWhatToExpose(allPlayerInfo, leastExposedPlayer);
            if (!chosenPropToExpose) {
                return false; // there are no more info to expose
            }
            //emit [partner_info_exposed] event:
            const eventData: partner_info_exposed_PAYLOAD = {
                playerId: leastExposedPlayer.id,
                infoPropExposed: chosenPropToExpose,//for ex:age
                infoPropValue: allPlayerInfo[chosenPropToExpose]//for ex:21
            };
            io.to(gameroomId).emit(GAME_SOCKET_EVENTS.partner_info_exposed, eventData);
            Game$.emit({
                eventName: GAME_SOCKET_EVENTS.partner_info_exposed,
                eventData: eventData,
                socket: gameroom.players[0]//TODO - currently just emitting any player to let gameroomManager resolve the roomId
            });
            return true;
        } catch (e) {
            Logger.d(TAG, `Err =====> couldn't expose players data :${e}`, 'red');
            return false;
        }
    }
    // /**
    //  * [TODO - INCOMPLETE]
    //  * @description will expose to players info about their partners
    //  * each interval time , until all partners info exposed Or until game ended
    //  * @param gameroom 
    //  * @param gameroomState 
    //  * @param io 
    //  * @param expose_interval_time 
    //  */
    // static exposeByTime(gameroom: iGameRoom, gameroomState: iGameRoomState, io: SocketIO.Namespace, expose_interval_time: number) {
    //     const gameroomId: string = gameroom.roomId;
    //     const fullPlayersInfo: iDBUser[] = gameroom.players.map(s => s.user);
    //     let currentPlayersInfoExposer: { [index: string/*playerId*/]: iPartner } = gameroomState.players;
    //     setInterval(() => {
    //         io.to(gameroomId).emit(GAME_SOCKET_EVENTS.partner_info_exposed, )
    //     }, expose_interval_time);
    // }


    /**
     * @description will @return the most least exposed player Id
     */
    private static chooseWhoToExpose(currentPlayersInfoExposer: iPartner[]): iPartner {
        if (!currentPlayersInfoExposer || currentPlayersInfoExposer.length == 0) {
            throw new Error(`Invalid Input for function : [ChooseWhoToExpose] ->  [alreadyExposedPlayersInfo]:${currentPlayersInfoExposer}, [alreadyExposedPlayersInfo.length]:${currentPlayersInfoExposer.length}`);
        }
        const playersAmount: number = currentPlayersInfoExposer.length;
        let leastExposedPlayer: iPartner = currentPlayersInfoExposer[0];
        let leastExposedPlayerPropsAmount: number = Object.keys(leastExposedPlayer).length;
        for (let i = 1; i < playersAmount; i++) {
            const exposedPlayerInfo: iPartner = currentPlayersInfoExposer[i];
            const playerExposerPropsAmount: number = Object.keys(exposedPlayerInfo).length;
            if (playerExposerPropsAmount < leastExposedPlayerPropsAmount) {
                leastExposedPlayer = exposedPlayerInfo;
                leastExposedPlayerPropsAmount = playerExposerPropsAmount;
            }
        }
        return leastExposedPlayer;
    }


    /**
     * @description @returns the property name of the player Info to expose (age/location/name)
     */
    private static chooseWhatToExpose(allPlayerInfo: iPartner, exposedPlayerInfo: iPartner): string {
        //resolve not yet exposed props:
        const notYetExposedProps: string[] = this.getNotYetExposedProps(allPlayerInfo, exposedPlayerInfo);
        if (!notYetExposedProps) {
            return null; //all player info already exposed
        }
        return this.randomizePropToExpose(notYetExposedProps);
    }

    /**
     * @description @returns the player's info properties names that not yet exposed to the other players (for ex: ['age','location']..)
     * if all the info about the player is already exposed @return null
     * @param allPlayerInfo - contain all the info about the player
     * @param exposedPlayerInfo - contain the current exposed info of the player to the other players
     */
    private static getNotYetExposedProps(allPlayerInfo: iPartner, exposedPlayerInfo: iPartner): string[] {
        const allPlayerInfoProps: string[] = Object.keys(allPlayerInfo);
        const alreadyExposedInfoProps: string[] = Object.keys(exposedPlayerInfo);
        const notYetExposed: iPartner = { ...allPlayerInfo };
        alreadyExposedInfoProps.forEach(p => delete notYetExposed[p]);
        const notYetExposedProps: string[] = Object.keys(notYetExposed)
        .filter(p=>allPlayerInfo[p]);//filter empty properties (that not contain a value)
        
        if (notYetExposedProps.length === 0) {
            return null;
        }
        return notYetExposedProps;
    }

    /**
     * randomize one of the prop names and @return it
     * @param notYetExposedProps -props names
     */
    private static randomizePropToExpose(notYetExposedProps: string[]): string {
        const notYetExposedPropsAmount: number = notYetExposedProps.length;
        //choose one of the props:
        const chosenPropToExpose: string = notYetExposedProps[randomizeInt(0, notYetExposedPropsAmount - 1)];
        return chosenPropToExpose;
    }
}