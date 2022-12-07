import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { MainServiceService } from 'src/app/main_serivce/main-service.service';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.css']
})
export class ArchiveComponent implements OnInit {

  constructor(private service: MainServiceService) { }

  subs!: Subscription;
  skip!: number;
  limit!: number;

  arr_data!: Array<any>;
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
    this.radioName = 'notification';
    this.nomalizeSelected = this.radioName.charAt(0).toUpperCase() + this.radioName.slice(1);

    this.getData();
  }
  

  //Get data appointment_____________________________________________________________
  getData(): void{
    this.arr_data = new Array<any>();
    this.loadingMessage = 'Loading...';

    this.subs = this.service.get_dataArchive(this.skip, this.limit, this.radioName).subscribe((result) => {
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
    if(nomalizeSelected === 'notification' || nomalizeSelected === 'appointment' || nomalizeSelected === 'reservation'){
      this.clickRadio(nomalizeSelected);
    }else{
      this.clickRadio('notification');
    }
  }

  clickRadio(name: string): void{
    this.radioName = name;
    this.nomalizeSelected = this.radioName.charAt(0).toUpperCase() + this.radioName.slice(1);
    this.getData();
  }



  //move to trash appointment________________________________________________________
  movetoTrash(numb: number): void{
    if(this.radioName !== 'reservation'){
      this.subs = this.service.delete_dataFinally(this.arr_data[numb]._id, this.radioName).subscribe((res) => {
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
    }else{
      this.service.emitCall(new Array<any>('progress', Math.floor(Math.random() * 90), 'Deleting reservation request.'));
      this.subs = this.service.checking_deleteReservation(this.arr_data[numb]._id, this.arr_data[numb].room_id, 
        this.arr_data[numb].email_id).subscribe((result) => {
          this.subs.unsubscribe();

          if(result.response === 'success'){
            this.service.emitCall(new Array<any>('progress', 100, 'Deleted successfully.'));

            this.selected_condition = false;
            this.skip = 0;
            this.limit = 5;
            this.getData();
            this.clickBack_selected();
          }else{
            if(result.img_arr.length > 0){
              this.subs = this.service.delete_imageFinally(result.img_arr).subscribe((ress) => {
                this.subs.unsubscribe();

                this.deleteReservation_finally(numb);
              }, (err) => {
                this.subs.unsubscribe();
                location.reload();
              });
            }else{
              this.deleteReservation_finally(numb);
            }
          }

      }, (err) => {
        this.subs.unsubscribe();
        location.reload();
      });
    }
  }


  deleteReservation_finally(numb: number): void{
    this.subs = this.service.delete_finallyReservation(this.arr_data[numb]._id, this.arr_data[numb].room_id, 
      this.arr_data[numb].email_id).subscribe(() => {
        this.subs.unsubscribe();
        this.service.emitCall(new Array<any>('progress', 100, 'Deleted successfully.'));

        this.selected_condition = false;
        this.skip = 0;
        this.limit = 5;
        this.getData();
        this.clickBack_selected();
    });
  }


  //Retrieve data__________________________________________________________________
  retrieve_data(numb: number): void{
    this.subs = this.service.retrieve_data(this.arr_data[numb]._id, this.radioName).subscribe((res) => {
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


  //click back selected____________________________________________________________
  clickBack_selected(): void{
    this.selected_condition = false;
    setTimeout(() => {
      let rad1 = <HTMLInputElement>document.querySelector('#flexRadioDefault1');
      let rad2 = <HTMLInputElement>document.querySelector('#flexRadioDefault2');
      let rad3 = <HTMLInputElement>document.querySelector('#flexRadioDefault3');
      rad1.checked = false;

      switch(this.radioName){
        case 'notification':
          rad1.checked = true;
        break;
        
        case 'appointment':
          rad2.checked = true;
        break;

        case 'reservation':
          rad3.checked = true;
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
  }


  //Return check in and out____________________________________________________________________
  dateCheckOutCheckIn(date: string, numbArr: any): string{
    let splits = date.split(' ');
    let str = '';
    if(numbArr.length == 1){
      str = splits[numbArr[0]];
    }else{
      str = splits[numbArr[0]]+' '+splits[numbArr[1]];
    }
    return str;
  }

  //checking the date and also if it's new___________________________________
  month_names: Array<string> = new Array<string>('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 
  'Dec');
  checking(dates: string): string{

    let str = '';

    let date = new Date();
    let handle_date = dates.split(',')[1].split(' ');

    if(handle_date[0] === this.month_names[date.getMonth()] && handle_date[1] === ''+date.getDate() &&
      handle_date[2] === ''+date.getFullYear()){
        str = dates.split(',')[0];
    }else{
      str = dates.split(',')[1];
    }

    return str;
  }

  timeDate_converted(timeDate: string): string{
    let date_arr = timeDate.split(",")[0].split(" ")[0];  
    if(parseInt(date_arr.split(":")[0]) <= 12) return timeDate;

    let date_final_converted = `0${Math.floor(parseInt(date_arr.split(":")[0])-12)}:${date_arr.split(":")[1]} ${timeDate.split(",")[0].split(" ")[1]},${timeDate.split(",")[1]}`
  
    return date_final_converted;
  }

  //Subtotal count________________________________________________________________________________
  subTotals(total_price: string): number{
    return (Math.floor(parseInt(total_price))+1000);
  }
}
