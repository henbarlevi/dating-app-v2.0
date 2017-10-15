import { neo4jDB } from '../neo4jDB';
//=======models
import { iUser } from '../../models';
import { iFacebookCredentials, iFacebookUserInfo } from '../../facebook/models';
//=======utils
import { Logger } from '../../utils/Logger';
const TAG = 'USER-REPOSITORY';
export class UserRepository {
    updateOrCreate(user: iUser): Promise<string> {
        return new Promise(async (resolve, reject) => {
            //create user if not exist /if exist - update his gender,name,link in case they have changed
            try {
                let results: any = await neo4jDB.query(
                    `MERGE(n:USER{userId:"${user.facebook.id}"})
                                ON CREATE
                                SET  n.name="${user.facebook.name}" ,n.gender="${user.facebook.gender}",n.link="${user.facebook.link}"
                                ON MATCH
                                SET  n.name="${user.facebook.name}" ,n.gender="${user.facebook.gender}",n.link="${user.facebook.link}"
                                return n`
                    //  `CREATE (n:USER {name:"${userInfo.name}",id:${userInfo.id},gender:"${userInfo.gender}",link:"${userInfo.link}"})` - OLD QUERY
                )

                /*in case user relation to facebook not exist -create it (user -AUTHENTICATED_WITH-> facebook)
                if exist -update credentials (access token etc..)*/
                await neo4jDB.query(
                    `
                            MATCH (u:USER { userId:"${user.facebook.id}" }),(w:WEBSITE {name:"Facebook" })
                            MERGE (u)-[r:AUTHENTICATED_WITH ]->(w)
                                ON CREATE
                                SET r.access_token="${user.facebook.access_token}" , r.expires_in =${user.facebook.expires_in},r.token_type="${user.facebook.token_type}"
                                ON MATCH
                                SET r.access_token="${user.facebook.access_token}" , r.expires_in =${user.facebook.expires_in},r.token_type="${user.facebook.token_type}"
                            RETURN u, type(r), w
                            `//
                );
                let userId: string = results.records[0]._fields[0].properties.userId; // = facebook userId NOT db user id
                resolve(userId);
            } catch (e) {
                Logger.d(TAG, 'ERR=====>' + e, 'red');
                reject(e);
            }

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