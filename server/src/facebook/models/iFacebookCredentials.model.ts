//facebook Oauth2.0
export interface iFacebookCredentials {
    access_token: string,
    refresh_token : string, //if its the first time authentication for that user to this app
    token_type: string
    expires_in: number // { seconds - til - expiration }
}
