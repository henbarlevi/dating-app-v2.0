"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getUserNameBySocket(socket) {
    return socket.user.facebook ? socket.user.facebook.name : socket.user._id;
}
exports.getUserNameBySocket = getUserNameBySocket;
