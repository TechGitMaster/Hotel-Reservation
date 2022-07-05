import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';  
import { Subscription } from 'rxjs';
import { ServtryService } from './server/servtry.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'abpadilla';
  subs!: Subscription;

  constructor(public http: HttpClient, public servtryService: ServtryService){} 

  ngOnInit(): void {
      this.subs = this.servtryService.getting().subscribe((data) => {
        console.log(data);      
        this.subs.unsubscribe();
      }, (error: any) => { if(error.status == 408) console.log('HAHAHA'); this.subs.unsubscribe();});
  }
}
