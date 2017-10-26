"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//======imports
const express = require("express");
//config
const config = require("config");
const ENV = process.env.ENV || 'local';
const envConfig = config.get(ENV);
const TAG = 'GameRoutes';
const router = express.Router();
//sanity check
router.get('/', (req, res) => {
    res.send('welcome to server api');
});
/**when user click on 'play game' */
router.get('/play', (req, res) => {
    res.send('welcome to server api');
});
exports.default = router;
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
