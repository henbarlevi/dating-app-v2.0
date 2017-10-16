"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("../schemas/user");
//=======utils
const Logger_1 = require("../../utils/Logger");
const TAG = 'USER-REPOSITORY';
class UserRepository {
    //create user if not exist /if exist - update his gender,name,link in case they have changed
    updateOrCreateFacebookCreds(user) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let options = { upsert: true, new: true, setDefaultsOnInsert: false }; //options that make create new doc record if it doesnt find one https://stackoverflow.com/questions/33305623/mongoose-create-document-if-not-exists-otherwise-update-return-document-in 
            user_1.User.findOneAndUpdate({ "facebook.id": user.facebook.id }, { $set: { facebook: user.facebook } }, options, (err, userDoc) => {
                if (err) {
                    reject(err);
                }
                else {
                    Logger_1.Logger.d(TAG, `facebook user created/updated`);
                    console.log(userDoc);
                    resolve(userDoc);
                }
            });
        }));
    }
    getUserById(userId) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            user_1.User.findById(userId, (err, userDoc) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(userDoc);
                }
            });
        }));
    }
}
exports.UserRepository = UserRepository;
