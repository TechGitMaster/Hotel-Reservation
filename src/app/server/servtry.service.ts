import { Injectable } from '@angular/core';
import { Observable, Subscription, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ServtryService {

  constructor(public http: HttpClient) { }

  Cerror(error: HttpErrorResponse): any{
    return throwError(() => error);
  }

  public getting(): Observable<any>{
    return this.http.get<any>('/jwt').pipe( catchError(this.Cerror) );
  }

}
