import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Response } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { HttpService } from '@services/http.service';

@Injectable()
export class HttpLogsService {

  private baseUrl: string;

  constructor(private http: HttpService) {
    this.baseUrl = `/jobs`
  }

  public get(jobId: string): Observable<string[]> {
    const apiUrl = this.baseUrl + `/${jobId}/logs`;
    return this.http.get(apiUrl).map((res: Response) => {
      return res['_body'].split('\n');
    }).catch(this.handleError);
  }

  private handleError(error: Response | any): Observable<any> {
    let errMsg: string;
    switch (error.status) {
      case 404:
        errMsg = error._body;
        break;
      default:
        errMsg = error.message ? error.message : error.toString();
        break;
    }
    return Observable.throw(errMsg);
  }

}
