import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { mails } from 'src/app/objects';
import { AdServiceService } from '../../ad-service.service';

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css']
})
export class AppointmentComponent implements OnInit {

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
  dataAppointmentAll!: Array<Array<mails>>;
  dataAppointmentSelected!: Array<mails>;
  
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
    this.dataAppointmentAll = new Array<Array<mails>>();
    this.dataAppointmentSelected = new Array<mails>();


    this.subs = this.service.getDataAppointment(this.skip, this.limit, this.str_radioCondition, this.condition_search, this.txt_search).subscribe(async (result) => {
      this.subs.unsubscribe(); 
      
      if(result.response === 'success'){
        this.countDataAll = result.count;

        let countAll = 0, count = 0, fornumclick = 0;
        let arr_tempo = new Array<mails>();

        for await(let data of result.data){
          count++; 
          countAll++;
          arr_tempo.push(data);

          if(count == 5){
            fornumclick += 1;

            this.dataAppointmentAll.push(arr_tempo);
            
            let math1 = Math.floor((this.skip/5)+fornumclick);
            this.arrNumber.push(math1);

            count = 0;
            arr_tempo = new Array<mails>();
          }else if(countAll == result.data.length){
            fornumclick += 1;
            this.dataAppointmentAll.push(arr_tempo);

            let math1 = Math.floor((this.skip/5)+fornumclick);
            this.arrNumber.push(math1);

          }
        }

        this.dataAppointmentSelected = this.dataAppointmentAll[this.selectedNumbArr];

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
    this.dataAppointmentSelected = new Array<mails>();

    this.selectedNumbArr = numb;
    this.dataAppointmentSelected = this.dataAppointmentAll[this.selectedNumbArr];

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

      this.toRestart();
    }

  }

  clickClear(): void{
    let doc = <HTMLInputElement>document.querySelector('.txtSearch');
    doc.value = '';

    this.inputN = false;
    if(this.condition_clickedClear){
      this.condition_clickedClear = false;
      this.condition_search = false;
      
      this.toRestart();
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


  //Accept or Decline_________________________________________________________________
  subsAD!: Subscription;
  accept_Decline(numbs: number, condition: boolean): void{

    if(this.dataAppointmentSelected.length != -1){

      let data = this.dataAppointmentSelected[numbs] as mails;
      this.subs = this.service.acceptDecline(data._id, condition, true, this.date_converting()).subscribe((result) => {
        this.subs.unsubscribe();
        if(result.response !== 'have'){
          this.skip = 0;
          this.limit = 25;
          this.countDataAll = 0;
          this.getData();

          this.service.emit_socket_notification(data.email);
        }else{
          this.service.openCall(new Array<any>("haveSame", "Already listed", "Are you sure you want to accept the appointment that has been listed to your schedule?"));
          this.subsAD = this.service.backEmitter.subscribe((result) => {
            this.subsAD.unsubscribe();
            if(result[0]){
              if(result[1]){
                this.subs = this.service.acceptDecline(data._id, condition, false, this.date_converting()).subscribe((res) => {
                  this.subs.unsubscribe();

                  this.toRestart();

                  this.service.emit_socket_notification(data.email);
                },(error) => 
                {
                  this.subs.unsubscribe();
                  location.reload()
                });
              }
            }
          });
        }
      }, (error) => 
      {
        this.subs.unsubscribe();
        location.reload()
      });
    }
  }


  //Info______________________________________________________________________
  info(numb: number): void{
    //month______________________________________________
    let arr_months = new Array<string>('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec');
    let arr_date = this.dataAppointmentSelected[numb].timeDate.split(',')[1].split(' ');
    let count_month = arr_months.indexOf(arr_date[0]);

    let date_forChecking = ''+arr_date[2]+' '+count_month+' '+arr_date[1];
    
    this.service.emitCall_appointment(new Array<any>(this.dataAppointmentSelected[numb], date_forChecking));
    this.subs = this.service.emitBackEmitter_appointment.subscribe((result) => {
      this.subs.unsubscribe();

      if(result[0] === 'moveTo_trash'){
        this.subs = this.service.moveTo_trash_appointment(this.dataAppointmentSelected[numb]._id).subscribe(() => {
          this.subs.unsubscribe();
          this.toRestart();
        }, (error) => 
        {
          this.subs.unsubscribe();
          location.reload()
        });
      }else if(result[0] === 'cancelAppointment'){
        this.subs = this.service.cancelTrashEvent(this.dataAppointmentSelected[numb]._id, false, this.date_converting()).subscribe(() => {
          this.subs.unsubscribe();

          this.toRestart(); 
        }, (error) => 
        {
          this.subs.unsubscribe();
          location.reload()
        });
      }
    });

  } 


  //Trash info_______________________________________________________________
  info_trash(numb: number): void{
    this.service.emitCall_appointment(new Array<any>(this.dataAppointmentSelected[numb]));
    this.subs = this.service.emitBackEmitter_appointment.subscribe((result) => {
      this.subs.unsubscribe();
      
      if(result[0] === 'delete'){
        this.subs = this.service.delete_Perma_appointment(this.dataAppointmentSelected[numb]._id).subscribe(() => {
          this.subs.unsubscribe();
          this.toRestart();
        }, (error) => 
        {
          this.subs.unsubscribe();
          location.reload()
        });

      }else if(result[0] === 'Retrieve'){
        this.subs = this.service.retrieve_appointment_admin(this.dataAppointmentSelected[numb]._id).subscribe(() => {
          this.subs.unsubscribe();
          this.toRestart();
        }, (error) => 
        {
          this.subs.unsubscribe();
          location.reload()
        });
      } 

    });
  }

  toRestart(): void{
    this.skip = 0;
    this.limit = 25;
    this.countDataAll = 0;
    this.getData();
  }

  timeDate_converted(timeDate: string): string{
    let date_arr = timeDate.split(",")[0].split(" ")[0];  
    if(parseInt(date_arr.split(":")[0]) <= 12) return timeDate;

    let date_final_converted = `0${Math.floor(parseInt(date_arr.split(":")[0])-12)}:${date_arr.split(":")[1]} ${timeDate.split(",")[0].split(" ")[1]},${timeDate.split(",")[1]}`
  
    return date_final_converted;
  }


}
