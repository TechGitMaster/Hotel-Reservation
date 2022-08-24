import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable} from 'rxjs';
import { EventEmitter } from '@angular/core';
import { timeDate } from '../objects';

@Injectable({
  providedIn: 'root'
})
export class AdServiceService {

  constructor(private http: HttpClient) { }



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

}
