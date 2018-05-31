import { GAME_SOCKET_EVENTS } from "./GAME_SOCKET_EVENTS.enum";

//events of the game$ observable
export interface game$Event {
    eventName: GAME_SOCKET_EVENTS, // ready_for_minigame etc...
    eventData?: any //data that emitted along with the event (if exist)
}