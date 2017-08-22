import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/repeatWhen';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/operator/expand';
import 'rxjs/add/operator/timeoutWith';

@Injectable()
export class HttpService {
  headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }); // application/x-www-form-urlencoded
  maxTime = 60000;
  constructor(private http: Http) {}

  // 获取get请求
  get(url) {
    return this.http.get(url, {headers: this.headers})
      .timeoutWith(this.maxTime, Observable.throw('Request time out!'))
      .map(this.extractData)
      .catch(this.handleError);
  }

  // 获取post请求
  post(url, params) {
    return this.http.post(url, params, {headers: this.headers})
      .timeoutWith(this.maxTime, Observable.throw('Request time out!'))
      .map(this.extractData)
      .catch(this.handleError);
  }

  private extractData(res: Response) {
    const body = res.json();
    return body || { };
  }

  private handleError (error: Response | any) {
    let errMsg: string;
    if (error.ok && error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    return Observable.throw(errMsg);
  }
}
