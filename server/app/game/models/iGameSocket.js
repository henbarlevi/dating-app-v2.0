"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getUserNameBySocket(socket) {
    return socket.user ? socket.user.first_name ? socket.user.first_name : socket.user._id.toString() : 'Unknown';
}
exports.getUserNameBySocket = getUserNameBySocket;
