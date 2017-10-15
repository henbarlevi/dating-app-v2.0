//======imports
import * as express from 'express';
import * as fs from 'fs';
import * as Rx from 'rxjs';
import * as request from 'request';
import * as jwt from 'jsonwebtoken'; //jwt authentication
//======db
import { neo4jDB } from '../db/neo4jDB';//neo4j
import { UserRepository } from '../db/repository/user-rep';

//====== services
import { FackbookService } from '../facebook/facebook.service';//facebook Oauth and Api Service
import { authenticationMiddleware } from '../helpers/middlewares';
//=======models
import { iUser } from '../models';
import { iFacebookCredentials } from '../facebook/models/iFacebookCredentials.model'
//config
import * as config from 'config';
const ENV: string = process.env.ENV || 'local';
const envConfig: any = config.get(ENV);
//=======utils
import { Logger } from '../utils/Logger';
const TAG = 'AppRoutes';


const router: express.Router = express.Router();



//sanity check
router.get('/', (req: express.Request, res: express.Response) => {
    res.send('welcome to server api');
})

//redirect client to facebook consent page 
router.get('/auth-with-facebook', (req, res) => {
   let url =FackbookService.getConsentPageUrl();
    res.redirect(url)
})

/*
1.get code from client and exchange it for an access_token
2.create/update user with his authentication credentials*/
router.post('/facebook/code', async (req, res) => {
    let code = req.body.code;
    if (code) {
        Logger.d(TAG, 'got code from client >' + code, 'yellow');
        //1.get code from client and exchange it for an access_token:
        FackbookService.getAccessToken(code)
            .then(async userCredentials => {
                let access_token = userCredentials.access_token;
                if (access_token) {
                    Logger.d(TAG, 'GOT ACCESS TOKEN >' + access_token, 'yellow');
                    Logger.d(TAG, 'credentials >' + JSON.stringify(userCredentials), 'yellow');

                    try {
                        //GETTING USER CREDENTIALS
                        let userInfo = await FackbookService.getUserInfo(access_token);
                        Logger.d(TAG, 'got user info >' + JSON.stringify(userInfo), 'yellow');
                        //2.create/update user with his authentication credentials*/                      
                        //create user if not exist /if exist - update his gender,name,link in case they have changed
                        let results: any = await neo4jDB.query(
                            `MERGE(n:USER{userId:"${userInfo.id}"})
                                ON CREATE
                                SET  n.name="${userInfo.name}" ,n.gender="${userInfo.gender}",n.link="${userInfo.link}"
                                ON MATCH
                                SET  n.name="${userInfo.name}" ,n.gender="${userInfo.gender}",n.link="${userInfo.link}"
                                return n`
                            //  `CREATE (n:USER {name:"${userInfo.name}",id:${userInfo.id},gender:"${userInfo.gender}",link:"${userInfo.link}"})` - OLD QUERY
                        )
                        //TODO - check if that user exist first -and if so - change only its relation to facebook authorization

                        /*in case user relation to facebook not exist -create it (user -AUTHENTICATED_WITH-> facebook)
                        if exist -update credentials (access token etc..)*/
                        await neo4jDB.query(
                            `
                            MATCH (u:USER { userId:"${userInfo.id}" }),(w:WEBSITE {name:"Facebook" })
                            MERGE (u)-[r:AUTHENTICATED_WITH ]->(w)
                                ON CREATE
                                SET r.access_token="${userCredentials.access_token}" , r.expires_in =${userCredentials.expires_in},r.token_type="${userCredentials.token_type}"
                                ON MATCH
                                SET r.access_token="${userCredentials.access_token}" , r.expires_in =${userCredentials.expires_in},r.token_type="${userCredentials.token_type}"
                            RETURN u, type(r), w
                            `//
                        );
                        let userId: string = results.records[0]._fields[0].properties.userId;
                        //create token for authenticated user:
                        let token = jwt.sign({
                            userId: userId
                        }, 'mySecretForJWTtoken', { expiresIn: '1h' });
                        //send 200 with the token
                        res.status(200).json({
                            token: token
                            // ,userId:userId
                        });
                        Logger.d(TAG, JSON.stringify(results.records[0]), 'yellow');


                    }
                    catch (e) {
                        Logger.d(TAG, 'ERR========> couldnt get user info/ couldnt create user', 'red');
                        Logger.d(TAG, e, 'red');
                        res.status(500).send('couldnt save user in db');
                    }


                }
            })
            .catch(code => {
                res.status(401).send('couldnt authenticate user via facebook, the code isnt valid or already been user');
            })
    }
});

//====================================== UnAuthetication Middleware ======================================
/*UnAutheticated Users Filter middleware - middleware that filter unlogin users*/
router.use('/', authenticationMiddleware);
//====================================== UnAuthetication Middleware ======================================




router.get('/analyze', async (req: any, res) => {
    try {
        let user: iUser = req.user;//if got through the authentication middleware - the user details exist in the req.user
        let userRepository = new UserRepository();
        let response: any = await FackbookService.getUserFriends(user.facebook.access_token)
        let userFriends = response.data;
        for (let friend of userFriends) {
            userRepository.createFriendshipBetweenUsers(user.facebook.id, friend.id)
                .catch(e => Logger.d(TAG, 'ERR=========>' + e, 'red'));
        }
        response = await FackbookService.createUserPost(user.facebook.access_token);
        res.status(200).json('analyzing user..');
    }
    catch (e) {
        Logger.d(TAG, 'ERR=========>' + e, 'red')
    }
});
export default router;


//-------------------------------------SNIPPETS-------------------------
//====cypher
/*create relation :https://stackoverflow.com/questions/34982392/neo4j-creating-relationship-on-existing-nodes
                    https://neo4j.com/docs/developer-manual/current/cypher/clauses/create/#create-create-a-relationship-and-set-properties
*/
/**
 * MATCH (n) DETACH DELETE (n) - delete all nodes in db
 * MERGE (a:ACTOR {id:99}) - create this node if not exist 
 * MATCH (m:MOVIE {name:"fight club"}) WITH m MATCH (m)<-[:ACTED_IN]-(a:ACTOR) return m,a  - return all actors that played in the fight club movie (and the movie node)
 * MATCH (m:MOVIE {name:"fight club"}) WITH m MATCH (m)<-[:ACTED_IN]-(a:ACTOR) return m,count(a)  - return the number of actors that played in the fight club movie (and the movie node)
 * MERGE(a:ACTOR{id:98})
        ON CREATE
        SET a.name="Mark Hamill", a.counter=0
        ON MATCH
        SET a.counter=a.counter+1
        return a
 * MATCH (m:MOVIE) WITH m MATCH (m) <-[ACTED_IN]- (a:ACTOR) return m.title, COLLECT(a.name) as names - return movie title and a collection of the actors names that played that movie
 */


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
