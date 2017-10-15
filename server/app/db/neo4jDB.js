"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var neo4j = require('neo4j-driver').v1;
const Logger_1 = require("../utils/Logger");
const TAG = 'neo4jDB';
let driver;
let session;
class neo4jDB {
    static createDriver() {
        return new Promise((resolve, reject) => {
            Logger_1.Logger.d(TAG, '**creating driver**', 'yellow');
            // Create a driver instance, for the user neo4j with password neo4j.
            // It should be enough to have a single driver per database per application.
            driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "henbarlevi123"));
            // Register a callback to know if driver creation was successful:
            driver.onCompleted = () => {
                // proceed with using the driver, it was successfully instantiated
                resolve();
            };
            // Register a callback to know if driver creation failed.
            // This could happen due to wrong credentials or database unavailability:
            driver.onError = (error) => {
                console.log('Driver instantiation failed', error);
                reject(error);
            };
        });
    }
    static closeDriver() {
        // Close the driver when application exits.
        // This closes all used network connections.
        driver.close();
    }
    static closeSession() {
        //Always make sure to close sessions when you are done using them!
        session.close();
    }
    static query(query, options) {
        return new Promise((resolve, reject) => {
            // Create a session to run Cypher statements in.
            // Note: Always make sure to close sessions when you are done using them!
            if (!driver) {
                this.createDriver();
            }
            if (!session) {
                Logger_1.Logger.d(TAG, 'creating session', 'gray');
                session = driver.session();
            }
            //------the observable way
            // Run a Cypher statement, reading the result in a streaming manner as records arrive:
            // session
            //     .run('MERGE (alice:Person {name : {nameParam} }) RETURN alice.name AS name', { nameParam: 'Alice' })
            //     .subscribe({
            //         onNext: function (record) {
            //             console.log(record.get('name'));
            //         },
            //         onCompleted: function () {
            //             session.close();
            //         },
            //         onError: function (error) {
            //             console.log(error);
            //         }
            //     });
            // or
            // the Promise way, where the complete result is collected before we act on it:
            session
                .run(query) //'MERGE (james:Person {name : {nameParam} }) RETURN james.name AS name', { nameParam: 'James' }
                .then(result => {
                resolve(result);
                // result.records.forEach(function (record) {
                //     console.log(record.get('name'));
                // });
                session.close();
            })
                .catch((err) => {
                reject(err);
                session.close();
            });
        });
    }
    static setDefaultNodesIfNotExist() {
        return new Promise((resolve, reject) => {
            this.query('MERGE (w:WEBSITE {name:"Facebook"}) RETURN w ')
                .then(facebookNode => resolve(facebookNode))
                .catch(e => {
                reject(e);
            });
        });
    }
}
exports.neo4jDB = neo4jDB;
