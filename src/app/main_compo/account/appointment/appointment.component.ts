import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MainServiceService } from 'src/app/main_serivce/main-service.service';
import { appointment_user } from 'src/app/objects';

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css']
})
export class AppointmentComponent implements OnInit {

  constructor(private service: MainServiceService) { }

  subs!: Subscription;
  skip!: number;
  limit!: number;

  arr_data!: Array<appointment_user>;
  radioName!: string;
  loadingMessage!: string;
  nomalizeSelected!: string;
  count!: number;
  count_for5!: number;

  ngOnInit(): void {
    this.count = 0;
    this.count_for5 = 0;

    this.skip = 0;
    this.limit = 5;
    this.radioName = 'pending';
    this.nomalizeSelected = this.radioName.charAt(0).toUpperCase() + this.radioName.slice(1);

    this.getData();
  }
  

  //Get data appointment_____________________________________________________________
  getData(): void{
    this.arr_data = new Array<appointment_user>();
    this.loadingMessage = 'Loading...';

    this.subs = this.service.getAppointment(this.skip, this.limit, this.radioName).subscribe((result) => {
      this.subs.unsubscribe();

      if(result.response === 'success'){
        this.arr_data = result.data;
        this.count = result.count;
        this.count_for5 = this.arr_data.length;
      }else{
        this.count = 0;
        this.count_for5 = 0;
        this.loadingMessage = result.message;
      }

    }, (err) => {
      this.subs.unsubscribe();
      location.reload();
    });
  }

  //right bttn________________________________________________________
  right(): void{
    if(this.arr_data.length != 0){
      if(this.limit < this.count){
        this.skip += 5;
        this.limit += 5;
        this.getData();
      }
    }
  }


  //left bttn_______________________________________________________
  left(): void{
    if(this.arr_data.length != 0){
      if(this.skip != 0){
        this.skip -= 5;
        this.limit -= 5;
        this.getData();
      }
    }
  }


  //Click radio bttn__________________________________________________________________________
  chnageR(event: any): void{
    var nomalizeSelected = event.target.value.charAt(0).toLowerCase() + event.target.value.slice(1);
    if(nomalizeSelected === 'pending' || nomalizeSelected === 'accepted' || nomalizeSelected === 'declined' || nomalizeSelected === 'canceled'){
      this.clickRadio(nomalizeSelected);
    }else{
      this.clickRadio('pending');
    }
  }

  clickRadio(name: string): void{
    this.radioName = name;
    this.nomalizeSelected = this.radioName.charAt(0).toUpperCase() + this.radioName.slice(1);
    this.getData();
  }



  //checking the date and also if it's new___________________________________
  month_names: Array<string> = new Array<string>('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 
  'Dec');
  checking(condition: boolean, dates: string): string{

    let str = '';

    let date = new Date();
    let handle_date = dates.split(',')[1].split(' ');

    if(handle_date[0] === this.month_names[date.getMonth()] && handle_date[1] === ''+date.getDate() &&
      handle_date[2] === ''+date.getFullYear()){
        str = (condition ? 'new': dates.split(',')[0]);
    }else{
      str = (condition ? '': dates.split(',')[1]);
    }

    return str;
  }

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


    return `${converted_hours2}:${converted_minutes} ${amPm},${this.month_names[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
  } 

  //Cancel bttn request___________________________________________________________________
  cancelRequest(numb: number): void{
    this.service.emitCall(new Array<any>("yesNo", "Cancel request", "Are you sure you want to cancel this request?"));

    this.subs = this.service.emitBack.subscribe((result) => {
      this.subs.unsubscribe();      
      if(result[0]){
        this.subs = this.service.cancelAppointment(this.arr_data[numb]._id, this.arr_data[numb].fullname, this.arr_data[numb].reserved_email,
          this.date_converting(), this.arr_data[0].transaction_ID).subscribe((res) => { 
            this.subs.unsubscribe();

            this.selected_condition = false;
            this.skip = 0;
            this.limit = 5;
            this.getData();
            this.clickBack_selected();
        }, (err) => {
          this.subs.unsubscribe();
          location.reload();
        });
      }
    });
  }


  //move to trash appointment________________________________________________________
  movetoTrash(numb: number): void{
    this.subs = this.service.moveTo_trash_appointment(this.arr_data[numb]._id).subscribe((res) => {
      this.subs.unsubscribe();

      this.selected_condition = false;
      this.skip = 0;
      this.limit = 5;
      this.getData();
      this.clickBack_selected();
    }, (err) => {
      this.subs.unsubscribe();
      location.reload();
    })
  }


  //click back selected____________________________________________________________
  clickBack_selected(): void{
    this.selected_condition = false;
    setTimeout(() => {
      let rad1 = <HTMLInputElement>document.querySelector('#flexRadioDefault1');
      let rad2 = <HTMLInputElement>document.querySelector('#flexRadioDefault2');
      let rad3 = <HTMLInputElement>document.querySelector('#flexRadioDefault3');
      let rad4 = <HTMLInputElement>document.querySelector('#flexRadioDefault4');
      rad1.checked = false;

      switch(this.radioName){
        case 'pending':
          rad1.checked = true;
        break;
        
        case 'accepted':
          rad2.checked = true;
        break;

        case 'declined':
          rad3.checked = true;
        break;
        
        case 'canceled':
          rad4.checked = true;
        break;

      }
    }, 10);
  }

  //Click details_______________________________________________________________________________
  selected_condition: boolean = false;
  arr_selected_data: Array<any> = new Array<any>();
  click_details(numb: number): void{
    this.arr_selected_data = [this.arr_data[numb], numb];
    this.selected_condition = true;

    console.log(this.arr_selected_data[0].guest_member.split('\n'));
  }

}
