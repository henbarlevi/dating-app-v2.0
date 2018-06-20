"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*User schema*/
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = new Schema({
    oauth_provider: { type: String, required: true },
    oauth_provider_userid: { type: String, required: true },
    access_token: { type: String, required: false },
    refresh_token: { type: String, required: false },
    token_expiration: { type: Date, required: false },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    birth_day: { type: Date, required: true },
    gender: { type: String, required: false },
    location: { type: String, required: false },
    photo_link: { type: String, required: false },
    profile_link: { type: String, required: true }
});
schema.index({ "id": 1 }); //in case of performace issues :https://stackoverflow.com/questions/14342708/mongoose-indexing-in-production-code
//schema.index({"facebook.id":1}) //example for indexing nested property
/*define indexes:
http://mongoosejs.com/docs/guide.html#indexes
https://docs.mongodb.com/manual/indexes/
https://docs.mongodb.com/manual/core/index-compound/
*/
//schema.index({ organizationId: 1, time: 1 });//exmaple - will index by org and then by time in ascending order
const User = mongoose.model('User', schema);
exports.User = User;
