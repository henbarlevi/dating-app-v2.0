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
    Logger_1.Logger.t(TAG, 'Facebook Auth', 'green');
    const url = facebook_service_1.FackbookService.getConsentPageUrl();
    res.send(url);
});
/*
1.get code from client and exchange it for an access_token
2.create/update user - with his authentication credentials and fetched user info*/
router.post('/facebook/code', (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const code = req.body.code;
        console.log('the code :' + code);
        if (code) {
            Logger_1.Logger.d(TAG, 'got code from client >' + code, 'yellow');
            //1.get code from client and exchange it for an access_token:
            const creds = yield facebook_service_1.FackbookService.getAccessToken(code);
            const access_token = creds.access_token;
            if (access_token) {
                Logger_1.Logger.st(TAG, 'got user Creds', 'green');
                console.dir(creds);
                let userInfo = yield facebook_service_1.FackbookService.getUserInfo(access_token);
                Logger_1.Logger.d(TAG, 'got user info >' + JSON.stringify(userInfo), 'yellow');
                //2.create/update user with his authentication credentials*/                      
                //create user if not exist /if exist - update his gender,name,link in case they have changed
                let user = {
                    oauth_provider: 'facebook',
                    oauth_provider_userid: userInfo.id,
                    first_name: userInfo.first_name,
                    last_name: userInfo.last_name,
                    location: userInfo.location ? `${userInfo.location.city} ${userInfo.location.country}` : userInfo.hometown ? userInfo.hometown.name : '',
                    birth_day: new Date(userInfo.birthday),
                    gender: userInfo.gender,
                    profile_link: userInfo.link,
                    photo_link: userInfo.picture.data.url,
                    access_token: creds.access_token,
                    refresh_token: creds.refresh_token ? creds.refresh_token : '',
                    token_expiration: new Date(Date.now() + creds.expires_in * 1000) // facebook return the seconds untill token expiers
                    //TODO - check if expires_in is really in seconds
                };
                try {
                    //update/create user
                    let userRep = new user_rep_1.UserRepository();
                    let userDB = yield userRep.updateOrCreateFacebookCreds(user);
                    //create token for authenticated user:
                    let token = jwt.sign({
                        userId: userDB._id
                    }, 'mySecretForJWTtoken'); //, { expiresIn: '3h' });
                    Logger_1.Logger.d(TAG, 'sending back the token >' + token, 'yellow');
                    //send 200 with the token
                    res.status(200).json({
                        token: token
                        // ,userId:userId
                    });
                }
                catch (e) {
                    Logger_1.Logger.d(TAG, 'ERR========> couldnt get user info/ couldnt create user', 'red');
                    Logger_1.Logger.d(TAG, e, 'red');
                    res.status(500).send('couldnt save user in db');
                }
            }
        }
        else {
            res.status(400).send(`didn't provide 'code' parameter`);
        }
    }
    catch (e) {
        res.status(401).send('couldnt authenticate user via facebook, the code isnt valid or already been used');
    }
}));
//====================================== UnAuthetication Middleware ======================================
/*UnAutheticated Users Filter middleware - middleware that filter unlogin users*/
router.use('/', middlewares_1.authenticationMiddleware);
//====================================== UnAuthetication Middleware ======================================
/*NOT CURRENTLY IN USE*/
// router.get('/analyze', async (req: any, res) => {
//     try {
//         let user: iUser = req.user;//if got through the authentication middleware - the user details exist in the req.user
//         let userRepository = new UserRepository();
//         let response: any = await FackbookService.getUserFriends(user.facebook.access_token)
//         let userFriends = response.data;
//         for (let friend of userFriends) {
//             userRepository.createFriendshipBetweenUsers(user.facebook.id, friend.id)
//                 .catch(e => Logger.d(TAG, 'ERR=========>' + e, 'red'));
//         }
//         response = await FackbookService.createUserPost(user.facebook.access_token);
//         res.status(200).json('analyzing user..');
//     }
//     catch (e) {
//         Logger.d(TAG, 'ERR=========>' + e, 'red')
//     }
// });
function printFacebookCreds(userCredentials) {
    Logger_1.Logger.d(TAG, '=================== GOT FACEBOOK CREDENTIALS  ===================', 'yellow');
    Logger_1.Logger.d(TAG, 'access_token =' + userCredentials.access_token, 'yellow');
    Logger_1.Logger.d(TAG, 'token_type =' + userCredentials.token_type, 'yellow');
    Logger_1.Logger.d(TAG, 'expires_in =' + userCredentials.expires_in, 'yellow');
    Logger_1.Logger.d(TAG, '=================== / GOT FACEBOOK CREDENTIALS  ===================', 'yellow');
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
//CHECK WHAT getuserInfo print:
// FackbookService.getUserInfo("EAAIGZCsnEtxsBABfNGExBhIhtJ9AvEacOyV45iLRiWFFZBdguDsvrEvQCIjoYxzY7fykBfylj9fripsD4ZAQvNZCpQZAJQb557eHuZAQBSeKMH5IF7wDT7zuyo38QZC6uglfqtLUCwZAyd7ZAJtzQrGp0hUZAn4g0SOLyKLoUgMj2RmAZDZD")
//     .then(res => {
//         Logger.t(TAG, 'User INfo TEst', 'green');
//         console.log(res);
//         Logger.t(TAG, 'User INfo TEst', 'green');
//     })
