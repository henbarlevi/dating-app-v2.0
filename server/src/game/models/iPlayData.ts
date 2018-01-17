//this is the event args along with the 'play' (when the client/server emit event of 'play')
//T = PLAY_ACTIONS_ENUM ( each mini game has PLAY_ACTIONS_ENUM)
export interface iPlayAction<T> {
    type: T //type of the action (chosed question,choose card for ex)
    payload?: any //more data about the action
}
