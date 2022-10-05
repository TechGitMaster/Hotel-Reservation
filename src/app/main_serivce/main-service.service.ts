import { HostListener, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaderResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { register, login, googleDataUser } from '../objects';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class MainServiceService {
  @HostListener('window:beforeunload')
  doSomething() {
    this.socket.close();
  }

  socket!: any;
  constructor(private http: HttpClient) {
    this.socket = io('ws://localhost:8080');

    this.listen();
   }

   listen(): Observable<any>{
    return new Observable((obs) => {
      this.socket.on('user', (data: any) => {
        obs.next(data);
      });
    });
  }


  //EventEmitter is more like Observable..._____________________________________
  dataSTR: EventEmitter<string> = new EventEmitter<string>();
  notexpired_Payment = new EventEmitter<boolean>();
  showSuccess: EventEmitter<string> = new EventEmitter<string>();
  menubarComponent: EventEmitter<string> = new EventEmitter<string>();


  emitsNotFound(): void{
    this.dataSTR.emit('notFound');
  }

  emitShowSuccess(): void{
    this.showSuccess.emit('success');
  }

  emitComponent(component: string): void{
    this.menubarComponent.emit(component);
  }

  emit_PaymentExpired(condition: boolean): void{
    this.notexpired_Payment.emit(condition);
  }

  checkingToken(): Observable<any>{
    return this.http.get('/api/checking_token_refresh');
  }


  //getting available date__________________________________________
  gettingDate(): Observable<any>{
    return this.http.get('/api/gettingAvailableDate');
  }

  //getting not avilable time___________________________________________
  gettingTime(date: string): Observable<any>{
    return this.http.post<any>('/api/getting_not_AvailableTime', { date:date });
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
    return this.http.post<any>('/api/checkingAdminPassword', { adminPassword: adminPassword });
  }

  //checking email________________________________________________
  checkingEmail(email: string): Observable<any>{
    return this.http.get('/api/emailCheck', { params: { email: email } });
  }

  //login__________________________________________________________
  login(data: login): Observable<any>{
    return this.http.post<any>('/api/login', { data: data, condition: 'norms-login' });
  }

  //login__________________________________________________________
  gmailLogin(data: login): Observable<any>{
    return this.http.post<any>('/api/login', { data: data, condition: 'gmail-login' });
  }

  //register__________________________________________________________
  register(data: register, adminNot: string): Observable<any>{
    return this.http.post<any>('/api/registration', { data: data, fullName: '', adminNot: adminNot, condition: 'norms-register' });
  }
  
  //Gmail register____________________________________________________
  gmailRegister(data: register, fullname: string): Observable<any>{
    return this.http.post<any>('/api/registration', { data: data, fullName: fullname, adminNot: 'not-admin', condition: 'gmail-register' });
  }


  //SEND OTP_________________________________________________________
  sendOTP(email: string): Observable<any>{
    return this.http.post<any>('/api/forgotPasswordMail', { to: email });
  }

  //Verifying code___________________________________________________
  verifyCode(email: string, code: string): Observable<any>{
    return this.http.get('/api/otpCode', { params: { email: email, otp_code: code }});
  }

  //Change Password___________________________________________________
  changePassword(email: string, newPassword: string): Observable<any>{
    return this.http.post<any>('/api/changePassword', { email: email, newPassword: newPassword });
  }
  
  //Send appointment__________________________________________________________
  sendAppointment(formGroup: FormGroup, dateArrival: string, timeDate: string, appointmentNot: string, guest_member: string, transaction_ID: string): Observable<any>{
    return this.http.get('/api/inboxSaving_user', { params: {
      fullname: formGroup.value.fullname, 
      reserved_email: formGroup.value.email,
      numGuest: formGroup.value.numberguest,
      contact_num: formGroup.value.contactnumber,
      message: formGroup.value.letusknown,
      dateArrival: dateArrival,
      timeDate: timeDate,
      appointmentNot: appointmentNot,
      guest_member: guest_member,
      transaction_ID: transaction_ID
    } });
  }

  //___________________________________________________________________________________________________________________________________________


  //ROOM_________________________________________________________________________________________________________________________________________
  getAllRoom(): Observable<any>{
    return this.http.get<any>('/api/getRoomAll');
  }

  //________________________________________________________________________________________________________________________________________________






  //ACCOUNT_______________________________________________________________________________________________________________________________________
  emitSending: EventEmitter<any> = new EventEmitter<any>();
  emitBack: EventEmitter<any> = new EventEmitter<any>();

  emitCall(arr: Array<any>): void{
    this.emitSending.emit(arr);
  }

  emitCallBack(arr: Array<any>): void{
    this.emitBack.emit(arr);
  }


  //DETAILS_____________________________________________________________________________________________________________
  getInformation(): Observable<any>{
    return this.http.post<any>('/api/getInformation', { adminNot: 'not-admin' });
  }

  checkingPassword(currPass: string): Observable<any>{
    return this.http.post<any>('/api/checkingPassword', { currPassword: currPass, adminNot: 'not-admin' });
  }

  changePasswords(email: string, newPass: string): Observable<any>{
    return this.http.post<any>('/api/changePassword', { email: email, newPassword: newPass });
  }


  //________________________________________________________________________________________________________________

  //NOTIFICATION______________________________________________________________________________________________________________
  getNotification_clicked(email: string): Observable<any>{
    return this.http.post<any>('/api/checkingIconNoti', { email: email });
  }

  getNotification(skip: number, limit: number): Observable<any>{
    return this.http.post<any>('/api/getNotification', { skip: skip, limit: limit });
  }

  deleteNotication(_id: string): Observable<any>{
    return this.http.post<any>('/api/deleteNotification', { _id: _id });
  }

  change_clickedNoti(email: string) : Observable<any>{
    return this.http.post<any>('/api/change_clickedNoti', { email: email });
  }

  //__________________________________________________________________________________________________________________

  
  //APPOINTMENT________________________________________________________________________________________________________________
  getAppointment(skip: number, limit: number, radioName: string): Observable<any>{
    return this.http.post<any>('/api/getAppointments_user', { skip: skip, limit: limit, radioName: radioName });
  }

  cancelAppointment(_id: string, fullname: string, email: string, date: string): Observable<any>{
    return this.http.post<any>('/api/cancelAppointment', { _id: _id, fullname: fullname, email: email, date: date });
  }

  moveTo_trash_appointment(_id: string): Observable<any>{
    return this.http.post<any>('/api/trash_Moves_appointment', { _id: _id });
  }

  //__________________________________________________________________________________________________________________

  

  //RESERVATION________________________________________________________________________________________________________________
  getReservation(skip: number, limit: number, radioName: string): Observable<any>{
    return this.http.post<any>('/api/getReservation_user', { skip: skip, limit: limit, radioCondition: radioName });
  }

  cancelReservation(id: string, room_id: string, email_id: string, email: string, date: string, first_name: string, last_name: string): Observable<any>{
    return this.http.post<any>('/api/cancelReservation', { id: id, room_id: room_id, email_id: email_id, email: email, date: date, userNot: true,
      first_name: first_name, last_name: last_name});
  }

  moveTo_trash_Reservation(id: string, room_id: string, email_id: string): Observable<any>{
    return this.http.post<any>('/api/deleteReservation_tempo', { id: id, room_id: room_id,  email_id: email_id });
  }

  uploadImage(arr_img: Array<any>): Observable<any>{
    var formData = new FormData();
    for(let blob of arr_img){
      formData.append('images', blob[1]);
    }
    return this.http.post('/api/uploadImage_reservation', formData);
  }

  updateReservation_image(id: string, room_id: string, email_id: string, arr_img: Array<Array<string>>): Observable<any>{
    return this.http.post<any>('/api/updateReservation', { id: id, room_id: room_id,  email_id: email_id, arr_img: arr_img });
  }

  //__________________________________________________________________________________________________________________



  //ARCHIVE________________________________________________________________________________________________________________
  get_dataArchive(skip: number, limit: number, radioName: string): Observable<any>{
    return this.http.post<any>('/api/get_dataArchive', { skip: skip, limit: limit, radioCondition: radioName });
  }

  retrieve_data(_id: string, radioName: string): Observable<any>{
    return this.http.post<any>('/api/retrieve_data', { _id: _id, radioCondition: radioName });
  }

  delete_dataFinally(_id: string, radioName: string): Observable<any>{
    return this.http.post<any>('/api/delete_dataFinally', { _id: _id, radioCondition: radioName });
  }

  checking_deleteReservation(id: string, room_id: string, email_id: string): Observable<any> {
    return this.http.post<any>('/api/deleteReservation', { id: id, room_id: room_id,  email_id: email_id });
  }

  delete_imageFinally(img_arr: Array<Array<string>>): Observable<any>{
    return this.http.post<any>('/api/deleteImage_user', { img_arr: img_arr });
  }

  delete_finallyReservation(id: string, room_id: string, email_id: string): Observable<any>{
    return this.http.post<any>('/api/deleteReservation_final', { id: id, room_id: room_id,  email_id: email_id });
  }


  //____________________________________________________________________________________________________________________________________



  //PAYMENT RESERVE_________________________________________________________________________________________________________
  checking_user(): Observable<any>{
    return this.http.get<any>('/api/checking_login');
  }

  checking_roomAvailability(_id: string, token: string): Observable<any>{
    return this.http.post<any>('/api/roomAvailability', { _id: _id, token: token });
  }

  token_get(data: any): Observable<any>{
    return this.http.post<any>('/api/createJwt_payment', { data: data });
  }

  checking_tokenNotExpired(token: string): Observable<any>{
    return this.http.post<any>('/api/checkingToken_payment',  { token: token })
  }

  getRoom_payment(_id: string): Observable<any>{
    return this.http.post<any>('/api/getRoom_payment',  { _id: _id })
  }

  saving_information_payment(data_info: Array<any>): Observable<any>{
    return this.http.post<any>('/api/saveReservation',  
    { data: { room_id: data_info[0], checkin_date: data_info[1], checkout_date: data_info[2], acquired_persons: data_info[3], 
      persons_price: data_info[4], total_day_price: data_info[5], total_price: data_info[6], first_name: data_info[7],
      last_name: data_info[8], phone_number: data_info[9], email: data_info[10], image_transaction: data_info[11], 
      transaction_date: data_info[12], paymentMethod: data_info[13], transcation_id: data_info[14], guest_member: data_info[15] } })
  }

  deleting_sessionAfter(token: string): Observable<any>{
    return this.http.post<any>('/api/delete_session', { token: token });
  }
}

