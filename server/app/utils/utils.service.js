"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class utilsService {
    /**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
    static randomizeInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
exports.utilsService = utilsService;
