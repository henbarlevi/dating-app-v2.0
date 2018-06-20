
import { User, iDBUser } from '../schemas/user';
//=======models
//import { iUser } from '../../models';
import { iFacebookCredentials, iFacebookUserInfo } from '../../facebook/models';
//=======utils
import { Logger } from '../../utils/Logger';
const TAG = 'USER-REPOSITORY';
export class UserRepository {
    //create user if not exist /if exist - update his gender,name,link in case they have changed
    updateOrCreateFacebookCreds(user: iDBUser): Promise<any> {
        return new Promise((resolve, reject) => {
            console.log(user);
            Logger.d(TAG, '**updating/creating facebook user')
            let options = { upsert: true, new: true, setDefaultsOnInsert: false }; //options that make create new doc record if it doesnt find one https://stackoverflow.com/questions/33305623/mongoose-create-document-if-not-exists-otherwise-update-return-document-in 

            let $set = {};
            for (let key of Object.keys(user)) {
                $set[key] = user[key];
            }
            User.findOneAndUpdate({
                //find by:
                oauth_provider_userid: user.oauth_provider_userid,
                oauth_provider: user.oauth_provider
                //and update:
            }, { $set: $set }, options, (err, userDoc) => {
                if (err) {
                    reject(err);
                }
                else { //user exist - just update it
                    Logger.d(TAG, `facebook user created/updated`);
                    console.log(userDoc);
                    resolve(userDoc);
                }
            })


        })

    }
    getUserById(userId: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            User.findById(userId, (err, userDoc) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(userDoc);
                }
            })
        });
    }

    // createFriendshipBetweenUsers(userId1: string, userId2) {
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             await neo4jDB.query(`
    //                 MATCH (a:USER{userId:"${userId1}"}),(b:USER{userId:"${userId2}"})
    //                 MERGE (a)-[:FRIEND]-(b)
    //                 `);

    //         }
    //         catch (e) {
    //             reject(e);
    //         }
    //     });
    // }
}