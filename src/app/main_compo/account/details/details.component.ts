import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MainServiceService } from 'src/app/main_serivce/main-service.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {

  constructor(private service: MainServiceService) { }

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
    this.service.emitCall(new Array<any>("ChangePassAdmin"));
  }
}
