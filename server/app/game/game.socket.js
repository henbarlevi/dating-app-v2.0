"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//====== config
const config = require("config");
const ENV = process.env.ENV || 'local';
const envConfig = config.get(ENV);
//=======utils
const Logger_1 = require("../utils/Logger");
const TAG = 'GameSockets |';
module.exports = function (io) {
    Logger_1.Logger.d(TAG, 'establishing sockets.io for games..');
    io.sockets.on('connection', (socket) => {
        console.log('user connected');
        console.log(socket);
        socket.on('disconnect', function () {
            console.log('user disconnected');
        });
        socket.on('add-message', (message) => {
            io.emit('message', { type: 'new-message', text: message });
        });
    });
};
//-------------------------------------SNIPPETS-------------------------
//CONVERTING NODE FS callback to REACTIVE
// fs.readdir('./dist/routes',(err,items)=>{
//     if(err){
//         console.log(err);
//     }
//     else{
//         console.log(items);
//     }
// })
// //converting node callback function to reactive version:
// const readdir$ = Rx.Observable.bindNodeCallback(fs.readdir); //save it as a function
// readdir$('./dist/routes').subscribe(items=>{console.log(items)}); 
