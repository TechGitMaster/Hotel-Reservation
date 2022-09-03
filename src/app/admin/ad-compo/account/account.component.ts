import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Subscription } from 'rxjs';
import { AdServiceService } from '../../ad-service.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  constructor(private service: AdServiceService, private cookieService: CookieService) { }

  arr_data!: Array<Array<string>>;
  subs!: Subscription;
  handPass!: string;
  passConvert!: string;

  hiddenNot_src!: string;
  condition_hiddenNot!: boolean;

  ngOnInit(): void {
    this.arr_data = new Array<Array<any>>();
    this.hiddenNot_src = "/assets/icon/hidden.png";
    this.condition_hiddenNot = false;

    this.subs = this.service.getInformation().subscribe((result) => {
      this.subs.unsubscribe();
      this.passConvert = "";
      this.handPass = result.data[4][1];


      this.handPass.split('').forEach((d) => {
        this.passConvert += '*';
      });

      result.data[4][1] = this.passConvert;
      this.arr_data = result.data;

    }, (error) => {
      this.subs.unsubscribe();
      location.reload();
    });
  }

  
  hiddenNotPass(): void{
    let arr_div = document.querySelectorAll(".rowInfo > div");
    let divChild = arr_div[4].querySelectorAll(".divIn > div");
    let span = divChild[0].querySelectorAll('.da > span');

    let convert = <HTMLSpanElement>span[1];

    if(!this.condition_hiddenNot){
      this.condition_hiddenNot = true;
      this.hiddenNot_src = "/assets/icon/hiddenNot.png";
      convert.innerHTML = this.handPass;
    }else{
      this.condition_hiddenNot = false;
      this.hiddenNot_src = "/assets/icon/hidden.png";
      convert.innerHTML = this.passConvert;
    }
  }

  changePass(): void{
    this.service.openCall(new Array<any>("ChangePassAdmin"));
  }
}
