import { Component, OnInit } from '@angular/core';
import { AdServiceService } from '../../ad-service.service';
import { reservation } from 'src/app/objects';
import { Subscription } from 'rxjs';
import { Condition } from 'mongoose';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css']
})
export class ReservationComponent implements OnInit {

  constructor(private service: AdServiceService) { }

  subs!: Subscription;
  skip!: number;
  limit!: number;
  selectedNumbArr!: number;
  countDataAll!: number;

  inputN!: boolean;
  condition_search!: boolean;
  condition_clickedClear!: boolean;
  txt_search!: string;
  
  arrNumber!: Array<number>;
  dataReservationAll!: Array<Array<reservation>>;
  dataReservationSelected!: Array<reservation>;
  
  strLoadingNothing!: string; 
  str_radioCondition!: string;

  ngOnInit(): void {
    this.skip = 0;
    this.limit = 25;
    this.countDataAll = 0;
    this.str_radioCondition = 'all';
    this.inputN = false;
    this.condition_search = false;
    this.condition_clickedClear = false;
    this.txt_search = '';


    //get data________________________________________________________
    this.getData();
  }



  //Get data_____________________________________________________________________________________
  getData(): void{
    this.selectedNumbArr = 0;
    this.strLoadingNothing = "Loading...";

    this.arrNumber = new Array<number>();
    this.dataReservationAll = new Array<Array<reservation>>();
    this.dataReservationSelected = new Array<reservation>();


    this.subs = this.service.getDataReservation(this.skip, this.limit, this.str_radioCondition, this.condition_search, this.txt_search).subscribe(async (result) => {
      this.subs.unsubscribe(); 
      
      if(result.response === 'success'){
        this.countDataAll = result.count;

        let countAll = 0, count = 0, fornumclick = 0;
        let arr_tempo = new Array<reservation>();

        for await(let data of result.data){
          count++; 
          countAll++;
          arr_tempo.push(data);

          if(count == 5){
            fornumclick += 1;

            this.dataReservationAll.push(arr_tempo);
            
            let math1 = Math.floor((this.skip/5)+fornumclick);
            this.arrNumber.push(math1);

            count = 0;
            arr_tempo = new Array<reservation>();
          }else if(countAll == result.data.length){
            fornumclick += 1;
            this.dataReservationAll.push(arr_tempo);

            let math1 = Math.floor((this.skip/5)+fornumclick);
            this.arrNumber.push(math1);

          }
        }

        this.dataReservationSelected = this.dataReservationAll[this.selectedNumbArr];

      }else{
        this.strLoadingNothing = result.response;
      }

    }, (err) => { 
      this.subs.unsubscribe(); 
      location.reload(); 
    });
  }



  //Click all, accepted and declined radio bttn_______________________________________________________________
  clickRadio(name: string): void{
    this.str_radioCondition = name;

    this.skip = 0;
    this.limit = 25;
    this.countDataAll = 0;

    this.getData();
  }


  //Click number choice_______________________________________________________________________
  clickedNum(numb: number): void{
    this.dataReservationSelected = new Array<reservation>();

    this.selectedNumbArr = numb;
    this.dataReservationSelected = this.dataReservationAll[this.selectedNumbArr];

  }

  //Click next and previous btn_________________________________________________________________
  clickNext(): void{
    if(this.limit < this.countDataAll){
      this.skip += 25;
      this.limit += 25;

      this.getData();
    }
  }

  clickprevious(): void{
    if(this.skip != 0){
      this.skip -= 25;
      this.limit -= 25;

      this.getData();
    }
  }
  //________________________________________________________________________________________________



  //Clear, inputs field and search_________________________________________________________________
  
  clickSearch(): void{
    let doc = <HTMLInputElement>document.querySelector('.txtSearch');

    if(doc.value !== ''){
      this.txt_search = doc.value;
      this.condition_search = true;
      this.condition_clickedClear = true;

      this.skip = 0;
      this.limit = 25;
      this.countDataAll = 0;
      this.getData();
    }

  }

  clickClear(): void{
    let doc = <HTMLInputElement>document.querySelector('.txtSearch');
    doc.value = '';

    this.inputN = false;
    if(this.condition_clickedClear){
      this.condition_clickedClear = false;
      this.condition_search = false;
      this.skip = 0;
      this.limit = 25;
      this.countDataAll = 0;
      this.getData();
    }
  }

  inputNs(event: any): void{
    if(event.target.value !== ''){
      this.inputN = true;
    }else{
      this.inputN = false;
      this.clickClear();
    }
  } 

  //______________________________________________________________________________________________________________



  //Get date convert hrs_____________________________________________________________________________________
  



