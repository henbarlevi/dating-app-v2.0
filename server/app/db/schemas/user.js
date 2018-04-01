"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*User schema*/
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = new Schema({
    facebook: {
        id: { type: String, required: true },
        name: { type: String, required: true },
        gender: { type: String, required: true },
        link: { type: String, required: true },
        access_token: { type: String, required: true },
        token_type: { type: String, required: true },
        expires_in: { type: Number, required: false },
    }
});
schema.index({ "facebook.id": 1 }); //in case of performace issues :https://stackoverflow.com/questions/14342708/mongoose-indexing-in-production-code
/*define indexes:
http://mongoosejs.com/docs/guide.html#indexes
https://docs.mongodb.com/manual/indexes/
https://docs.mongodb.com/manual/core/index-compound/
*/
schema.index({ organizationId: 1, time: 1 });
const User = mongoose.model('User', schema);
exports.User = User;
