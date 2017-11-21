"use strict";
/*reusable middlewares*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
//=====imports
const jwt = require("jsonwebtoken"); //jwt authentication
//===== DB
const user_rep_1 = require("../db/repository/user-rep");
//=====utils
const Logger_1 = require("../utils/Logger");
const TAG = 'Middlewares';
/*authentication middleware - filter unauthenticated user
    1.check if user sent a token in the headers | body | query
    2.verify user token and its exp.
    3.check that userId exist in db and if so save the user in req.user
    
*/
function authenticationMiddleware(req, res, next) {
    //1.check if user sent a token in the headers | body | query    
    var token = req.body.token || req.query.token || req.get('Authorization');
    Logger_1.Logger.d(TAG, '=============== Authentication Middleware ===============', 'gray');
    Logger_1.Logger.d(TAG, 'the token > ' + token, 'gray');
    // decode token
    if (token) {
        //2.verify user token and its exp.
        jwt.verify(token, 'mySecretForJWTtoken', (err, decoded) => __awaiter(this, void 0, void 0, function* () {
            if (err) {
                Logger_1.Logger.d(TAG, 'Failed to authenticate token > ' + err, 'red');
                return res.status(401).json({ success: false, message: 'Failed to authenticate token.' });
            }
            else {
                let userId = decoded.userId;
                /*
                3.check that userId exist in db and if so save the user in req.user
                using userId from decrypted token - to check if there is such user in db*/
                try {
                    let userRep = new user_rep_1.UserRepository();
                    let user = yield userRep.getUserById(userId);
                    Logger_1.Logger.d(TAG, `user is authenticated, userId > ${userId} `, 'green');
                    Logger_1.Logger.d(TAG, JSON.stringify(user), 'green');
                    Logger_1.Logger.d(TAG, '=============== / Authentication Middleware ===============', 'gray');
                    req.user = user;
                    next();
                }
                catch (e) {
                    Logger_1.Logger.d(TAG, 'ERR=========>' + e, 'red');
                    res.status(401).json({
                        success: false,
                        message: e
                    });
                }
            }
        }));
    }
    else {
        Logger_1.Logger.d(TAG, 'token not exist on Header | url | querystring', 'red');
        Logger_1.Logger.d(TAG, '=============== / Authentication Middleware ===============', 'gray');
        // if there is no token
        // return an error
        return res.status(401).json({
            success: false,
            message: 'No token provided.'
        });
    }
}
exports.authenticationMiddleware = authenticationMiddleware;
/*return User if token is valid*/
function verifyToken(token) {
    return new Promise((resolve, reject) => {
        Logger_1.Logger.d(TAG, `=============== Verify Token : ${token} ===============`, 'gray');
        Logger_1.Logger.d(TAG, 'the token > ' + token, 'gray');
        jwt.verify(token, 'mySecretForJWTtoken', (err, decoded) => __awaiter(this, void 0, void 0, function* () {
            if (err) {
                Logger_1.Logger.d(TAG, 'Failed to authenticate token > ' + err, 'red');
                reject(err);
            }
            else {
                let userId = decoded.userId;
                /*
                check that userId exist in db */
                try {
                    let userRep = new user_rep_1.UserRepository();
                    let user = yield userRep.getUserById(userId);
                    Logger_1.Logger.d(TAG, `user is authenticated, userId > ${userId} `, 'green');
                    Logger_1.Logger.d(TAG, JSON.stringify(user), 'green');
                    Logger_1.Logger.d(TAG, '=============== / Authentication Middleware ===============', 'gray');
                    resolve(user);
                }
                catch (e) {
                    Logger_1.Logger.d(TAG, 'ERR=========>' + e, 'red');
                    reject(e);
                }
            }
        }));
    });
}
exports.verifyToken = verifyToken;
