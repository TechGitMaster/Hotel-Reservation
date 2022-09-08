import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of} from 'rxjs';
import { EventEmitter } from '@angular/core';
import { timeDate } from '../objects';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class AdServiceService {

  constructor(private http: HttpClient) { }




  //ADMIN____________________________________________________________________________________________________________
  getNameAdmin(): Observable<any>{
    return this.http.get('/getNameAdmin');
  }



  //INBOX______________________________________________________________________________________

  //Getting mails from inbox, favorite, accepted, declined and trash________________________________________________

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

  //This is for accept and decline the mails_______________________________________________
  acceptDecline(id: string, condition: boolean, name_column: string, firstFirst: boolean): Observable<any>{
    return this.http.post<any>('/acceptDecline_Appointments', { datas: { id: id, condition: String(condition), name_column: name_column, firstFirst: firstFirst } });
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

  deleteEvent(id: string): Observable<any>{
    return this.http.post<any>('/deleteEvent', { datas: { id: id } });
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
  getInformation(): Observable<any>{
    return this.http.post<any>('/getInformation', { adminNot: 'admin' });
  }

  checkingPassword(currPass: string): Observable<any>{
    return this.http.post<any>('/checkingPassword', { currPassword: currPass, adminNot: 'admin' });
  }

  changePasswords(email: string, newPass: string): Observable<any>{
    return this.http.post<any>('/changePassword', { email: email, newPassword: newPass });
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

  getRoom(condition: boolean): Observable<any>{
    return this.http.post('/getRooms', { condition: condition });
  }

  uploadImage(img: Blob): Observable<any>{
    let formdata = new FormData();
    formdata.append('image', img);
    return this.http.post('/uploadImage', formdata);
  }

  createNew_room(fields: FormGroup, typeRoom: boolean, imgArr: Array<Array<string>>): Observable<any>{
    return this.http.post('/createNewRoom', { nameRoom: fields.value.nameRoom,
      addInfo: fields.value.addInfo,
      defaultPrice: fields.value.defaultPrice,
      goodPersons: fields.value.goodPersons,
      pricePersons: fields.value.pricePersons,
      typeRoom: typeRoom,
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

  deleteRoom(_id: string): Observable<any>{
    return this.http.post<any>('/deleteRoom', { _id:_id });
  }

  //________________________________________________________________________________________________________________________________________________



  //RESERVATION_________________________________________________________________________________________________________________________________

  getDataReservation(skip: number, limit: number, radioCondition: string, searchingNot: boolean, searchString: string): Observable<any>{
    return this.http.post<any>('/getReservation', 
    { skip: skip, limit: limit, radioCondition: radioCondition, searchingNot: searchingNot, searchString: searchString});
  }

  accept_declineReservation(id: string, room_id: string, email_id: string, confirmation: string, condition: boolean): Observable<any>{
    console.log(id);
    return this.http.post<any>('/A-D_Request', { id: id, room_id: room_id,  email_id: email_id, confirmation_date: confirmation, condition: condition});
  }

  deleteReservation(id: string, room_id: string, email_id: string): Observable<any>{
    return this.http.post<any>('/deleteReservation', { id: id, room_id: room_id,  email_id: email_id });
  }

  deleteReservation_Final(id: string, room_id: string, email_id: string): Observable<any>{
    return this.http.post<any>('/deleteReservation_final', { id: id, room_id: room_id,  email_id: email_id });
  }

  cancelReservation(id: string, room_id: string, email_id: string): Observable<any>{
    return this.http.post<any>('/cancelReservation', { id: id, room_id: room_id,  email_id: email_id });
  }
} 
