import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponseBase } from '@angular/common/http';
import 'rxjs';
import { Observable } from "rxjs/Observable";
import { environment } from '../../environments/environment';
const TAG:string = 'AuthService |';
@Injectable()
export class AuthService {
  baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) {
    console.log(TAG,environment);
  }
  errorHandler = error => console.error('Auth Service error', error);
  loginWithFacebook() {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this.http.get(`${this.baseUrl}/api/auth-with-facebook`, { responseType: 'text' }).toPromise().then((res) => {
      console.log(res);
      window.location.href = res;
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
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    // const queryParams = new HttpParams().set('code', code);
    return this.http.post(`${this.baseUrl}/api/facebook/code`, json, {
      headers: headers,
      //params: queryParams
    })
      .catch(e => {
        this.errorHandler(e);
        return Observable.throw(e);
      });
  }
  logout() {
    localStorage.clear();
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('token') !== null;
  }
}
