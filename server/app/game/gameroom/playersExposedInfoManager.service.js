"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GAME_SOCKET_EVENTS_enum_1 = require("../models/GAME_SOCKET_EVENTS.enum");
const userToPartner_converter_1 = require("./userToPartner.converter");
const Logger_1 = require("../../utils/Logger");
const utils_service_1 = require("../../utils/utils.service");
const game__service_1 = require("../game$.service");
require("rxjs/add/observable/timer");
require("rxjs/add/observable/interval");
require("rxjs/add/observable/merge");
require("rxjs/add/operator/map");
require("rxjs/add/operator/first");
require("rxjs/add/operator/takeUntil");
const GAMEROOM_EVENTS_1 = require("../models/GAMEROOM_EVENTS");
const TAG = 'PlayersExposedInfoManager |';
/**
 * @description  decide when and what data of the player (name/age/location/photo) to expose to the other players in the game room
 *
 * NOTE -i made this class stateless so it will be safer but the con is that its slower
 */
class PlayersExposedInfoManager {
    /**
     * @description Main Method - will handle all the  [partner_info_exposed] events in the gameroom specified in the function's input
     * @param gameroom
     * @param gameroomState
     * @param io
     * @param exposerTrigger$ - observable that emit event any time an [partner_info_exposed] should be exposed,
     * the event will emit the current state of the gameroom
     */
    static handleExposer(gameroom, io, exposerTrigger$) {
        const gameEnded$ = game__service_1.Game$.getByEventName(GAMEROOM_EVENTS_1.GAMEROOM_EVENT.gameroom_session_ended)
            .filter(gameEvent => gameEvent.eventData.roomId === gameroom.roomId).first();
        gameEnded$.first().subscribe(() => Logger_1.Logger.d(TAG, `** Finished emitting [partner_info_exposed] in gameroom [${gameroom.roomId}] (reason: game eneded) **`, 'yellow'));
        const subscription = exposerTrigger$.takeUntil(gameEnded$).subscribe((gameroomState) => {
            const exposed = this.expose(gameroom, gameroomState, io);
            Logger_1.Logger.d(TAG, `** Emited [partner_info_exposed] in gameroom [${gameroom.roomId}] **`, 'gray');
            if (!exposed) {
                subscription.unsubscribe();
                Logger_1.Logger.d(TAG, `** Finished emitting [partner_info_exposed] in gameroom [${gameroom.roomId}] (reason:no data left to emit)**`, 'yellow');
            }
        });
    }
    /**
     * @description decide which player to expose and what info about him to expose, return false if there is no more
     * player's info left to expose
     * @param gameroom
     * @param gameroomState
     * @param io
     */
    static expose(gameroom, gameroomState, io) {
        try {
            const gameroomId = gameroom.roomId;
            const playersInfo = gameroom.players.map(s => s.user);
            const playersId = playersInfo.map(u => u._id.toString());
            // Logger.d(TAG,"all players info:",'red');
            // console.dir(playersInfo);
            // Logger.d(TAG,"players exposed info:",'red');
            const currentPlayersInfoExposer = gameroomState.players;
            const currentPlayersInfoExposerArr = [];
            playersId.forEach(pId => currentPlayersInfoExposerArr.push(currentPlayersInfoExposer[pId]));
            //choose who to expose//
            const leastExposedPlayer = this.chooseWhoToExpose(currentPlayersInfoExposerArr);
            /*choose what to expose*/
            const allPlayerInfo = userToPartner_converter_1.UserToPartnerAdapter.convert(playersInfo.find(u => u._id.toString() === leastExposedPlayer.id));
            const chosenPropToExpose = this.chooseWhatToExpose(allPlayerInfo, leastExposedPlayer);
            if (!chosenPropToExpose) {
                return false; // there are no more info to expose
            }
            //emit [partner_info_exposed] event:
            const eventData = {
                playerId: leastExposedPlayer.id,
                infoPropExposed: chosenPropToExpose,
                infoPropValue: allPlayerInfo[chosenPropToExpose] //for ex:21
            };
            io.to(gameroomId).emit(GAME_SOCKET_EVENTS_enum_1.GAME_SOCKET_EVENTS.partner_info_exposed, eventData);
            game__service_1.Game$.emit({
                eventName: GAME_SOCKET_EVENTS_enum_1.GAME_SOCKET_EVENTS.partner_info_exposed,
                eventData: eventData,
                socket: gameroom.players[0] //TODO - currently just emitting any player to let gameroomManager resolve the roomId
            });
            return true;
        }
        catch (e) {
            Logger_1.Logger.d(TAG, `Err =====> couldn't expose players data :${e}`, 'red');
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
    static chooseWhoToExpose(currentPlayersInfoExposer) {
        if (!currentPlayersInfoExposer || currentPlayersInfoExposer.length == 0) {
            throw new Error(`Invalid Input for function : [ChooseWhoToExpose] ->  [alreadyExposedPlayersInfo]:${currentPlayersInfoExposer}, [alreadyExposedPlayersInfo.length]:${currentPlayersInfoExposer.length}`);
        }
        const playersAmount = currentPlayersInfoExposer.length;
        let leastExposedPlayer = currentPlayersInfoExposer[0];
        let leastExposedPlayerPropsAmount = Object.keys(leastExposedPlayer).length;
        for (let i = 1; i < playersAmount; i++) {
            const exposedPlayerInfo = currentPlayersInfoExposer[i];
            const playerExposerPropsAmount = Object.keys(exposedPlayerInfo).length;
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
    static chooseWhatToExpose(allPlayerInfo, exposedPlayerInfo) {
        //resolve not yet exposed props:
        const notYetExposedProps = this.getNotYetExposedProps(allPlayerInfo, exposedPlayerInfo);
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
    static getNotYetExposedProps(allPlayerInfo, exposedPlayerInfo) {
        const allPlayerInfoProps = Object.keys(allPlayerInfo);
        const alreadyExposedInfoProps = Object.keys(exposedPlayerInfo);
        const notYetExposed = Object.assign({}, allPlayerInfo);
        alreadyExposedInfoProps.forEach(p => delete notYetExposed[p]);
        const notYetExposedProps = Object.keys(notYetExposed)
            .filter(p => allPlayerInfo[p]); //filter empty properties (that not contain a value)
        if (notYetExposedProps.length === 0) {
            return null;
        }
        return notYetExposedProps;
    }
    /**
     * randomize one of the prop names and @return it
     * @param notYetExposedProps -props names
     */
    static randomizePropToExpose(notYetExposedProps) {
        const notYetExposedPropsAmount = notYetExposedProps.length;
        //choose one of the props:
        const chosenPropToExpose = notYetExposedProps[utils_service_1.randomizeInt(0, notYetExposedPropsAmount - 1)];
        return chosenPropToExpose;
    }
}
exports.PlayersExposedInfoManager = PlayersExposedInfoManager;
