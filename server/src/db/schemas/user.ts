/*User schema*/
import * as mongoose from 'mongoose';
import { iPartner } from '../../game/models/iPartner.model';
const Schema = mongoose.Schema;

const schema = new Schema({
    oauth_provider: { type: String, required: true },//how the user signedup? thorugh facebook/instegram?
    oauth_provider_userid: { type: String, required: true },
    access_token: { type: String, required: false },
    refresh_token: { type: String, required: false },//
    token_expiration: { type: Date, required: false },// expires_in: {type:Number, required:false}, // { seconds - til - expiration }
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    birth_day: { type: Date, required: true },
    gender: { type: String, required: false },
    location: { type: String, required: false },//user location (current location Or general location)
    photo_link: { type: String, required: false },
    profile_link: { type: String, required: true }
});

schema.index({ "id": 1 }) //in case of performace issues :https://stackoverflow.com/questions/14342708/mongoose-indexing-in-production-code
//schema.index({"facebook.id":1}) //example for indexing nested property
/*define indexes: 
http://mongoosejs.com/docs/guide.html#indexes
https://docs.mongodb.com/manual/indexes/
https://docs.mongodb.com/manual/core/index-compound/
*/
//schema.index({ organizationId: 1, time: 1 });//exmaple - will index by org and then by time in ascending order
const User = mongoose.model('User', schema);

export { User };



export interface iDBUser extends mongoose.MongooseDocument  {
    
    oauth_provider: string,//'facebook'/'google'/'instegram
    oauth_provider_userid:string,
    access_token?: string,
    refresh_token?: string,
    token_expiration: Date, //Date of the expierd data 
    first_name?: string,
    last_name:string,
    birth_day: Date,
    gender?:string,
    location?: string,
    photo_link?:string,//link to some photo of him
    profile_link?: string //link to his personal social page (facebook/instegram) 


    
}