import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan';// use morgan to log requests to the console
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import * as config from 'config';
import * as cors from 'cors';
import appRoutes from './routes/appRoutes';

// ====== utils
import { Logger } from './utils/Logger'
const TAG = 'App';

const ENV: string = process.env.ENV || 'local';
const envConfig: any = config.get(`${ENV}`);
const connectionString: string = envConfig.connectionString || 'mongodb://localhost/mydb';
Logger.d(TAG, '===================== App ENV Configuration =====================', 'yellow');
console.log(envConfig);
Logger.d(TAG, '===================== / App ENV Configuration =====================', 'yellow');


// Creates and configures an ExpressJS web server.
class App {

  // ref to Express instance
  public express: express.Application;

  //Run configuration methods on the Express instance.
  constructor() {
    this.express = express(); //THE APP
    this.middleware();
    this.routes();

  }

  // Configure Express middleware.
  private middleware(): void {
    mongoose.connect(connectionString,
      {
        useMongoClient: true,
        config: {
          autoIndex: false // http://mongoosejs.com/docs/guide.html#indexes - prevent auto creation of indexes to prevent performance hit
        }
      });

 
    this.express.options('*', cors());
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