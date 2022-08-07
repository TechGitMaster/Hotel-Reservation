import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaderResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { register, login } from '../objects';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

@Injectable({
  providedIn: 'root'
})
export class MainServiceService {

  provider: GoogleAuthProvider = new GoogleAuthProvider();

  constructor(private http: HttpClient) { }

  checkingToken(): Observable<any>{
    return this.http.get('/api/checking_token_refresh');
  }


  //Google service________________________________________________
  googleService(){
    const auth = getAuth();
    signInWithPopup(auth, this.provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const user = result.user;
        console.log(user);
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
        console.log(error);
      });
  } 

  //checking email________________________________________________
  checkingEmail(email: string): Observable<any>{
    return this.http.get('/emailCheck', { params: { email: email } });
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
