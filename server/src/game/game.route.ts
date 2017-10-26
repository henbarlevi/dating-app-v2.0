//======imports
import * as express from 'express';
import * as fs from 'fs';
import * as Rx from 'rxjs';
import * as request from 'request';
import * as jwt from 'jsonwebtoken'; //jwt authentication
import * as io from 'socekt.io';//
//======db
import { UserRepository } from '../db/repository/user-rep';

//====== services
//=======models
import { iUser } from '../models';
import { iFacebookCredentials } from '../facebook/models/iFacebookCredentials.model'
import { iFacebookUserInfo } from '../facebook/models/index';
//config
import * as config from 'config';
const ENV: string = process.env.ENV || 'local';
const envConfig: any = config.get(ENV);
//=======utils
import { Logger } from '../utils/Logger';
const TAG:string = 'GameRoutes';


const router: express.Router = express.Router();



//sanity check
router.get('/', (req: express.Request, res: express.Response) => {
    res.send('welcome to server api');
})

/**when user click on 'play game' */
router.get('/play', (req: express.Request, res: express.Response) => {
    res.send('welcome to server api');
})

export default router;


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
