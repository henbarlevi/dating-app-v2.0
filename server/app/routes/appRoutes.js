"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
//======imports
const express = require("express");
const jwt = require("jsonwebtoken"); //jwt authentication
//======db
const user_rep_1 = require("../db/repository/user-rep");
//====== services
const facebook_service_1 = require("../facebook/facebook.service"); //facebook Oauth and Api Service
const middlewares_1 = require("../helpers/middlewares");
//config
const config = require("config");
const ENV = process.env.ENV || 'local';
const envConfig = config.get(ENV);
//=======utils
const Logger_1 = require("../utils/Logger");
const TAG = 'AppRoutes';
const router = express.Router();
//sanity check
router.get('/', (req, res) => {
    res.send('welcome to server api');
});
//redirect client to facebook consent page 
router.get('/auth-with-facebook', (req, res) => {
    let url = facebook_service_1.FackbookService.getConsentPageUrl();
    res.redirect(url);
});
/*
1.get code from client and exchange it for an access_token
2.create/update user with his authentication credentials*/
router.post('/facebook/code', (req, res) => __awaiter(this, void 0, void 0, function* () {
    let code = req.body.code;
    if (code) {
        Logger_1.Logger.d(TAG, 'got code from client >' + code, 'yellow');
        //1.get code from client and exchange it for an access_token:
        facebook_service_1.FackbookService.getAccessToken(code)
            .then((userCredentials) => __awaiter(this, void 0, void 0, function* () {
            let access_token = userCredentials.access_token;
            if (access_token) {
                printFacebookCreds(userCredentials); //just print info
                try {
                    //GETTING USER CREDENTIALS
                    let userInfo = yield facebook_service_1.FackbookService.getUserInfo(access_token);
                    Logger_1.Logger.d(TAG, 'got user info >' + JSON.stringify(userInfo), 'yellow');
                    //2.create/update user with his authentication credentials*/                      
                    //create user if not exist /if exist - update his gender,name,link in case they have changed
                    let user = {
                        facebook: {
                            id: userInfo.id,
                            name: userInfo.name,
                            gender: userInfo.gender,
                            link: userInfo.link,
                            access_token: userCredentials.access_token,
                            token_type: userCredentials.token_type,
                            expires_in: userCredentials.expires_in // { seconds - til - expiration }
                        }
                    };
                    let userRep = new user_rep_1.UserRepository();
                    yield userRep.updateOrCreateFacebookCreds(user);
                    //TODO - check if that user exist first -and if so - change only its relation to facebook authorization
                    /*in case user relation to facebook not exist -create it (user -AUTHENTICATED_WITH-> facebook)
                    if exist -update credentials (access token etc..)*/
                    //let userId: string = results.records[0]._fields[0].properties.userId;
                    //create token for authenticated user:
                    let token = jwt.sign({
                        userId: userId
                    }, 'mySecretForJWTtoken', { expiresIn: '1h' });
                    //send 200 with the token
                    res.status(200).json({
                        token: token
                        // ,userId:userId
                    });
                    // Logger.d(TAG, JSON.stringify(results.records[0]), 'yellow');
                }
                catch (e) {
                    Logger_1.Logger.d(TAG, 'ERR========> couldnt get user info/ couldnt create user', 'red');
                    Logger_1.Logger.d(TAG, e, 'red');
                    res.status(500).send('couldnt save user in db');
                }
            }
        }))
            .catch(code => {
            res.status(401).send('couldnt authenticate user via facebook, the code isnt valid or already been user');
        });
    }
}));
//====================================== UnAuthetication Middleware ======================================
/*UnAutheticated Users Filter middleware - middleware that filter unlogin users*/
router.use('/', middlewares_1.authenticationMiddleware);
//====================================== UnAuthetication Middleware ======================================
/*NOT CURRENTLY IN USE*/
router.get('/analyze', (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        let user = req.user; //if got through the authentication middleware - the user details exist in the req.user
        let userRepository = new user_rep_1.UserRepository();
        let response = yield facebook_service_1.FackbookService.getUserFriends(user.facebook.access_token);
        let userFriends = response.data;
        for (let friend of userFriends) {
            userRepository.createFriendshipBetweenUsers(user.facebook.id, friend.id)
                .catch(e => Logger_1.Logger.d(TAG, 'ERR=========>' + e, 'red'));
        }
        response = yield facebook_service_1.FackbookService.createUserPost(user.facebook.access_token);
        res.status(200).json('analyzing user..');
    }
    catch (e) {
        Logger_1.Logger.d(TAG, 'ERR=========>' + e, 'red');
    }
}));
function printFacebookCreds(userCredentials) {
    Logger_1.Logger.d(TAG, '=================== GOT FACEBOOK CREDENTIALS  ===================', 'yellow');
    Logger_1.Logger.d(TAG, 'access_token =' + userCredentials.access_token, 'yellow');
    Logger_1.Logger.d(TAG, 'token_type =' + userCredentials.token_type, 'yellow');
    Logger_1.Logger.d(TAG, 'expires_in =' + userCredentials.expires_in, 'yellow');
    Logger_1.Logger.d(TAG, '=================== GOT FACEBOOK CREDENTIALS  ===================', 'yellow');
}
exports.default = router;
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
