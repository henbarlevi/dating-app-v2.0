//this is the event args along with the 'play' (when the client/server emit event of 'play')
// (when the player do some action in a minigame)
//T = PLAY_ACTIONS_ENUM ( each mini game has PLAY_ACTIONS_ENUM)
export interface iPlayAction<T> {
    type: T //type of the action (chosed question,choose card for ex)
    payload?: any //more data about the action
    playerId?:string//if the server tell the other players about the action, it will also mention who did the action
}
