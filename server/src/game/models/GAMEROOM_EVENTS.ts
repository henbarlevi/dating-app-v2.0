/**NOT RELATED TO SOCKETS EVENTS BETWEEN SERVER AND CLIENT 
 * @description the gameroom service will emit events realted to the room
*/

export enum GAMEROOM_EVENT {
    game_ended='game_ended',/**the session is finished (due to end of the game/users left game) and the gameroom should be disposed */
}