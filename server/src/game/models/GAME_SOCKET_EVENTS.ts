//event names that occurred between server and client in a game socket
export enum GAME_SOCKET_EVENTS {
    disconnect= 'disconnect',//some client disconnected
    connection = 'connection', //some client connected
    
    searchForPartner = 'searching_for_partner',/**server tell socket (client) it searching for a partner */
    found_partner = 'found_partner',
    mini_game_ended = 'mini_game_ended',/**server tell sockets when a mini game end's */
    init_mini_game = 'init_mini_game',/**server tell sockets what mini-game to start */
    /**ready */
    ready_for_mini_game = 'ready_for_mini_game',/**socket tell server that it ready for the mini game */
    ready='ready',/**server/socket tell to socket/server that he ready for something */
    /**turn - 3 options */
    player_turn ='player_turn', /*server tell sockets who turn it is*/
    your_turn="your_turn",/**server tell socket that its his turn */
    partner_turn="partner_turn",/**server tell socket that its his PARTNER turn */
    
    partner_played = 'partner_played', /**server tell the other socket data about the other partner play actions */
    play= 'play',/*client tell server about is play move*/
 
    partner_disconnected = 'partner_disconnected' ,//if one of the players disconnected/left the game
    partner_reconnection_time_ended = 'partner_reconnection_time_ended', //partner didnt reconnected after disconneciton and his session expierd
    //edge cases
    already_connected = 'already_connected' //for example if the user create another tab and connecting in parallel ,telling the first tab to close the session
}