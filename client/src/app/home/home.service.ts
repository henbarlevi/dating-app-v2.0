import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import 'rxjs';
import { Observable } from "rxjs";
@Injectable()
export class HomeService {
  baseUrl = 'http://localhost:3000';
  constructor(private http: Http) { }
  errorHandler = error => console.error('Auth Service error', error);

  /*the server will send request to facebook Graph api to get info about the user (his friends etc..)
    and will make actions on behaf of the user - such as craete post that describe the app etc..*/
  AnalyzeUser() :Observable<any> {
    console.log('**sending request to analyze user** token > ' + localStorage.getItem('token'));
    const headers = new Headers({ 'Authorization': localStorage.getItem('token') });
    return this.http.get(`${this.baseUrl}/api/analyze`, { headers: headers })
      .map((response: Response) => response.json())
      .catch(e => {
        this.errorHandler(e);
        return Observable.throw(e.json());
      });
  }
}
