import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AdServiceService } from 'src/app/admin/ad-service.service';

@Component({
  selector: 'app-inbox-main',
  templateUrl: './inbox-main.component.html',
  styleUrls: ['./inbox-main.component.css']
})
export class InboxMainComponent implements OnInit {

  constructor(private service: AdServiceService, private http: HttpClient) { }

  num_selectionCondition!: number;
  arr_named!: Array<string>;
  arr_dasboard!: Array<string>;

  ngOnInit(): void {
    this.num_selectionCondition = 0;
    this.arr_named = new Array<string>('Inbox', 'Favorites', 'Trash');

    this.arr_dasboard = new Array<string>('0', '0', '0', '0');

    this.getCountsDashboard();
  }

  funcSelected(number: number): void{
    this.num_selectionCondition = number;
  }

  //Get date converted____________________________________________________________________________________________
  date_converting(): string{
    let date = new Date();

    //month______________________________________________
    let arr_months = new Array<string>('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec');

    return `${arr_months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
  }

  //get dashboard counts_____________________________________________________________________________
  getCountsDashboard(): void{
    var subs = this.service.dashboardCount(this.date_converting()).subscribe((res) => {
      subs.unsubscribe();
      console.log(res);

      const log = res.counts[0] < 10 ? (res.counts[0] != 0 ? `0${res.counts[0]}`: '0'):res.counts[0];
      const app = res.counts[1] < 10 ? (res.counts[1] != 0 ? `0${res.counts[1]}`: '0'):res.counts[1];
      const sched = res.counts[2] < 10 ? (res.counts[2] != 0 ? `0${res.counts[2]}`: '0'):res.counts[2];
      const reserved = res.counts[3] < 10 ? (res.counts[3] != 0 ? `0${res.counts[3]}`: '0'):res.counts[3];

      this.arr_dasboard = new Array<string>(log, app, sched, reserved);
    }, (err) => {
      subs.unsubscribe();
      location.reload();
    }); 
  }

}
