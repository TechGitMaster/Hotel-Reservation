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


  facilities(): void{
    window.scrollTo({ top: 0 });
    setTimeout(() => {
      this.router.navigate(['/mc/facilities']);
    }, 200);
  }

  room(): void{
    window.scrollTo({ top: 0 });
    setTimeout(() => {
      this.router.navigate(['/mc/rooms']);
    }, 200);
  }

  locateTheHotel(): void{
    window.open("https://www.google.com/maps/place/Manhattan+Garden+City/@14.6220653,121.0505355,17z/data=!3m1!5s0x3397b7bf7007f2b3:0xf5d53516a76a3d22!4m14!1m7!3m6!1s0x3397b7bfb10b1099:0xa22d84487ebc8804!2sManhattan+Garden+City!8m2!3d14.6220601!4d121.0527242!16s%2Fg%2F11bw613979!3m5!1s0x3397b7bfb10b1099:0xa22d84487ebc8804!8m2!3d14.6220601!4d121.0527242!16s%2Fg%2F11bw613979");
  }

}
