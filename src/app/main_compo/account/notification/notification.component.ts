import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MainServiceService } from 'src/app/main_serivce/main-service.service';
import { notification_user } from '../../../objects';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {

  constructor(private service: MainServiceService) { }

  skip!: number;
  limit!: number;
  subs!: Subscription;
  
  loadingMessage: string = 'Loading...';
  arr_Notification!: Array<notification_user>;
  count: number = 0;
  count_to5: number = 0;

  ngOnInit(): void {
    this.arr_Notification = new Array<notification_user>();
    this.skip = 0;
    this.limit = 5;

    this.getData();
  }

  

  //get Notification_________________________________________________
  getData(): void{
    this.loadingMessage = 'Loading...';
    this.arr_Notification = new Array<notification_user>();

    this.subs = this.service.getNotification(this.skip, this.limit).subscribe((res) => {
      this.subs.unsubscribe();

      if(res.response === 'success'){
        this.arr_Notification = res.data;
      }else{
        this.loadingMessage = 'Empty notification.';
      }

      this.count = res.response === 'success' ? res.count:0;
      this.count_to5 = this.arr_Notification.length;
    }, (err) => {
      this.subs.unsubscribe();
      location.reload();
    });
  }


  //right bttn________________________________________________________
  right(): void{
    if(this.arr_Notification.length != 0){
      if(this.limit < this.count){
        this.skip += 5;
        this.limit += 5;
        this.getData();
      }
    }
  }


  //left bttn_______________________________________________________
  left(): void{
    if(this.arr_Notification.length != 0){
      if(this.skip != 0){
        this.skip -= 5;
        this.limit -= 5;
        this.getData();
      }
    }
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


  //Delete bttn____________________________________________________________
  deletes(numb: number): void{
    this.subs = this.service.deleteNotication(this.arr_Notification[numb]._id).subscribe((result) => {
      this.subs.unsubscribe();

      this.skip = 0;
      this.limit = 5;
      this.getData();

    }, (err) => {
      this.subs.unsubscribe();
      location.reload();
    });
  }

}
