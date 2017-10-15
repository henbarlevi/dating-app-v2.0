import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan';// use morgan to log requests to the console
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import * as config from 'config';
import * as cors from 'cors';
import appRoutes from './routes/appRoutes';
import { Logger } from './utils/Logger'
const TAG = 'App';

const ENV: string = process.env.ENV || 'local';
const envConfig: any = config.get(`${ENV}`);
const connectionString: string = envConfig.connectionString || 'mongodb://localhost/mydb';

//neo4j instance 
import { neo4jDB } from './db/neo4jDB';
// let neo4j = new neo4jDB();
// Creates and configures an ExpressJS web server.
class App {

  // ref to Express instance
  public express: express.Application;

  //Run configuration methods on the Express instance.
  constructor() {
    this.express = express(); //THE APP

    neo4jDB.createDriver()
      .then(() => { Logger.d(TAG, 'neo4j connected', 'green'); })//connect to neo4j db
      .catch((err) => {
        Logger.d(TAG, 'FAILED TO CONNECT TO NEO4j DB', 'red');
        Logger.d(TAG, err, 'red');
      });
    neo4jDB.setDefaultNodesIfNotExist()
      .then(() => { Logger.d(TAG, 'facebook node exist/created', 'green'); })//connect to neo4j db  
      .catch(err => {
        Logger.d(TAG, 'FAILED TO CREATE Facebook default Node', 'red');
        Logger.d(TAG, err, 'red');
      })
    // neo4jDB.query('CREATE (n:USER {name:"userName"}) RETURN n ')
    //   .then(result => console.log(result))
    //   .catch(err => console.log(err));
    this.middleware();
    this.routes();

  }

  // Configure Express middleware.
  private middleware(): void {
    mongoose.connect(connectionString);


    // this.express.use(cors());
    this.express.use(express.static(path.join(__dirname, 'public/dist')));
    this.express.use(logger('dev'));// use morgan to log requests to the console
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));

  }

  // Configure API endpoints.
  private routes(): void {
    /* This is just to get up and running, and to make sure what we've got is
     * working so far. This function will change when we start to add more
     * API endpoints */
    this.express.use('/api', appRoutes);
    //Handle 404 not found - give app
    this.express.use('/', (req: express.Request, res: express.Response) => {
      return res.sendfile(path.join(__dirname, 'public/dist/index.html'));
    })
  }



}

export default new App().express; //export instance of new app