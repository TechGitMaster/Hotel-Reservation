import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdServiceService } from '../ad-service.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  constructor(private route: Router, private service: AdServiceService) { }


  num_selectionCondition!: number;
  arr_route!: Array<string>;
  conditionFixDiv: boolean = false;

  subs!: Subscription;

  arrHandle: Array<any> = new Array<any>("", "", "", 0, 0);

  ngOnInit(): void {
    this.num_selectionCondition = 0;
    this.arr_route = new Array<string>("inbox-mail", "schedules", "rooms", "account", "");

    this.calling();
  }


  calling(): void{
    this.subs = this.service.showEmitter.subscribe((result) => {
      this.conditionFixDiv = true;
      this.subs.unsubscribe();

      this.arrHandle = result;
      this.calling();
    });
  }


  funcSelected(number: number): void{
    this.num_selectionCondition = number;
    if(number != 4){
      this.route.navigate([`/ad/admin/${this.arr_route[number]}`]);
    }
  }

  //Close div timer__________________________________________________________
  funcErase(): void{
    this.conditionFixDiv = false;
    this.service.backEmitters(new Array<any>( false ));
  }

  yesNO(condition: boolean): void{
    this.conditionFixDiv = false;
    this.service.backEmitters(new Array<any>(true, condition));
  }


  //Set timer_____________________________________________________
  set(): void{
    try{
      let hours = <HTMLInputElement>document.querySelector('.hourss');
      let minutes = <HTMLInputElement>document.querySelector('.minutess');
      let hours_manupulate = hours.value;
      let minutes_manipulate = minutes.value;

      if(this.arrHandle[1] === 'Morning'){

        if(hours.value.length <= 2 && minutes.value.length <= 2 && 
          (parseInt(hours.value) >= 9 && parseInt(hours.value) <= 11) && 
          (parseInt(minutes.value) <= 59)){

  
          if(parseInt(minutes_manipulate) < 10){
            minutes_manipulate = "0"+parseInt(minutes_manipulate);
          } 
  
          if(parseInt(hours_manupulate) < 10){
            hours_manupulate = "0"+parseInt(hours_manupulate);
          }
  
          this.conditionFixDiv = false;
          this.service.backEmitters(new Array<any>( true, hours_manupulate, minutes_manipulate ));
        }else{
          if(hours.value.length > 2 || (parseInt(hours.value) < 9 || parseInt(hours.value) > 11)){
            hours.value = "";
          }else{
            minutes.value = "";
          }
        }
      }else{
        if(hours.value.length <= 2 && minutes.value.length <= 2 &&
          (parseInt(hours.value) >= 12 && parseInt(hours.value) <= 16) &&
          (parseInt(minutes.value) <= 59)){

            if(parseInt(minutes_manipulate) < 10){
              minutes_manipulate = "0"+parseInt(minutes_manipulate);
            }

            this.conditionFixDiv = false;
            this.service.backEmitters(new Array<any>( true, hours_manupulate, minutes_manipulate ));
        }else{
          if(hours.value.length > 2 || (parseInt(hours.value) < 12 || parseInt(hours.value) > 16)){
            hours.value = "";
          }else{
            minutes.value = "";
          }
        }
      }

    }
    catch(e){
      console.log(e);
    }

  }


  funcOnInputHours(): void{
    let hours = <HTMLInputElement>document.querySelector('.hourss');
    hours.value = hours.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
  }

  funcOnInputMinutes(): void{
    let minutess = <HTMLInputElement>document.querySelector('.minutess');
    minutess.value = minutess.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
  }


}
