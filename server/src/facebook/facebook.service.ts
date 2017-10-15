//========imports
import * as config from 'config';
import * as request from 'request';
import { Logger } from '../utils/Logger';
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
        let permissions = ['user_likes', 'user_posts', 'user_friends','publish_actions','email'];

        let url = `https://www.facebook.com/v2.10/dialog/oauth?client_id=570641329993499&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Flogin`
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
    static getUserInfo(accessToken) {
        //https://graph.facebook.com/me?access_token=...
        return new Promise<iFacebookUserInfo>((resolve, reject) => {

            let url = `https://graph.facebook.com/me?access_token=` + accessToken + '&fields=id,email,name,gender,link,picture&type=large'


            Logger.d(TAG, `****getting user info facebook Info (name,gender etc..)**** `, 'gray');

            request.get(url, {
                // headers: headers,
                json: true,

            }, (err, response, body) => {
                if (!response || response.statusCode > 204) {//ERR
                    Logger.d(TAG, JSON.stringify(response), 'red');
                    reject(response.statusCode);
                }
                else {
                    const userCredentials: iFacebookUserInfo = typeof body == 'string' ? JSON.parse(body) : body;
                    if (!userCredentials) {//if array is empty and document info not found
                        reject(404);
                    }
                    resolve(userCredentials);
                }

            });
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