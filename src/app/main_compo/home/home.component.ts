import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private http: HttpClient, private router: Router) { }

  subs!: Subscription;
  condition_show!: boolean;
  count_room!: number;
  room_arr!: Array<Array<string>>;

  ngOnInit(): void {
    this.count_room = 0;
    this.condition_show = false;
    this.room_arr = new Array<Array<string>>();

    this.subs = (this.http.get<any>('/getRoomLanding') as Observable<any>).subscribe((res) => {
      if(res.response === 'success'){
        this.room_arr = res.data;
        this.count_room = res.count;
      }
      this.condition_show = true;
    });
  }

  navigates(condition: boolean): void{
    window.scrollTo({ top: 0 });

    if(!condition){
      setTimeout(() => {
        this.router.navigate(['/mc/rooms']);
      }, 50);
    }else{
      setTimeout(() => {
        this.router.navigate(['/mc/contact-us']);
      }, 350);
    }
  }
}
