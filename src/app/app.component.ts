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
  subs!: Subscription;

  constructor(public http: HttpClient){} 

  ngOnInit(): void {
    this.subs = this.http.get('/jwt').subscribe((data) => {
      console.log(data+" asdasdsad");
    });

    this.subs.unsubscribe();
  }
}