  //Get date converted____________________________________________________________________________________________
  date_converting(): string{
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

    return `${converted_hours2}:${converted_minutes} ${amPm},${arr_months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
  }

  //Accept, Decline, Info and delete bttn___________________________________________________________________________________

  accept_Decline(numbs: number, condition: boolean): void{
    if(this.dataReservationSelected.length > 0){
      let data_handle = this.dataReservationSelected[numbs] as reservation;
      var dates = this.date_converting();
      this.subs = this.service.accept_declineReservation(data_handle._id, data_handle.room_id, data_handle.email_id, dates, condition).subscribe((res) => {
        this.subs.unsubscribe();

        if(res.response === 'success'){
          this.dataReservationSelected[numbs].confirmNot = `${condition}`;
          this.dataReservationSelected[numbs].confirmation_date = dates;

          this.service.emit_socket_notification(data_handle.email_id);

          this.skip = 0;
          this.limit = 25;
          this.countDataAll = 0;
          this.getData();

        }else{
          //alert reserved_________________________________
          if(res.response === 'not'){
            this.service.emitCall(new Array<any>("warning", "Already reserved", "The room is already reserved by someone."));
          }else{
            this.service.emitCall(new Array<any>("warning", "Deleted room", "This room is not exist on available rooms. To check if still exist, check it on your trash. If not maybe you deleted it."));
          }
        }

      }, (err) => {
        this.subs.unsubscribe();
        location.reload();
      });
    }
  }



  //Deleting temporary the reservation request___________________________________
  info_tempo(numbs: number): void{
    this.service.emitCall(new Array<any>("reservation_info", this.dataReservationSelected[numbs]));
  
      var subsCall = this.service.emitBackEmitter.subscribe((res) => {
        subsCall.unsubscribe();

        if(res[0] === 'moveTo_trash'){
          var subs = this.service.deleteReservation_tempo(this.dataReservationSelected[numbs]._id, this.dataReservationSelected[numbs].room_id, this.dataReservationSelected[numbs].email_id).subscribe(() => {
            subs.unsubscribe();
            this.skip = 0;
            this.limit = 25;
            this.countDataAll = 0;
            this.getData();

          }, (err) => {
            subs.unsubscribe();
            location.reload();
          });
        }else if(res[0] === 'cancelReservation'){

          //Cancel reservation__________________________________________________________
          this.subs = this.service.cancelReservation(this.dataReservationSelected[numbs]._id, this.dataReservationSelected[numbs].room_id, this.dataReservationSelected[numbs].email_id).subscribe(() => {
            this.subs.unsubscribe();
            this.dataReservationSelected[numbs].confirmNot = 'true false';

            this.service.emit_socket_notification(this.dataReservationSelected[numbs].email_id);

          }, (err) => {
            this.subs.unsubscribe();
            location.reload();
          });
        } 

      });
  }



  //Deleting permanently the reservation request_____________________________________________________
  subsCall!: Subscription;
  handle_image!: Array<string>;
  info(numbs: number): void{
    this.service.emitCall(new Array<any>("reservation_info", this.dataReservationSelected[numbs]));
    this.subsCall = this.service.emitBackEmitter.subscribe((res) => {
      this.subsCall.unsubscribe();

      //Checking if the admin click the delete bttn____________________________________
      if(res[0] === 'delete'){
        this.service.emitCall(new Array<any>("progress", 0, 'Successfully deleting request.'));
        this.subs = this.service.deleteReservation(this.dataReservationSelected[numbs]._id, this.dataReservationSelected[numbs].room_id, this.dataReservationSelected[numbs].email_id).subscribe((result) => {
          this.subs.unsubscribe();
          if(result.response === 'delete'){
            if(result.img_arr.length == 0){
              this.callLoading();
            }else{  
              this.handle_image = result.img_arr;
              this.deleting_image(0, this.dataReservationSelected[numbs]._id, this.dataReservationSelected[numbs].room_id, this.dataReservationSelected[numbs].email_id);
            }
          }else{
            this.callLoading();
          }

        }, (err) => {
          this.subs.unsubscribe();
          location.reload();
        });
      }else if(res[0] === 'Retrieve'){  
        this.subs = this.service.retrieve_reservation(this.dataReservationSelected[numbs]._id, this.dataReservationSelected[numbs].room_id, this.dataReservationSelected[numbs].email_id).subscribe(() =>{
          this.subs.unsubscribe();

          this.skip = 0;
          this.limit = 25;
          this.countDataAll = 0;
          this.getData();
        }, (err) => {
          this.subs.unsubscribe();
          location.reload();
        })
      } 

    });
  }


  callLoading(): void{
    this.service.emitCall(new Array<any>("progress", 100, 'Successfully deleting request.'));

    this.skip = 0;
    this.limit = 25;
    this.countDataAll = 0;
    this.getData();
  }


  //Deleting image 1v1 to cloudinary______________________________________________________________________________________________
  deleting_image(numb: number, id: string, room_id: string, email_id: string): void{
    this.service.emitCall(new Array<any>("progress", Math.floor((numb * 95) / this.handle_image.length), 'Successfully deleting request.'));

    this.subs = this.service.deleteImageCloudinary(this.handle_image[numb][1]).subscribe((res) => {
      this.subs.unsubscribe();

      if(numb+1 !== this.handle_image.length){
        numb += 1;
        this.deleting_image(numb, id, room_id, email_id); 
      }else{
        this.subs = this.service.deleteReservation_Final(id, room_id, email_id).subscribe((result) => {
          this.service.emitCall(new Array<any>("progress", 100, 'Successfully deleting request.'));
          this.callLoading();
        });
      }
    });
  }

}
