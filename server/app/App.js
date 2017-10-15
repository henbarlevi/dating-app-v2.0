"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const express = require("express");
const logger = require("morgan"); // use morgan to log requests to the console
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const config = require("config");
const appRoutes_1 = require("./routes/appRoutes");
const Logger_1 = require("./utils/Logger");
const TAG = 'App';
const ENV = process.env.ENV || 'local';
const envConfig = config.get(`${ENV}`);
const connectionString = envConfig.connectionString || 'mongodb://localhost/mydb';
//neo4j instance 
const neo4jDB_1 = require("./db/neo4jDB");
// let neo4j = new neo4jDB();
// Creates and configures an ExpressJS web server.
class App {
    //Run configuration methods on the Express instance.
    constructor() {
        this.express = express(); //THE APP
        neo4jDB_1.neo4jDB.createDriver()
            .then(() => { Logger_1.Logger.d(TAG, 'neo4j connected', 'green'); }) //connect to neo4j db
            .catch((err) => {
            Logger_1.Logger.d(TAG, 'FAILED TO CONNECT TO NEO4j DB', 'red');
            Logger_1.Logger.d(TAG, err, 'red');
        });
        neo4jDB_1.neo4jDB.setDefaultNodesIfNotExist()
            .then(() => { Logger_1.Logger.d(TAG, 'facebook node exist/created', 'green'); }) //connect to neo4j db  
            .catch(err => {
            Logger_1.Logger.d(TAG, 'FAILED TO CREATE Facebook default Node', 'red');
            Logger_1.Logger.d(TAG, err, 'red');
        });
        // neo4jDB.query('CREATE (n:USER {name:"userName"}) RETURN n ')
        //   .then(result => console.log(result))
        //   .catch(err => console.log(err));
        this.middleware();
        this.routes();
    }
    // Configure Express middleware.
    middleware() {
        mongoose.connect(connectionString);
        // this.express.use(cors());
        this.express.use(express.static(path.join(__dirname, 'public/dist')));
        this.express.use(logger('dev')); // use morgan to log requests to the console
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
    }
    // Configure API endpoints.
    routes() {
        /* This is just to get up and running, and to make sure what we've got is
         * working so far. This function will change when we start to add more
         * API endpoints */
        this.express.use('/api', appRoutes_1.default);
        //Handle 404 not found - give app
        this.express.use('/', (req, res) => {
            return res.sendfile(path.join(__dirname, 'public/dist/index.html'));
        });
    }
}
exports.default = new App().express; //export instance of new app
