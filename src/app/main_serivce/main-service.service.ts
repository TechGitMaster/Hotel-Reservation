import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaderResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { register, login, googleDataUser } from '../objects';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class MainServiceService {


  constructor(private http: HttpClient) { }


  //EventEmitter is more like Observable..._____________________________________
  dataSTR: EventEmitter<string> = new EventEmitter<string>();
  showSuccess: EventEmitter<string> = new EventEmitter<string>();

  emitsNotFound(): void{
    this.dataSTR.emit('notFound');
  }

  emitShowSuccess(): void{
    this.showSuccess.emit('success');
  }

  checkingToken(): Observable<any>{
    return this.http.get('/checking_token_refresh');
  }


  //getting available date__________________________________________
  gettingDate(): Observable<any>{
    return this.http.get('/gettingAvailableDate');
  }

  //getting not avilable time___________________________________________
  gettingTime(date: string): Observable<any>{
    return this.http.post<any>('/getting_not_AvailableTime', { date:date });
  }


  //Google login________________________________________________
  googleService(): Observable<googleDataUser>{
    return new Observable((obs) => {
      const googleDataUser = {
        fullName: '',
        email: '',
        response: 'have-data'
      } as googleDataUser;

      const auth = getAuth();
      const provider = new GoogleAuthProvider();

      signInWithPopup(auth, provider)
      .then((result) => {
      
        const user = result.user;

        googleDataUser.fullName = user.displayName+'';
        googleDataUser.email = user.email+'';

        obs.next(googleDataUser);
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
        googleDataUser.response = "no-data";
        obs.next(googleDataUser);
      });
    });
  } 


  //checking all admin passwords____________________________________
  checkingAdminpassword(adminPassword: string): Observable<any>{
    return this.http.post<any>('/checkingAdminPassword', { adminPassword: adminPassword });
  }

  //checking email________________________________________________
  checkingEmail(email: string): Observable<any>{
    return this.http.get('/emailCheck', { params: { email: email } });
  }

  //login__________________________________________________________
  login(data: login): Observable<any>{
    return this.http.post<any>('/login', { data: data, condition: 'norms-login' });
  }

  //login__________________________________________________________
  gmailLogin(data: login): Observable<any>{
    return this.http.post<any>('/login', { data: data, condition: 'gmail-login' });
  }

  //register__________________________________________________________
  register(data: register, adminNot: string): Observable<any>{
    return this.http.post<any>('/registration', { data: data, fullName: '', adminNot: adminNot, condition: 'norms-register' });
  }
  
  //Gmail register____________________________________________________
  gmailRegister(data: register, fullname: string): Observable<any>{
    return this.http.post<any>('/registration', { data: data, fullName: fullname, adminNot: 'not-admin', condition: 'gmail-register' });
  }


  //SEND OTP_________________________________________________________
  sendOTP(email: string): Observable<any>{
    return this.http.post<any>('/forgotPasswordMail', { to: email });
  }

  //Verifying code___________________________________________________
  verifyCode(email: string, code: string): Observable<any>{
    return this.http.get('/otpCode', { params: { email: email, otp_code: code }});
  }

  //Change Password___________________________________________________
  changePassword(email: string, newPassword: string): Observable<any>{
    return this.http.post<any>('/changePassword', { email: email, newPassword: newPassword });
  }
  
  //Send appointment__________________________________________________________
  sendAppointment(formGroup: FormGroup, dateArrival: string, timeDate: string, appointmentNot: string): Observable<any>{
    return this.http.get('/inboxSaving_user', { params: {
      fullname: formGroup.value.fullname, 
      reserved_email: formGroup.value.email,
      numGuest: formGroup.value.numberguest,
      contact_num: formGroup.value.contactnumber,
      message: formGroup.value.letusknown,
      dateArrival: dateArrival,
      timeDate: timeDate,
      appointmentNot: appointmentNot
    } });
  }

  //___________________________________________________________________________________________________________________________________________


  //ROOM_________________________________________________________________________________________________________________________________________
  getAllRoom(): Observable<any>{
    return this.http.get<any>('/getRoomAll');
  }


}

