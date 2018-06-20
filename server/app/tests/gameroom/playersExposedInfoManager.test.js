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
    /**getNotYetExposedProps */
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
        it('should return string[] containing all the not yet exposed props', () => {
            //init
            allPlayerInfo = { id: "someId", age: "23", location: "batyam" };
            exposedPlayerInfo = { id: "someId", age: "23" };
            const propsNumber = Object.keys(allPlayerInfo).length;
            const exposedPropsNumber = Object.keys(exposedPlayerInfo).length;
            //action
            const notYetExposedProps = getNotYetExposedProps(allPlayerInfo, exposedPlayerInfo);
            //asset
            chai_1.expect(notYetExposedProps).to.be.not.null;
            chai_1.expect(notYetExposedProps.length).to.eq(propsNumber - exposedPropsNumber);
        });
    });
    /**chooseWhoToExpose */
    describe('chooseWhoToExpose', () => {
        // Use the special '__get__' accessor to get your private function.
        const chooseWhoToExpose = playersExposedInfoManagerModule.__get__('PlayersExposedInfoManager.chooseWhoToExpose');
        let currentPlayersInfoExposer;
        before(() => {
        });
        beforeEach((done) => {
            done();
        });
        it('should return the player with the least exposed info', () => {
            //init
            const leastExposed = { id: "leastExposed" };
            currentPlayersInfoExposer = [
                leastExposed,
                { id: "p2", age: "23" },
                { id: "p2", age: "23", location: "yemen" }
            ];
            //action
            const leastExposedFound = chooseWhoToExpose(currentPlayersInfoExposer);
            //asset
            chai_1.expect(leastExposedFound).to.eq(leastExposed);
        });
        it('should throw error if input not specified/null', () => {
            //init
            //action
            //asset
            /*If you need to assert that your function fn throws when passed certain
            arguments, then wrap a call to fn inside of another function.
                 @link http://www.chaijs.com/api/bdd/
            */
            chai_1.expect(() => chooseWhoToExpose(null)).to.throw();
        });
    });
});
