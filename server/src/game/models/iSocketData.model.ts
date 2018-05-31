import { GAME_SOCKET_EVENTS } from "./GAME_SOCKET_EVENTS.enum";

//each time socket io emit event , this is what the body contain
export interface iSocketData{
    data : [/*[0]*/GAME_SOCKET_EVENTS  /*[1]*/ ,any], // arr[1] = the emit event name , arr[2] -extra params
    nsp:string |"/" //name space
    type:Number
}