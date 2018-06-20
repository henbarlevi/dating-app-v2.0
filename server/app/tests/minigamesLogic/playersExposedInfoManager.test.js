"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// ==========
// ===== imports
// ==========
const chai_1 = require("chai");
const rewire = require('rewire'); //use rewire to test private functions
//import { PlayersExposedInfoManager } from '../../game/gameroom/playersExposedInfoManager.service';
describe('playersExposedInfoManager', () => {
    //https://stackoverflow.com/questions/22097603/unit-testing-of-private-functions-with-mocha-and-node-js
    const playersExposedInfoManagerModule = rewire('../../game/gameroom/playersExposedInfoManager.service.js');
    before((done) => {
        done();
    });
    beforeEach((done) => {
        done();
    });
    /**initMiniGame */
    describe('getNotYetExposedProps', () => {
        // Use the special '__get__' accessor to get your private function.
        const getNotYetExposedProps = playersExposedInfoManagerModule.__get__('PlayersExposedInfoManager.getNotYetExposedProps');
        let allPlayerInfo;
        let exposedPlayerInfo;
        before(() => {
        });
        beforeEach((done) => {
            done();
        });
        it('should return [null] when all player info already exposed', () => {
            //init
            allPlayerInfo = { id: "someId", age: "23", location: "batyam" };
            exposedPlayerInfo = { id: "someId", age: "23", location: "batyam" };
            //action
            const notYetExposed = getNotYetExposedProps(allPlayerInfo, exposedPlayerInfo);
            //asset
            chai_1.expect(notYetExposed).to.be.null;
        });
    });
});
