import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';  
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'abpadilla';

  https!: any;
  subs!: Subscription;

  constructor(private http: HttpClient){
    this.https = http;
  } 

  ngOnInit(): void {
    this.subs = this.https.get('./jwt').subscribe((data: any) => {
      console.log(data+" asdasdsad");
    });

    this.subs.unsubscribe();
  }
}
