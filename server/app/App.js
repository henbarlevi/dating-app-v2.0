"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const express = require("express");
const logger = require("morgan"); // use morgan to log requests to the console
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const config = require("config");
const appRoutes_1 = require("./routes/appRoutes");
// ====== utils
const Logger_1 = require("./utils/Logger");
const TAG = 'App';
const ENV = process.env.ENV || 'local';
const envConfig = config.get(`${ENV}`);
const connectionString = envConfig.connectionString || 'mongodb://localhost/mydb';
Logger_1.Logger.d(TAG, '===================== App ENV Configuration =====================', 'yellow');
console.log(envConfig);
Logger_1.Logger.d(TAG, '===================== / App ENV Configuration =====================', 'yellow');
// Creates and configures an ExpressJS web server.
class App {
    //Run configuration methods on the Express instance.
    constructor() {
        this.express = express(); //THE APP
        this.middleware();
        this.routes();
    }
    // Configure Express middleware.
    middleware() {
        mongoose.connect(connectionString, {
            useMongoClient: true,
            config: {
                autoIndex: false // http://mongoosejs.com/docs/guide.html#indexes - prevent auto creation of indexes to prevent performance hit
            }
        });
        //Allow Cross Origin requests (https://enable-cors.org/server_expressjs.html): 
        this.express.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            if (req.method === 'OPTIONS') {
                res.end();
            }
            next();
        });
        // this.express.options('*', cors()); // suppose to do the same above but not working
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
        this.express.options('/', (req, res) => res.send()); //if its a pre-flight request - just return ok (https://stackoverflow.com/questions/29954037/why-is-an-options-request-sent-and-can-i-disable-it)
        this.express.use('/api', appRoutes_1.default);
        //Handle 404 not found - give app
        this.express.use('/', (req, res) => {
            return res.sendfile(path.join(__dirname, 'public/dist/index.html'));
        });
    }
}
exports.default = new App().express; //export instance of new app
