//this is the event args along with the 'play' (when the client/server emit event of 'play')
export interface iPlayAction<T> {
    type: T
    payload?: any
}
