//========imports
import * as config from 'config';
import * as request from 'request';
import { Logger } from '../utils/Logger';
const fb = require('fbgraph');//facebook graph api sdk
const TAG = 'FacebookService';
//========config
const ENV: string = process.env.ENV || 'local';
const envConfig: any = config.get(ENV);
const clientId = envConfig.facebook.client_id;
const redirect_uri = envConfig.facebook.redirect_uri;
const clientSecret = envConfig.facebook.client_secret;
//https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow#login
//for change app setting:
//https://developers.facebook.com/apps/570641329993499/settings/

//========models
import { iFacebookCredentials } from './models/iFacebookCredentials.model'
import { iFacebookUserInfo } from './models/iUserinfo.model'

export class FackbookService {

    static getConsentPageUrl() {
        let permissions = [
            'user_birthday',
            'user_gender',
            'user_link',//Provides access to the Facebook profile URL for another user of the app.
            'user_hometown',//Provides access to a person's hometown location through the hometown field on the User object. This is set by the user on the Profile.
            'user_location',//Provides access to a person's current city through the location field on the User object. The current city is set by a person on their Profile.
            'user_photos',
            'user_videos',
            'user_likes',
            'user_posts',
            'user_friends',
            'publish_actions',
            'email' //Provides access to the person's primary email address via the email property on the user object.
        ];

        let url = `https://www.facebook.com/v2.10/dialog/oauth?client_id=${clientId}&redirect_uri=${redirect_uri}`
            + '&scope=' + permissions.join();
        return url;
    }
    //     GET https://graph.facebook.com/v2.10/oauth/access_token?
    //    client_id={app-id}
    //    &redirect_uri={redirect-uri}
    //    &client_secret={app-secret}
    //    &code={code-parameter}
    static getAccessToken(code) {
        return new Promise<iFacebookCredentials>((resolve, reject) => {

            let url = `https://graph.facebook.com/v2.10/oauth/access_token?` +
                'client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&client_secret=' + clientSecret + '&code=' + code;
            Logger.d(TAG, `**** getting access token ****`, 'gray');


            request.get(url, {
                // headers: headers,
                json: true,

            }, (err, response, body) => {
                if (!response || response.statusCode > 204) {//ERR
                    Logger.d(TAG, JSON.stringify(response), 'red');
                    reject(response.statusCode);
                }
                else {
                    const userCredentials: iFacebookCredentials = typeof body == 'string' ? JSON.parse(body) : body;
                    if (!userCredentials) {//if array is empty and document info not found
                        reject(404);
                    }

                    resolve(userCredentials);
                }

            });
        });
    }
    /**
     * Returns info about user profile (name,link,profile pic etc..) 
     * @see https://developers.facebook.com/docs/graph-api/reference/v3.0/user
     * @param access_token 
     */
    static getUserInfo(access_token: string) :Promise<iFacebookUserInfo>{
        //https://graph.facebook.com/me?access_token=...
        return new Promise<iFacebookUserInfo>((resolve, reject) => {

            // let url = `https://graph.facebook.com/me?access_token=` + accessToken + '&fields=id,email,name,gender,link,picture&type=large'
            // request.get(url, {
            //     // headers: headers,
            //     json: true,
            // }, (err, response, body) => {
            //     if (!response || response.statusCode > 204) {//ERR
            //         Logger.d(TAG, JSON.stringify(response), 'red');
            //         reject(response.statusCode);
            //     }
            //     else {
            //         const userCredentials: iFacebookUserInfo = typeof body == 'string' ? JSON.parse(body) : body;
            //         if (!userCredentials) {//if array is empty and document info not found
            //             reject(404);
            //         }
            //         resolve(userCredentials);
            //     }
            // });
            const userInfoParams: string = ['id', 
                'birthday',
                'cover',
                'first_name',
                'last_name',
                'locale',
                'hometown',
                'email',
                'gender',
                'link',
                'picture',
                'address'].join(',');
            Logger.d(TAG, `****getting user info facebook Info (name,gender etc..)**** `, 'gray');//TODOTODOTODO do a scalable user info (consider to add instegram in the future)
            fb.setAccessToken(access_token);
            fb.get(`/me?access_token=${access_token}`, { fields: userInfoParams }, (err, res) => {
                if (err || !res) {
                    reject(err);
                } else {
                    resolve(res);
                }
            })



        });
    }
    //https://developers.facebook.com/docs/graph-api/reference/user/friends/
    static getUserFriends(accessToken) {
        return new Promise<any>((resolve, reject) => {
            let url = `https://graph.facebook.com/v2.10/me/friends?access_token=` + accessToken

            //GET /v2.10/{user-id}/friends
            Logger.d(TAG, `**getting user friends >${url}** `, 'gray');

            request.get(url, {
                // headers: headers,
                json: true,

            }, (err, response, body) => {
                if (!response || response.statusCode > 204) {//ERR
                    Logger.d(TAG, JSON.stringify(response), 'red');
                    reject(response.statusCode);
                }
                else {
                    Logger.d(TAG, `get user friends Response status >${response.statusCode}** `, 'gray');

                    const userFriends: any = typeof body == 'string' ? JSON.parse(body) : body;
                    if (!userFriends) {//if array is empty and document info not found
                        reject(404);
                    }
                    resolve(userFriends);
                }

            });
        });
    }
    //https://developers.facebook.com/docs/graph-api/reference/v2.10/post/
    static createUserPost(accessToken) {
        return new Promise<any>((resolve, reject) => {

            let message = 'im using dating-app';
            let url = `https://graph.facebook.com/v2.10/me/feed?message=${message}&access_token=` + accessToken

            //GET /v2.10/{user-id}/friends
            Logger.d(TAG, `**creating user post>${url}** `, 'gray');

            request.post(url, {
                // headers: headers,
                json: true,

            }, (err, response, body) => {
                if (!response || response.statusCode > 204) {//ERR
                    Logger.d(TAG, JSON.stringify(response), 'red');
                    reject(response.statusCode);
                }
                else {
                    Logger.d(TAG, `get user friends Response status >${response.statusCode}** `, 'gray');

                    const userFriends: any = typeof body == 'string' ? JSON.parse(body) : body;
                    if (!userFriends) {//if array is empty and document info not found
                        reject(404);
                    }
                    resolve(userFriends);
                }

            });
        });
    }
}