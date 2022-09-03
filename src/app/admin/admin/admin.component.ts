import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdServiceService } from '../ad-service.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  constructor(private route: Router, private service: AdServiceService, private formBuild: FormBuilder) { }


  num_selectionCondition!: number;
  arr_route!: Array<string>;
  conditionFixDiv: boolean = false;
  conditionFixDiv2: boolean = true;
  conditionSeeImage: boolean = true;

  subs!: Subscription;
  subs_rooms!: Subscription;

  arrHandle: Array<any> = new Array<any>("", "", "", 0, 0);
  arrLink: Array<string> = new Array<string>("/ad/admin/inbox-mail", "/ad/admin/schedules", "/ad/admin/rooms", "/ad/admin/reservations", "/ad/admin/account");

  errArrPassword!: Array<Array<any>>;
  condition_forPassword!: boolean;
  formGroup_newPassword!: FormGroup;

  slidesStore: Array<string> = new Array<string>("https://cloudinary.com/console/c-9b3c2829918a5648a364c53cc49833/media_library/folders/home/asset/8003ae4935bbf364f99759586513f950/manage?context=manage");
  
  ngOnInit(): void {
    this.errArrPassword = new Array<Array<any>>([false, ""], [false, ""]);
    this.condition_forPassword = false;

    this.num_selectionCondition = this.arrLink.indexOf(this.route.url) > -1 ? this.arrLink.indexOf(this.route.url): 0;
    this.arr_route = new Array<string>("inbox-mail", "schedules", "rooms", "reservations", "account", "");

    this.formGroup_newPassword = this.formBuild.group({
      currentPass: [''],
      newPass: ['']
    });
    
    this.calling();
  }


  calling(): void{

    //This is for schedule and account call_______________________________________________
    this.subs = this.service.showEmitter.subscribe((result) => {
      this.conditionFixDiv = true;
      this.subs.unsubscribe();
      this.subs_rooms.unsubscribe();

      this.arrHandle = result;

      if(this.arrHandle[0] === 'ChangePassAdmin'){
        this.condition_forPassword = true;
      }

      this.calling();
    });

    //This is for rooms call_________________________________________________________
    this.subs_rooms = this.service.emitShowEmitter.subscribe((result) => {
      this.subs.unsubscribe();
      this.subs_rooms.unsubscribe();

      this.conditionFixDiv2 = true;
      this.arrHandle = result;

      if(this.arrHandle[0] === 'seeImage'){
        this.conditionSeeImage = true;
      }

      this.calling();
    });

  }


  funcSelected(number: number): void{
    this.num_selectionCondition = number;
    if(number != 5){
      this.route.navigate([`/ad/admin/${this.arr_route[number]}`]);
    }
  }



  //Close div timer and yesNo__________________________________________________________
  funcErase(): void{
    if(!this.condition_forPassword){
      this.conditionFixDiv = false;
      this.service.backEmitters(new Array<any>( false ));
    }
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


  //Change Password Button______________________________________________________________________
  subsChange!: Subscription;
  changePassword(): void{
    let current = this.formGroup_newPassword.value.currentPass;
    let newP = this.formGroup_newPassword.value.newPass;

    this.errArrPassword = new Array<Array<any>>([false, ""], [false, ""]);
    if(current.length > 0 && newP.length > 0){
        this.subsChange = this.service.checkingPassword(current).subscribe((data) => {
          this.subsChange.unsubscribe();
          if(data.response === 'success'){
            
            if(this.passStrength(newP)){
              if(current !== newP){
                this.subsChange = this.service.changePasswords(data.email, newP).subscribe(() => {
                  this.subsChange.unsubscribe();
  
                  this.arrHandle[0] = 'popUPChangePassAdmin';
  
                }, (err) => {
                  this.subsChange.unsubscribe();
                  location.reload();
                });
              }else{
                this.errArrPassword[1][0] = true;
                this.errArrPassword[1][1] = "!This is your current password.";
              }
            }
          }else{
            this.errArrPassword[0][0] = true;
            this.errArrPassword[0][1] = "!Please provide a correct password.";
          }


        }, (err) => {
          this.subsChange.unsubscribe();
          location.reload();
        });
    }else{
      this.errArrPassword[0][1] = "!Empty input field.";
      this.errArrPassword[1][1] = "!Empty input field.";

      if(current.length == 0 && newP.length == 0){
        this.errArrPassword[0][0] = true;
        this.errArrPassword[1][0] = true;
        
      }else if(current.length == 0){
        this.errArrPassword[0][0] = true;
      }else{
        this.errArrPassword[1][0] = true;
      }
    }

  }


  successChange(): void{
    location.reload();
  }


  //Validating password strength______________________________________________________________________________
  passStrength(password: string): boolean{
    var condition = true;
    var txtErr = "";
    if(password.length >= 8){
      var regex = /[a-z]/g;
      if(regex.test(password)){
        regex = /[A-Z]/g;
        if(regex.test(password)){
          regex = /[0-9]/g;
          if(regex.test(password)){
            regex =  /\W/g;
            if(!regex.test(password)){
              condition = false;
              txtErr = "!The password must contain special characters";
            }
          }else{
            condition = false;
            txtErr = "!The password must contain numeric values";
          }
        }else{
          condition = false;
          txtErr = "!The password must contain uppercase characters";
        }
      }else{
        condition = false;
        txtErr = "!The password must contain lowercase characters";
      }
    }else{
      condition = false;
      txtErr = "!Length must be greater than 8 or equal to 8";
    }

    if(!condition){
      this.errArrPassword[1][0] = true;
      this.errArrPassword[1][1] = txtErr;
    }

    return condition;
  }


  //Reservation checkin checkout____________________________________________________________________
  dateCheckOutCheckIn(date: string, numbArr: any): string{
    let splits = date.split(' ');
    let str = '';
    if(numbArr.length == 1){
      str = splits[numbArr[0]];
    }else{
      str = splits[numbArr[0]]+' '+splits[numbArr[1]];
    }
    return str;
  }

  //Close reservation and room_____________________________________________________________
  funcCloseReseroom(condition: boolean): void{
    if(!condition){
      if(this.arrHandle[0] !== 'progress'){
        this.conditionFixDiv2 = false;
        this.service.backCall(new Array<any>("notDelete"));
      }
    }else{
      this.conditionFixDiv2 = false;
      this.service.backCall(new Array<any>("delete"));
    }
  }


  //close image_____________________________________________________________________________
  closeImage(): void{
   this.conditionSeeImage = false;
   if(this.arrHandle[0] === 'seeImage') this.conditionFixDiv2 = false;
  }
}
