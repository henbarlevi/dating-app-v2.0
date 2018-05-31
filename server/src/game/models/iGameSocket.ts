import { iUser } from "../../models/iUser.model";

/**
 * after socket authenticated
 * it will contain also the 
 * @param user- user db details
 * and after he join a gameroom it will also contain the
 * @param gameRoomId he is in
 */
export interface iGameSocket extends SocketIO.Socket{
    user?:iUser
    gameRoomId?:string
}



export  function getUserNameBySocket(socket: iGameSocket) :string { //return userName or userId
    return socket.user.facebook ? socket.user.facebook.name : socket.user._id
}