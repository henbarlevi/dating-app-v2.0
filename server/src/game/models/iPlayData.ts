//this is the event args along with the 'play' (when the client/server emit event of 'play')
//T = PLAY_ACTIONS_ENUM ( each mini game has PLAY_ACTIONS_ENUM)
export interface iPlayData<T> {
    actionType: T
    data?: any
}
