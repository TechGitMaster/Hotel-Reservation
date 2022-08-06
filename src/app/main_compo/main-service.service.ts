import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaderResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { register, login } from '../objects';

@Injectable({
  providedIn: 'root'
})
export class MainServiceService {

  constructor(private http: HttpClient) { }

  checkingToken(): Observable<any>{
    return this.http.get('/checking_token_refresh');
  }

  //checking username________________________________________________
  checkingEmail(username: string): Observable<any>{
    return this.http.get('/usernameCheck', { params: { username: username } });
  }

  //login__________________________________________________________
  login(data: login): Observable<any>{
    return this.http.post<any>('/login', { data: data });
  }

  //register__________________________________________________________
  register(data: register): Observable<any>{
    return this.http.post<any>('/registration', { data: data });
  }

}
