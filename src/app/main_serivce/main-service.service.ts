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
  //io('https://abpadilla.herokuapp.com', { transports: ["websocket"] });
  //io('ws://localhost:8080');
  constructor(private http: HttpClient) {
    this.socket = io('https://abpadilla.herokuapp.com', { transports: ["websocket"] });

    this.listen();
   }

   listen(): Observable<any>{
    return new Observable((obs) => {
      this.socket.on('user', (data: any) => {
        obs.next(data);
      });
    });
  }

  //This is to check if there have an appointment that must be voided________________________________
  voided_appointment(): void{
    this.http.post('/voided_parse', {}).subscribe(async (data: any) => {
      if(data.data.length > 0){
        for await(let email of data.data){
          await this.socket.emit('user', email);
        }
      }
    });
  }

  //EventEmitter is more like Observable..._____________________________________
  dataSTR: EventEmitter<string> = new EventEmitter<string>();
  notexpired_Payment = new EventEmitter<boolean>();
  showSuccess: EventEmitter<string> = new EventEmitter<string>();
  menubarComponent: EventEmitter<string> = new EventEmitter<string>();
  selected_image: EventEmitter<string> = new EventEmitter<string>();
  login_from_payment: EventEmitter<any> = new EventEmitter<any>();

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

  emit_selectedImage(image: string): void{
    this.selected_image.emit(image);
  }

  emit_loginFrompayment(): void{
    this.login_from_payment.emit('login');
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
  sendAppointment(formGroup: FormGroup, dateArrival: string, timeDate: string, appointmentNot: string, guest_member: string, transaction_ID: string): Observable<any>{
    return this.http.get('/inboxSaving_user', { params: {
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
  getAllRoom(serviceSelectedCall: string, roomSelectedCall: string): Observable<any>{
    return this.http.post<any>('/getRoomAll', { serviceSelectedCall: serviceSelectedCall, roomSelectedCall: roomSelectedCall });
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
    return this.http.post<any>('/getInformation', { adminNot: 'not-admin' });
  }

  checkingPassword(currPass: string): Observable<any>{
    return this.http.post<any>('/checkingPassword', { currPassword: currPass, adminNot: 'not-admin' });
  }

  changePasswords(email: string, newPass: string): Observable<any>{
    return this.http.post<any>('/changePassword', { email: email, newPassword: newPass });
  }


  //________________________________________________________________________________________________________________

  //NOTIFICATION______________________________________________________________________________________________________________
  getNotification_clicked(email: string): Observable<any>{
    return this.http.post<any>('/checkingIconNoti', { email: email });
  }

  getNotification(skip: number, limit: number): Observable<any>{
    return this.http.post<any>('/getNotification', { skip: skip, limit: limit });
  }

  deleteNotication(_id: string): Observable<any>{
    return this.http.post<any>('/deleteNotification', { _id: _id });
  }

  change_clickedNoti(email: string) : Observable<any>{
    return this.http.post<any>('/change_clickedNoti', { email: email });
  }

  //__________________________________________________________________________________________________________________

  
  //APPOINTMENT________________________________________________________________________________________________________________
  getAppointment(skip: number, limit: number, radioName: string): Observable<any>{
    return this.http.post<any>('/getAppointments_user', { skip: skip, limit: limit, radioName: radioName });
  }

  cancelAppointment(_id: string, fullname: string, email: string, date: string, transaction_ID: string): Observable<any>{
    return this.http.post<any>('/cancelAppointment', { _id: _id, fullname: fullname, email: email, date: date
    , transaction_ID: transaction_ID });
  }

  moveTo_trash_appointment(_id: string): Observable<any>{
    return this.http.post<any>('/trash_Moves_appointment', { _id: _id });
  }

  //__________________________________________________________________________________________________________________

  

  //RESERVATION________________________________________________________________________________________________________________
  getReservation(skip: number, limit: number, radioName: string): Observable<any>{
    return this.http.post<any>('/getReservation_user', { skip: skip, limit: limit, radioCondition: radioName });
  }

  cancelReservation(id: string, room_id: string, email_id: string, email: string, date: string, first_name: string, last_name: string): Observable<any>{
    return this.http.post<any>('/cancelReservation', { id: id, room_id: room_id, email_id: email_id, email: email, date: date, userNot: true,
      first_name: first_name, last_name: last_name});
  }

  moveTo_trash_Reservation(id: string, room_id: string, email_id: string): Observable<any>{
    return this.http.post<any>('/deleteReservation_tempo', { id: id, room_id: room_id,  email_id: email_id });
  }

  uploadImage(arr_img: Array<any>): Observable<any>{
    var formData = new FormData();
    for(let blob of arr_img){
      formData.append('images', blob[1]);
    }
    return this.http.post('/uploadImage_reservation', formData);
  }

  updateReservation_image(id: string, room_id: string, email_id: string, arr_img: Array<Array<string>>): Observable<any>{
    return this.http.post<any>('/updateReservation', { id: id, room_id: room_id,  email_id: email_id, arr_img: arr_img });
  }

  //__________________________________________________________________________________________________________________



  //ARCHIVE________________________________________________________________________________________________________________
  get_dataArchive(skip: number, limit: number, radioName: string): Observable<any>{
    return this.http.post<any>('/get_dataArchive', { skip: skip, limit: limit, radioCondition: radioName });
  }

  retrieve_data(_id: string, radioName: string): Observable<any>{
    return this.http.post<any>('/retrieve_data', { _id: _id, radioCondition: radioName });
  }

  delete_dataFinally(_id: string, radioName: string): Observable<any>{
    return this.http.post<any>('/delete_dataFinally', { _id: _id, radioCondition: radioName });
  }

  checking_deleteReservation(id: string, room_id: string, email_id: string): Observable<any> {
    return this.http.post<any>('/deleteReservation', { id: id, room_id: room_id,  email_id: email_id });
  }

  delete_imageFinally(img_arr: Array<Array<string>>): Observable<any>{
    return this.http.post<any>('/deleteImage_user', { img_arr: img_arr });
  }

  delete_finallyReservation(id: string, room_id: string, email_id: string): Observable<any>{
    return this.http.post<any>('/deleteReservation_final', { id: id, room_id: room_id,  email_id: email_id });
  }


  //____________________________________________________________________________________________________________________________________



  //PAYMENT RESERVE_________________________________________________________________________________________________________
  checking_user(): Observable<any>{
    return this.http.get<any>('/checking_login');
  }

  checking_roomAvailability(_id: string, token: string): Observable<any>{
    return this.http.post<any>('/roomAvailability', { _id: _id, token: token });
  }

  token_get(data: any): Observable<any>{
    return this.http.post<any>('/createJwt_payment', { data: data });
  }

  checking_tokenNotExpired(token: string): Observable<any>{
    return this.http.post<any>('/checkingToken_payment',  { token: token })
  }

  getRoom_payment(_id: string): Observable<any>{
    return this.http.post<any>('/getRoom_payment',  { _id: _id })
  }

  checking_alreadyHave_paypal(room_id: string): Observable<any>{
    return this.http.post('/already_havePaypal', { room_id: room_id});
  }

  saving_information_payment(data_info: Array<any>): Observable<any>{
    return this.http.post<any>('/saveReservation',  
    { data: { room_id: data_info[0], checkin_date: data_info[1], checkout_date: data_info[2], acquired_persons: data_info[3], 
      persons_price: data_info[4], total_day_price: data_info[5], total_price: data_info[6], first_name: data_info[7],
      last_name: data_info[8], phone_number: data_info[9], email: data_info[10], image_transaction: data_info[11], 
      transaction_date: data_info[12], paymentMethod: data_info[13], transcation_id: data_info[14], guest_member: data_info[15],
      acquired_days: data_info[19] } })
  }

  send_reservation_toUser(data_info: Array<any>): Observable<any>{
    return this.http.post<any>('/view_send',  
    { data: { room_id: data_info[0], checkin_date: data_info[1], checkout_date: data_info[2], acquired_persons: data_info[3], 
      persons_price: data_info[4], total_day_price: data_info[5], total_price: data_info[6], first_name: data_info[7],
      last_name: data_info[8], phone_number: data_info[9], email: data_info[10], image_transaction: data_info[11], 
      transaction_date: data_info[12], paymentMethod: data_info[13], transcation_id: data_info[14], guest_member: data_info[15],
      price: data_info[16], nameOfRoom: data_info[17], typeRoom: data_info[18], acquired_days: data_info[19], default_Personprice: data_info[20] } })
  }

  deleting_sessionAfter(token: string): Observable<any>{
    return this.http.post<any>('/delete_session', { token: token });
  }

}

