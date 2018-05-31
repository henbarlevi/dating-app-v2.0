//event names that occurred between server and client in a game socket
export enum GAME_SOCKET_EVENTS {
    /**connection | disconnection */
    disconnect= 'disconnect',//some client disconnected
    connection = 'connection', //some client connected
    leave_game = 'leave_game',//some client left a game permenantly
    game_ended = 'game_ended',

    partner_left_game = 'partner_left_game',/**telling other players that their partner left the game permenantly */
    partner_disconnected = 'partner_disconnected' ,//if one of the players disconnected while in game 
    partner_reconnection_time_ended = 'partner_reconnection_time_ended', //partner didnt reconnected after disconneciton and his session expierd
    partner_reconnected = 'partner_reconnected' ,//if partner reconnected on time after he temp disconnected
    
    /** search for game*/
    searchForPartner = 'searching_for_partner',/**server tell socket (client) it searching for a partner */
    found_partner = 'found_partner',
    /**mini game */
    mini_game_ended = 'mini_game_ended',/**server tell sockets when a mini game end's */
    init_mini_game = 'init_mini_game',/**server tell sockets what mini-game to start */
    
    /**ready */
    ready_for_mini_game = 'ready_for_mini_game',/**socket tell server that it ready for the mini game */
    ready='ready',/**server/socket tell to socket/server that he ready for something [NOT USED]*/
    /**turn - 3 options */
    player_turn ='player_turn', /*[GENERIC] server tell sockets who turn it is [NOT USED]*/
    your_turn="your_turn",/**server tell socket that its his turn [NOT USED]*/
    partner_turn="partner_turn",/**server tell socket that its his PARTNER turn [NOT USED]*/
    
    partner_played = 'partner_played', /**server tell the other socket data about the other partner play actions */
    play= 'play',/*client tell server about is play move*/
    //edge cases
    already_connected = 'already_connected' ,//(Currently not in use in client - maybe useless )for example if the user create another tab and connecting in parallel ,telling the first tab to close the session
    reconnection_data = 'reconnection_data'//server tell user that he has reconnted to game along with the current gamestate details
}