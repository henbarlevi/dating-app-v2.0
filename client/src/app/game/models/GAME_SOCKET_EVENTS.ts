//event names that occurred between server and client in a game socket
export enum GAME_SOCKET_EVENTS {
    searchForPartner = 'searching_for_partner',
    found_partner = 'found_partner',
    mini_game_ended = 'mini_game_ended',/**server tell sockets when a mini game end's */
    init_mini_game = 'init_mini_game',/**server tell sockets what mini-game to start */
    ready_for_mini_game = 'ready_for_mini_game',/**socket tell server that it ready for the mini game */
    your_turn ='your_turn', /*server tell socket that its his turn*/
    partner_played = 'partner_played', /**event with data about the other partner play actions */
    partner_disconnected = 'partner_disconnected' ,//if one of the players disconnected/left the game
    
    //edge cases
    already_connected = 'already_connected' //for example if the user create another tab and connecting in parallel
}