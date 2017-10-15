/*reusable middlewares*/

//=====imports
import * as jwt from 'jsonwebtoken'; //jwt authentication
//===== DB
import { neo4jDB } from '../db/neo4jdb';
import { UserRepository } from '../db/repository/user-rep';
//=====models
import { iUser } from '../models'

//=====utils
import { Logger } from '../utils/Logger';
const TAG = 'Middlewares';

/*authentication middleware - filter unauthenticated user
    1.check if user sent a token in the headers | body | query    
    2.verify user token and its exp.
    3.check that userId exist in db and if so save the user in req.user
    
*/
export function authenticationMiddleware(req, res, next) {
    //1.check if user sent a token in the headers | body | query    
    var token = req.body.token || req.query.token || req.get('Authorization');
    Logger.d(TAG, '=============== Authentication Middleware ===============', 'gray');
    Logger.d(TAG, 'the token > ' + token, 'gray');
    // decode token
    if (token) {

        //2.verify user token and its exp.
        jwt.verify(token, 'mySecretForJWTtoken', async (err, decoded) => {
            if (err) {//can happen in case token expiers
                Logger.d(TAG, 'Failed to authenticate token > ' + err, 'red');
                return res.status(401).json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                let userId = decoded.userId;
                /*
                3.check that userId exist in db and if so save the user in req.user
                using userId from decrypted token - to check if there is such user in db*/
                try {

                    let userRep = new UserRepository();
                    let user: iUser = await userRep.getUserById(userId);
                    Logger.d(TAG, `user is authenticated, userId > ${userId} `, 'green');
                    Logger.d(TAG, JSON.stringify(user), 'green');
                    Logger.d(TAG, '=============== / Authentication Middleware ===============', 'gray');
                    req.user = <iUser>user;
                    next();
                } catch (e) {
                    Logger.d(TAG, 'ERR=========>' + e, 'red');
                    res.status(401).json({
                        success: false,
                        message: e
                    })

                }
            }
        });

    } else {
        Logger.d(TAG, 'token not exist on Header | url | querystring', 'red');

        Logger.d(TAG, '=============== / Authentication Middleware ===============', 'gray');

        // if there is no token
        // return an error
        return res.status(401).json({
            success: false,
            message: 'No token provided.'
        });

    }

}