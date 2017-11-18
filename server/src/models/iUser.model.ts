import { MongooseDocument } from "mongoose";

export interface iUser extends MongooseDocument {
    facebook?: {
        id: string,
        name: string,
        gender: string,
        link: string
        access_token: string,
        token_type: string,
        expires_in: number // { seconds - til - expiration }
    }

}