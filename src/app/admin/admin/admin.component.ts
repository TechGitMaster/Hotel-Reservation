import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Subscription } from 'rxjs';
import { AdServiceService } from '../ad-service.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  constructor(private route: Router, private service: AdServiceService, private formBuild: FormBuilder, private cookieservice: CookieService) { }

  str_name!: string;

  num_selectionCondition!: number;
  arr_route!: Array<string>;
  conditionFixDiv: boolean = false;
  conditionFixDiv2: boolean = false;
  conditionSeeImage: boolean = false;

  subs!: Subscription;
  subs_rooms!: Subscription;
  subs_name!: Subscription;

  arrHandle: Array<any> = new Array<any>("", "", "", 0, 0);
  arrLink: Array<string> = new Array<string>("/ad/admin/inbox-mail", "/ad/admin/schedules", "/ad/admin/rooms", "/ad/admin/reservations", "/ad/admin/account");

  errArrPassword!: Array<Array<any>>;
  condition_forPassword!: boolean;
  formGroup_newPassword!: FormGroup;

  slidesStore: Array<string> = new Array<string>("https://cloudinary.com/console/c-9b3c2829918a5648a364c53cc49833/media_library/folders/home/asset/8003ae4935bbf364f99759586513f950/manage?context=manage");
  
  ngOnInit(): void {
    this.str_name = '';
    this.errArrPassword = new Array<Array<any>>([false, ""], [false, ""]);
    this.condition_forPassword = false;

    this.num_selectionCondition = this.arrLink.indexOf(this.route.url) > -1 ? this.arrLink.indexOf(this.route.url): 0;

    this.arr_route = new Array<string>("inbox-mail", "schedules", "rooms", "reservations", "account", "");

    this.formGroup_newPassword = this.formBuild.group({
      currentPass: [''],
      newPass: ['']
    });
    

    this.getName();
  }

  //Logout bttn________________________________________________________________________
  logOut(): void{
    this.cookieservice.deleteAll('/');
    location.reload();
  }

  //Get name of admin________________________________________________________________
  getName(): void{
    this.subs_name = this.service.getNameAdmin().subscribe((result) => {
      this.subs_name.unsubscribe();

      this.str_name = result.data.fullName;

      this.calling();
    }, (err) => {
      this.subs_name.unsubscribe();
      location.reload();
    })
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

      if(this.arrHandle[0] === 'deleteEvent'){
        this.cancelDelete(true);
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

  //Move to trash event__________________________________________________________
  moveToTrash(): void{
    this.conditionFixDiv = false;
    this.service.backEmitters(new Array<any>(true, true, true));
  }


  //Choose Delete or cancel event_________________________________________________________
  conditionTo_cancelDeleteSched: boolean = false;
  cancelDelete(condition: boolean): void{
    this.conditionTo_cancelDeleteSched = condition;
    if(!condition){
      this.arrHandle = new Array<any>("haveSame", "Cancel Event", "Are you sure you want to cancel this event?");
    }else{
      this.arrHandle = new Array<any>("haveSame", "Delete Event", "Are you sure you want to delete this event?");
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
    this.service.backEmitters(new Array<any>(true, condition, this.conditionTo_cancelDeleteSched));
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


  //Yes or No Reservation_______________________________________________________________
  string_condition: string = '';
  arr_reservation = ["", ""];
  deleteCancel_Reservation(condition: boolean): void{
    if(condition){
      this.conditionFixDiv2 = false;
      this.boolean_reservation = false;
      if(this.string_condition === 'delete'){
        this.service.backCall(new Array<any>("delete"));
      }else{
        this.service.backCall(new Array<any>("cancelReservation"));
      }
    }else{
      this.boolean_reservation = false;
      this.service.backCall(new Array<any>("notDeleteCancel"));
    }
  }

  //Close reservation and room_____________________________________________________________
  boolean_reservation: boolean = false;
  funcCloseReseroom(condition: boolean): void{
    if(this.arrHandle[0] !== 'progress'){
      this.conditionFixDiv2 = false;
      this.service.backCall(new Array<any>("notDeleteCancel"));
    }
  }

  funcDelete_reservation(condition: boolean): void{
    if(condition){
      this.string_condition = 'delete';
      this.arr_reservation[0] = "Delete request";
      this.arr_reservation[1] = "Are you sure you want to delete this request?";
      this.boolean_reservation = true;
    }else{
      this.conditionFixDiv2 = false;
      this.boolean_reservation = false;
      this.service.backCall(new Array<any>("moveTo_trash"));
    }
  }

  funcCancel_Reservation(condition: boolean): void{
    if(condition){
      this.string_condition = 'cancel';
      this.arr_reservation[0] = "Cancel request";
      this.arr_reservation[1] = "Are you sure you want to Cancel this request?";
      this.boolean_reservation = true;
    }else{
      this.conditionFixDiv2 = false;
      this.boolean_reservation = false;
      this.service.backCall(new Array<any>("Retrieve"));
    }
  }

  //close image_____________________________________________________________________________
  closeImage(): void{
   this.conditionSeeImage = false;
   if(this.arrHandle[0] === 'seeImage') this.conditionFixDiv2 = false;
  }


}
