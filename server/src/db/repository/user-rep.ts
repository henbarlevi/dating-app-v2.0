
import { User } from '../schemas/user';
//=======models
import { iUser } from '../../models';
import { iFacebookCredentials, iFacebookUserInfo } from '../../facebook/models';
//=======utils
import { Logger } from '../../utils/Logger';
const TAG = 'USER-REPOSITORY';
export class UserRepository {
    //create user if not exist /if exist - update his gender,name,link in case they have changed
    updateOrCreateFacebookCreds(user: iUser): Promise<any> {
        return new Promise(async (resolve, reject) => {
            let options = { upsert: true, new: true, setDefaultsOnInsert: false }; //options that make create new doc record if it doesnt find one https://stackoverflow.com/questions/33305623/mongoose-create-document-if-not-exists-otherwise-update-return-document-in 
           
            User.findOneAndUpdate({"facebook.id":user.facebook.id}, { $set: { facebook: user.facebook } },options,(err,userDoc)=>{
                if(err){
                    reject(err);
                }
                else{ //user exist - just update it
                    Logger.d(TAG,`facebook user created/updated`);
                    console.log(userDoc);
                    resolve(userDoc)
                }
            })


        })

    }
    getUserById(userId: string): Promise<iUser> {
        return new Promise(async (resolve, reject) => {
            try {

                let result: any = await neo4jDB.query(`
                    MATCH (n:USER{userId:"${userId}"})-[r]-(w:WEBSITE {name:"Facebook"}) RETURN n ,r
                    `);
                if (result.records && result.records['length'] !== 2) {//the node + relationship
                    // if everything is good, save to request for use in other routes
                    let userDB = result.records[0]._fields[0].properties;
                    let relationship = result.records[0]._fields[1].properties;
                    if (userDB.userId === userId) {
                        Logger.d(TAG, `user is authenticated, userId > ${userId} `, 'green');
                        let user: iUser = {
                            facebook: {
                                id: userDB.userId,
                                name: userDB.name,
                                gender: userDB.gender,
                                link: userDB.link,
                                access_token: relationship.access_token,
                                token_type: relationship.token_type,
                                expires_in: relationship.expires_in.low // { seconds - til - expiration }
                            }
                        }
                        resolve(user);
                    } else {
                        Logger.d(TAG, 'found user by id but userId doesnt fit to query userId - please check the query', 'red');
                        reject();
                    }

                } else {
                    reject('that userId doesnt exist in the db')
                }
            }
            catch (e) {
                Logger.d(TAG, 'ERR=====>' + e, 'red');

            }
        });
    }
    //     MATCH (m:MOVIE {title:"fight club"}) , (brad:ACTOR {name:"Brad Pit"})
    // MERGE (brad)-[ACTED_IN]->(m) 
    //     ON CREATE 
    //     SET r.roles=["Tyler"]
    createFriendshipBetweenUsers(userId1: string, userId2) {
        return new Promise(async (resolve, reject) => {
            try {
                await neo4jDB.query(`
                    MATCH (a:USER{userId:"${userId1}"}),(b:USER{userId:"${userId2}"})
                    MERGE (a)-[:FRIEND]-(b)
                    `);

            }
            catch (e) {
                reject(e);
            }
        });
    }
}