import { HttpClient } from '@angular/common/http';
import { HostListener, Injectable } from '@angular/core';
import { forkJoin, Observable, of} from 'rxjs';
import { EventEmitter } from '@angular/core';
import { timeDate } from '../objects';
import { FormGroup } from '@angular/forms';
import { io } from 'socket.io-client';
import { register } from '../objects';

@Injectable({
  providedIn: 'root'
})
export class AdServiceService {

  @HostListener('window:beforeunload')
  doSomething() {
    this.socket.close();
  }
  
  socket!: any;
  //io('https://abpadilla.herokuapp.com', { transports: ["websocket"] });
  //io('ws://localhost:8080');
  constructor(private http: HttpClient) { 
    this.socket = io('https://abpadilla.herokuapp.com', { transports: ["websocket"] });
  }

  emit_socket_notification(email: string): void{
    this.socket.emit('user', email);
  }


  //ADMIN____________________________________________________________________________________________________________
  getNameAdmin(): Observable<any>{
    return this.http.get('/getNameAdmin');
  }



  //This is to hide navigation_______________________________________________________________
  eventEmitter_NavigationFrom: EventEmitter<any> = new EventEmitter<any>();
  eventEmiterF_func(condition: boolean): void{
    this.eventEmitter_NavigationFrom.emit(condition);
  }


  //DASHBOARD______________________________________________________________________________________

  //Getting mails from inbox, favorite, and trash________________________________________________


  //Get counts of dashboard________________________________________________________________
  dashboardCount(date: string): Observable<any>{
    return this.http.post('/getCountsDashboard', { date: date });
  }

  //This is for getting InboxMail_____________________________________________________
  nextMail(skip: number, limit: number): Observable<any>{
    return this.http.post<any>('/getinboxAdmin', { data: { skip: skip, limit: limit} });
  }

  //This is for getting FavoriteMail__________________________________________________
  getFavorite(skip: number, limit: number): Observable<any>{
    return this.http.post<any>('/getFavorite', { data: { skip: skip, limit: limit} });
  }

  //This is for getting AcceptedMails and DeclinedMails__________________________________________________
  getAcceptedDecline(skip: number, limit: number, condition: string): Observable<any>{
    return this.http.post<any>('/getAcceptDecline', { data: { skip: skip, limit: limit, condition_AD: condition} });
  }


  //This is for getting the TrashMails_____________________________________________________________
  getTrash(skip: number, limit: number): Observable<any>{
    return this.http.post<any>('/getTrashMails', { data: { skip: skip, limit: limit} });
  }


  //__________________________________________________________________________________________________________



  //This is for Save favorite or not__________________________________________
  saveNotFavorite(id: string, condition: boolean, name_column: string): Observable<any>{
    return this.http.post<any>('/saveNotFavorite', { datas: { id: id, condition: condition, name_column: name_column } });
  }

  //This is for to change if it's new or not__________________________________________
  newClicked(id: string): Observable<any>{
    return this.http.post<any>('/unewMessage', { datas: { id: id } });
  }

  //This is for to delete Emails not final____________________________________________________
  deleteMails(arr_datas: Array<Array<any>>, name_column: string): Observable<any>{
    return this.http.post<any>('/deleteMails', { datas: { ids_arr: arr_datas, name_column: name_column } });
  }

  //This is for tp delete Email permanently___________________________________________________
  deleteMailsPerma(arr_datas: Array<Array<any>>): Observable<any>{
    return this.http.post<any>('/deleteMailTrash', { datas: { ids_arr: arr_datas } });
  }

  //This is for retrive email and send it to their assigned folder__________________________________________________
  retriveMails(arr_datas: Array<Array<any>>): Observable<any>{
    return this.http.post<any>('/retriveMails', { datas: { ids_arr: arr_datas } });
  }


  //__________________________________________________________________________________________________________



  //SCHEDULES_____________________________________________________________________________________________________

  getAllSched(): Observable<any>{
    return this.http.get('/getAllSched');
  }

  getTimdate(): Observable<timeDate>{
    return this.http.get<timeDate>('/AmPmDate_get');
  }

  saveDate(arrDate: Array<any>): Observable<any>{
    return this.http.post<any>('/notAvailable_save', { datas: { arr_date: arrDate } });
  }

  saveAM(AM: Array<string>): Observable<any>{
    return this.http.post<any>('/Am_save', { datas: { AM: AM } });
  }

  savePM(PM: Array<string>): Observable<any>{
    return this.http.post<any>('/Pm_save', { datas: { PM: PM } });
  }

