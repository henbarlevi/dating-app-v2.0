"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class choose_partner_question {
    startMiniGame(io, gameRoom) {
        let turn;
        //randomize player:
        Math.floor(Math.random() * 2) === 0 ?
            turn = gameRoom.playerOne : turn = gameRoom.playerTwo;
        if (turn === gameRoom.playerOne) {
        }
    }
}
exports.choose_partner_question = choose_partner_question;
