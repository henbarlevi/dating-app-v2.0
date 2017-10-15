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
const user_1 = require("../schemas/user");
//=======utils
const Logger_1 = require("../../utils/Logger");
const TAG = 'USER-REPOSITORY';
class UserRepository {
    //create user if not exist /if exist - update his gender,name,link in case they have changed
    updateOrCreateFacebookCreds(user) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let options = { upsert: true, new: true, setDefaultsOnInsert: false }; //options that make create new doc record if it doesnt find one https://stackoverflow.com/questions/33305623/mongoose-create-document-if-not-exists-otherwise-update-return-document-in 
            user_1.User.findOneAndUpdate({ "facebook.id": user.facebook.id }, { $set: { facebook: user.facebook } }, options, (err, userDoc) => {
                if (err) {
                    reject(err);
                }
                else {
                    Logger_1.Logger.d(TAG, `facebook user created/updated`);
                    console.log(userDoc);
                    resolve(userDoc);
                }
            });
        }));
    }
    getUserById(userId) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                let result = yield neo4jDB.query(`
                    MATCH (n:USER{userId:"${userId}"})-[r]-(w:WEBSITE {name:"Facebook"}) RETURN n ,r
                    `);
                if (result.records && result.records['length'] !== 2) {
                    // if everything is good, save to request for use in other routes
                    let userDB = result.records[0]._fields[0].properties;
                    let relationship = result.records[0]._fields[1].properties;
                    if (userDB.userId === userId) {
                        Logger_1.Logger.d(TAG, `user is authenticated, userId > ${userId} `, 'green');
                        let user = {
                            facebook: {
                                id: userDB.userId,
                                name: userDB.name,
                                gender: userDB.gender,
                                link: userDB.link,
                                access_token: relationship.access_token,
                                token_type: relationship.token_type,
                                expires_in: relationship.expires_in.low // { seconds - til - expiration }
                            }
                        };
                        resolve(user);
                    }
                    else {
                        Logger_1.Logger.d(TAG, 'found user by id but userId doesnt fit to query userId - please check the query', 'red');
                        reject();
                    }
                }
                else {
                    reject('that userId doesnt exist in the db');
                }
            }
            catch (e) {
                Logger_1.Logger.d(TAG, 'ERR=====>' + e, 'red');
            }
        }));
    }
    //     MATCH (m:MOVIE {title:"fight club"}) , (brad:ACTOR {name:"Brad Pit"})
    // MERGE (brad)-[ACTED_IN]->(m) 
    //     ON CREATE 
    //     SET r.roles=["Tyler"]
    createFriendshipBetweenUsers(userId1, userId2) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield neo4jDB.query(`
                    MATCH (a:USER{userId:"${userId1}"}),(b:USER{userId:"${userId2}"})
                    MERGE (a)-[:FRIEND]-(b)
                    `);
            }
            catch (e) {
                reject(e);
            }
        }));
    }
}
exports.UserRepository = UserRepository;
