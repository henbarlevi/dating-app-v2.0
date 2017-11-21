"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const App_1 = require("./App");
const port = normalizePort(process.env.PORT || 3000);
App_1.default.set('port', port);
const server = http.createServer(App_1.default);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
/**Socket.io */
const socketIo = require("socket.io");
const io = socketIo(server);
require('./game/game.socket')(io);
//require('./game/game.socket')(io);
/** / Scoket.io */
function normalizePort(val) {
    let port = (typeof val === 'string') ? parseInt(val, 10) : val;
    if (isNaN(port))
        return val;
    else if (port >= 0)
        return port;
    else
        return false;
}
function onError(error) {
    if (error.syscall !== 'listen')
        throw error;
    let bind = (typeof port === 'string') ? 'Pipe ' + port : 'Port ' + port;
    switch (error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}
function onListening() {
    let addr = server.address();
    let bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`;
    console.log('server is up on port  : ' + bind);
}
