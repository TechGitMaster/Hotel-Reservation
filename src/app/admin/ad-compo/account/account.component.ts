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

  constructor(private service: AdServiceService) { }

  arr_data!: Array<Array<string>>;
  subs!: Subscription;
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
      let pass = result.data[4][1] as string;

      pass.split('').forEach((d) => {
        this.passConvert += '*';
      });

      result.data[4][1] = this.passConvert;
      this.arr_data = result.data;

    }, (error) => {
      this.subs.unsubscribe();
      location.reload();
    });
  }


  changePass(): void{
    this.service.openCall(new Array<any>("ChangePassAdmin"));
  }

  addAccount(): void{
    this.service.account_emitter();
  }
}
