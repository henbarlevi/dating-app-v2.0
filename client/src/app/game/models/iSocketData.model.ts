import { GAME_SOCKET_EVENTS } from "./GAME_SOCKET_EVENTS";

//each time socket io emit event , this is what the body contain
export interface iSocketData{
    data : [/*[0]*/String | /*[1]*/GAME_SOCKET_EVENTS ,any], // arr[1] = the emit event name , arr[2] -extra params
    nsp:string |"/" //name space
    type:Number
}