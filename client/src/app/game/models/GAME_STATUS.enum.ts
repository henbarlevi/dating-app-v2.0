/*TODO - figure out a common status for client and server,
use in client to understand when user refresh to a specific page but
his game is a new session and he should be redirected to home/game in dashboard
*/
//currently in client
export enum GAME_STATUS {
    not_playing = 'not_playing',//can occurr only in client
    loading_new_game = 'loading_new_game',
    loading_minigame = 'loading_minigame',
    playing = 'playing',
    game_ended = 'game_ended',
    disconnected = 'disconnected' //can occurr only in client
  }
