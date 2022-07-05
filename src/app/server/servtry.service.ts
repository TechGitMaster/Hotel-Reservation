import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ServtryService {

  constructor(public http: HttpClient) { }

  public getting(): Observable<any>{
    return this.http.get<any>('/jwt');
  }

}