  deleteAMPM(AM: Array<string>, PM: Array<string>): Observable<any>{
    return this.http.post<any>('/updateAMPM', { datas: { AM: AM, PM: PM } });
  }

  getDeletedAppointment(): Observable<any>{
    return this.http.get<any>('/getDeleteAppointment');
  }


  delete_permanently(_id: string): Observable<any>{
    return this.http.post('/deletePermanent', { _id: _id });
  }

  retrieve_appointment(_id: string): Observable<any>{
    return this.http.post('/retrieveAppointment', { _id: _id });
  }

  cancelTrashEvent(id: string, cancelDelete: boolean, date: string): Observable<any>{
    return this.http.post<any>('/cancelTrashEvent', { datas: { id: id, cancelDelete: cancelDelete, date: date } });
  }

  //Schedule EventEmitters_______________________________________________________________________________________
  showEmitter: EventEmitter<any> = new EventEmitter<any>();
  backEmitter: EventEmitter<any> = new EventEmitter<any>();

  openCall(arr: any): void{
    this.showEmitter.emit(arr);
  }

  backEmitters(arr: any): void{
    this.backEmitter.emit(arr);
  }

  //_____________________________________________________________________________________________________________________


  //ACCOUNT SETTINGS____________________________________________________________________________________________________
  emitShowEmitter_account: EventEmitter<any> = new EventEmitter<any>();

  account_emitter(): void{
    this.emitShowEmitter_account.emit();
  }

  getInformation(): Observable<any>{
    return this.http.post<any>('/getInformation', { adminNot: 'admin' });
  }

  checkingPassword(currPass: string): Observable<any>{
    return this.http.post<any>('/checkingPassword', { currPassword: currPass, adminNot: 'admin' });
  }

  changePasswords(email: string, newPass: string): Observable<any>{
    return this.http.post<any>('/changePassword', { email: email, newPassword: newPass });
  }
  

  checkingEmail(email: string): Observable<any>{
    return this.http.get('/emailCheck', { params: { email: email } });
  }
  
  register(data: register, adminNot: string): Observable<any>{
    return this.http.post<any>('/registration', { data: data, fullName: '', adminNot: adminNot, condition: 'norms-register' });
  }

  //______________________________________________________________________________________________________________________


  //ROOMS__________________________________________________________________________________________________________________

  emitShowEmitter: EventEmitter<any> = new EventEmitter<any>();
  emitBackEmitter: EventEmitter<any> = new EventEmitter<any>();

  emitCall(arr: Array<any>): void{
    this.emitShowEmitter.emit(arr);
  }

  backCall(arr: Array<any>): void{
    this.emitBackEmitter.emit(arr);
  }

  getRoom(condition: boolean, serviceSelectedCall: string, roomSelectedCall: string): Observable<any>{
    return this.http.post('/getRooms', { condition: condition, serviceSelectedCall: serviceSelectedCall, roomSelectedCall: roomSelectedCall });
  }

  getDeleted_room(serviceSelectedCall: string, roomSelectedCall: string): Observable<any>{
    return this.http.post('/getdeleteRoom', {serviceSelectedCall: serviceSelectedCall, roomSelectedCall: roomSelectedCall});
  }

  uploadImage(img: Blob): Observable<any>{
    let formdata = new FormData();
    formdata.append('image', img);
    return this.http.post('/uploadImage', formdata);
  }

  createNew_room(fields: FormGroup, typeRoom: boolean, typeRoom2: string, imgArr: Array<Array<string>>): Observable<any>{
    return this.http.post('/createNewRoom', { nameRoom: fields.value.nameRoom,
      addInfo: fields.value.addInfo,
      defaultPrice: fields.value.defaultPrice,
      goodPersons: fields.value.goodPersons,
      pricePersons: fields.value.pricePersons,
      typeRoom: typeRoom,
      typeRoom2: typeRoom2,
      imgArr: imgArr
    });
  }

  deleteImageCloudinary(id_img: string): Observable<any>{
    return this.http.post<any>("/deleteImage", { id_img: id_img });
  }

  change_detail_room(id: string, fields: FormGroup, imgArr: Array<Array<string>>): Observable<any>{
    return this.http.post<any>('/updateDetailsRoom', {
      id: id,
      nameRoom: fields.value.nameRoom,
      addInfo: fields.value.addInfo,
      defaultPrice: fields.value.defaultPrice,
      goodPersons: fields.value.goodPersons,
      pricePersons: fields.value.pricePersons,
      imgArr: imgArr
    });
  }

