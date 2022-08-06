import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaderResponse, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MainServiceService {

  constructor(private http: HttpClient) { }

  catchErrs(err: any): Observable<any>{
    return of(err);
  }

  sample(): Observable<any>{
    var headers = new HttpHeaders({
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFzZCIsImlhdCI6MTY1OTc2NzMyNSwiZXhwIjoxNjU5NzY5MTI1fQ.SzIRPvtjTyPwRTihO4YVp2YjwGkEUwNN_xnT7kEtRy8'
    });

    var params = new HttpParams();
    params.append('hello', 'hiii');

    return this.http.get('/checking_token_refresh/hello', {headers: headers, params: params });
  }
}
