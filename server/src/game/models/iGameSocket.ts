import { iDBUser } from "../../db/schemas/user";

/**
 * after socket authenticated
 * it will contain also the 
 * @param user- user db details
 * and after he join a gameroom it will also contain the
 * @param gameRoomId he is in
 */
export interface iGameSocket extends SocketIO.Socket {
    user?: iDBUser
    gameRoomId?: string
}



export function getUserNameBySocket(socket: iGameSocket): string { //return userName or userId
    return socket.user ? socket.user.first_name ? socket.user.first_name : socket.user._id.toString() : 'Unknown';
}