  moveRoom_trash(_id: string): Observable<any>{
    return this.http.post<any>('/moveToTrash', { _id:_id });
  }

  room_retreive(_id: string): Observable<any>{
    return this.http.post<any>('/room_retreive', { _id:_id });
  }

  deleteRoom(_id: string): Observable<any>{
    return this.http.post<any>('/deleteRoom', { _id:_id });
  }

  //________________________________________________________________________________________________________________________________________________



  //RESERVATION_________________________________________________________________________________________________________________________________

  getDataReservation(skip: number, limit: number, radioCondition: string, searchingNot: boolean, searchString: string): Observable<any>{
    return this.http.post<any>('/getReservation', 
    { skip: skip, limit: limit, radioCondition: radioCondition, searchingNot: searchingNot, searchString: searchString});
  }

  accept_declineReservation(id: string, room_id: string, email_id: string, confirmation: string, condition: boolean, reason: string): Observable<any>{
    return this.http.post<any>('/A-D_Request', { id: id, room_id: room_id,  email_id: email_id, confirmation_date: confirmation, condition: condition,
    reason: reason});
  }

  deleteReservation_tempo(id: string, room_id: string, email_id: string): Observable<any>{
    return this.http.post<any>('/deleteReservation_tempo', { id: id, room_id: room_id,  email_id: email_id });
  }

  retrieve_reservation(id: string, room_id: string, email_id: string): Observable<any>{
    return this.http.post<any>('/retrieve_Reservation', { id: id, room_id: room_id,  email_id: email_id });
  }

  deleteReservation(id: string, room_id: string, email_id: string): Observable<any>{
    return this.http.post<any>('/deleteReservation', { id: id, room_id: room_id,  email_id: email_id });
  }

  deleteReservation_Final(id: string, room_id: string, email_id: string): Observable<any>{
    return this.http.post<any>('/deleteReservation_final', { id: id, room_id: room_id,  email_id: email_id });
  }

  cancelReservation(id: string, room_id: string, email_id: string): Observable<any>{

    let date = new Date();

    //Hours_________________________________________
    let hours = date.getHours()
    let converted_hours = (hours < 13 ? hours: (hours-12));
    let converted_hours2 = ( new String(converted_hours).split('').length == 1 ? `0${converted_hours}`:converted_hours);

    //AM-PM__________________________________________
    let amPm = (hours < 12 ? 'am':'pm');

    //Minutes___________________________________________
    let minutes = date.getMinutes();
    let converted_minutes = (minutes >= 10 ? minutes:`0${minutes}`);

    //month______________________________________________
    let arr_months = new Array<string>('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec');

    const str = `${converted_hours2}:${converted_minutes} ${amPm},${arr_months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;

    return this.http.post<any>('/cancelReservation', { id: id, room_id: room_id, email_id: email_id, date: str, userNot: false });
  }

  //________________________________________________________________________________________________________________________________________________



  //APPOINTMENT_____________________________________________________________________________________________________________________________________
  emitShowEmitter_appointment: EventEmitter<any> = new EventEmitter<any>();
  emitBackEmitter_appointment: EventEmitter<any> = new EventEmitter<any>();

  emitCall_appointment(arr: Array<any>): void{
    this.emitShowEmitter_appointment.emit(arr);
  }

  backCall_appointment(arr: Array<any>): void{
    this.emitBackEmitter_appointment.emit(arr);
  }

  getDataAppointment(skip: number, limit: number, radioCondition: string, searchingNot: boolean, searchString: string): Observable<any>{
    return this.http.post<any>('/getAppointment', 
    { skip: skip, limit: limit, radioCondition: radioCondition, searchingNot: searchingNot, searchString: searchString});
  }

  acceptDecline(id: string, condition: boolean, firstFirst: boolean, str: string, reason: string): Observable<any>{
    return this.http.post<any>('/acceptDecline_Appointments', 
    { datas: { id: id, condition: String(condition), firstFirst: firstFirst, date: str, reason: reason } });
  }

  moveTo_trash_appointment(id: string): Observable<any>{
    return this.http.post<any>('/moveTotrash_appointment', { id: id });
  }
  
  retrieve_appointment_admin(id: string): Observable<any>{
    return this.http.post<any>('/retrieve_appointment_admin', { id: id });
  }

  delete_Perma_appointment(id: string): Observable<any>{
    return this.http.post<any>('/delete_Perma_appointment', { id: id });
  }

} 
