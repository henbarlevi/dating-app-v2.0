/**NOT RELATED TO SOCKETS EVENTS BETWEEN SERVER AND CLIENT 
 * @description the gameroom service will emit events realted to the room
*/

export enum GAMEROOM_EVENT {
    gameroom_session_ended='gameroom_session_ended',/**the session is finished (due to end of the game/users left game) and the gameroom should be disposed */
    gameroom_minigame_ended ='gameroom_minigame_ended'/**players finished a certian minigame */
}