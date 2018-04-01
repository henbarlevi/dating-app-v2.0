import { iUser } from "../../models/iUser.model";

/**after socket authenticated
 * it will contain also the user details
 */
export interface iGameSocket extends SocketIO.Socket{
    user?:iUser
    gameRoomId?:string
}