import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import 'rxjs';
import { Observable } from "rxjs";
@Injectable()
export class AuthService {
  baseUrl = 'http://localhost:3000';
  constructor(private http: Http) { }
  errorHandler = error => console.error('Auth Service error', error);
  loginWithFacebook() {
  return  this.http.get(`${this.baseUrl}/api/auth-with-facebook`).toPromise().then(res => {
      console.log(res)
    })
      .catch(this.errorHandler);
  }
  /*after user authenticated through the consent page its get a code parameter
 and get redirect to the app login page with the code param
 now the client send the code param to the server so that the server
 will trade that code with an access token */
  sendFacebookCode(code: string) {
    console.log('**sending facebook code to server**');
    const json = JSON.stringify({ code: code })
    const headers = new Headers({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.baseUrl}/api/facebook/code`, json, { headers: headers })
      .map((response: Response) =>  response.json() )
      .catch(e => {
        this.errorHandler(e);
        return Observable.throw(e.json());
      });
  }
  logout() {
    localStorage.clear();
  }

  isLoggedIn() {
    return localStorage.getItem('token') !== null;
  }
}
