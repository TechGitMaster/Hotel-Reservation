import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Subscription } from 'rxjs';
import { AdServiceService } from '../ad-service.service';
import { register } from 'src/app/objects';

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
  conditionFixDiv3: boolean = false;
  conditionFixDiv4: boolean = false;
  conditionSeeImage: boolean = false;

  subs!: Subscription;
  subs_rooms!: Subscription;
  subs_appointment!: Subscription;
  subs_account!: Subscription;
  subs_name!: Subscription;


  condition_adminNotAdmin!: boolean;
  condition_signup_clicked!: boolean;
  errorSignupArr!: Array<Array<any>>;
  arrHandle: Array<any> = new Array<any>("", "", "", 0, 0);
  arrLink: Array<string> = new Array<string>("/ad/admin/inbox-mail", "/ad/admin/appointments", "/ad/admin/schedules", "/ad/admin/rooms", "/ad/admin/reservations", "/ad/admin/account");

  errArrPassword!: Array<Array<any>>;
  condition_forPassword!: boolean;
  formGroup_newPassword!: FormGroup;
  formGroup_signup!: FormGroup;
  img_selected: string = '';

  slidesStore: Array<string> = new Array<string>("https://cloudinary.com/console/c-9b3c2829918a5648a364c53cc49833/media_library/folders/home/asset/8003ae4935bbf364f99759586513f950/manage?context=manage");
  
  ngOnInit(): void {
    this.str_name = '';
    this.errArrPassword = new Array<Array<any>>([false, ""], [false, ""]);
    this.condition_forPassword = false;
    this.condition_adminNotAdmin = true;
    this.condition_signup_clicked = false;

    this.num_selectionCondition = this.arrLink.indexOf(this.route.url) > -1 ? this.arrLink.indexOf(this.route.url): 0;

    this.arr_route = new Array<string>("inbox-mail", "appointments", "schedules", "rooms", "reservations", "account", "");
    this.errorSignupArr = new Array<Array<any>>(['firstname', false], ['lastname', false], ['contact-number', false], 
    ['email', false], ['password', false], ['gender', false], ['admin password', false]);

    this.formGroup_newPassword = this.formBuild.group({
      currentPass: [''],
      newPass: ['']
    });

    this.formGroup_signup = this.formBuild.group({
      firstname:[''],
      lastname:[''],
      contactnumber:[''],
      email:[''],
      password:[''],
      adminPassword: ['']
    });
    

    this.getName();
  }

  //Logout bttn________________________________________________________________________
  logoutCondition: boolean = false;
  yesNoLogout(condition: boolean): void{
    if(condition){
      this.cookieservice.deleteAll('/');
      location.reload();
    }else{
      this.logoutCondition = false;
    }
  }

  logOut(): void{
    this.logoutCondition = true;
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
      this.subs_account.unsubscribe();
      this.subs.unsubscribe();
      this.subs_rooms.unsubscribe();
      this.subs_appointment.unsubscribe();

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
      this.subs_account.unsubscribe();
      this.subs.unsubscribe();
      this.subs_rooms.unsubscribe();
      this.subs_appointment.unsubscribe();

      this.conditionFixDiv2 = true;
      this.arrHandle = result;

      if(this.arrHandle[0] === 'seeImage'){
        this.conditionSeeImage = true;
        this.img_selected = this.arrHandle[1];
      }
      this.calling();
    });

    //This is for appointment call_________________________________________________________
    this.subs_appointment = this.service.emitShowEmitter_appointment.subscribe((result) => {
      this.subs_account.unsubscribe();
      this.subs.unsubscribe();
      this.subs_rooms.unsubscribe();
      this.subs_appointment.unsubscribe();

      this.conditionFixDiv3 = true;
      this.arrHandle = result;

      this.calling();
    });

    
    //This is for add account call__________________________________________________________________
    this.subs_account = this.service.emitShowEmitter_account.subscribe(() => {
      this.subs_account.unsubscribe();
      this.subs.unsubscribe();
      this.subs_rooms.unsubscribe();
      this.subs_appointment.unsubscribe();

      this.conditionFixDiv4 = true;

      this.calling();
    });

  }


  checking_ifcanCancelAppointment(date: string): boolean{
    let condition = true;
    let data_slice = date.split(' ');
    let year = parseInt(data_slice[0]);
    let month = parseInt(data_slice[1]);
    let day = parseInt(data_slice[2]);

    let dates_t = new Date(year, month, day);
    let dates_i = new Date();

    if(dates_t.getFullYear() == dates_i.getFullYear()){
      if(dates_t.getMonth() == dates_i.getMonth()){
        if(dates_t.getDate() < dates_i.getDate()){
            condition = false;
        }
      }else if(dates_t.getMonth() < dates_i.getMonth()){
        condition = false;
      }
    }else if(dates_t.getFullYear() < dates_i.getFullYear()){
      condition = false;
    }
    return condition;
  }

  string_fromAdmin_Image: string = 'notFromadmin';
  displayImage(url: string, condition: string): void{
      this.conditionSeeImage = true;
      this.img_selected = url;
      this.string_fromAdmin_Image = condition;
  }

  closeImage(): void{
    this.img_selected='';
    if(this.string_fromAdmin_Image === 'notFromadmin'){
      this.conditionFixDiv2 = false;
    }else{
      this.string_fromAdmin_Image = 'notFromadmin';
    }
  }

  funcSelected(number: number): void{
    this.num_selectionCondition = number;
    if(number != 6){
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

  //Close div for conditionFixDiv_______________________________________________________
  funErases(): void{
    this.conditionFixDiv = false;
    this.service.backEmitters(new Array<any>( false ));
  }

  //Close div timer and yesNo__________________________________________________________
  funcErase(): void{
    if(!this.condition_forPassword){
      this.conditionFixDiv = false;
      this.service.backEmitters(new Array<any>( false ));
    }
  }

  //Alert for do not cancel appointment when it's done___________________________________________
  appointmentCancel_Not(): void{
    alert("You don't need to cancel the appointment because it's done.");
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
      this.conditionFixDiv3 = false;
      this.conditionFixDiv2 = false;
      this.boolean_reservation = false;
      if(this.string_condition === 'delete'){
        this.service.backCall(new Array<any>("delete"));
        this.service.backCall_appointment(new Array<any>("delete"));
      }else{
        this.service.backCall(new Array<any>("cancelReservation"));
        this.service.backCall_appointment(new Array<any>("cancelAppointment"));
      }
    }else{
      this.boolean_reservation = false;
      this.service.backCall(new Array<any>("notDeleteCancel"));
      this.service.backCall_appointment(new Array<any>("notDeleteCancel"));
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
      this.conditionFixDiv3 = false;
      this.boolean_reservation = false;
      this.service.backCall(new Array<any>("moveTo_trash"));
      this.service.backCall_appointment(new Array<any>("moveTo_trash"));
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
      this.conditionFixDiv3 = false;
      this.boolean_reservation = false;
      this.service.backCall(new Array<any>("Retrieve"));
      this.service.backCall_appointment(new Array<any>("Retrieve"));
    }
  }




  //ADD ACCOUNT_______________________________________________________________________________________________
  funcSignIn(condition: string): void{
    this.errorSignupArr = new Array<Array<any>>(['firstname', false], ['lastname', false], ['contact-number', false], 
    ['email', false], ['password', false], ['gender', false], ['admin password', false]);

    this.conditionFixDiv4 = false;
  }


  FuncsignUp(): void{
    const gender = <HTMLSelectElement> document.querySelector('.formselect');
    const obj_data = {
      firstname: this.formGroup_signup.value.firstname,
      lastname: this.formGroup_signup.value.lastname,
      contact_number: this.formGroup_signup.value.contactnumber,
      email: this.formGroup_signup.value.email,
      password: this.formGroup_signup.value.password,
      gender: gender.value
    } as register;
    
    this.errorSignupArr = new Array<Array<any>>(['firstname', false], ['lastname', false], ['contact-number', false], 
    ['email', false], ['password', false], ['gender', false], ['admin password', false]);

      //Checking all input field if empty or not_____________________________________________________
      if(this.checkingField(obj_data)){

          //Checking if contact_number is validate________________________________________________________
          if((/^\d+$/).test(obj_data.contact_number)){
        
            //Checking if email is validate________________________________________________________
            if((/[@]/).test(obj_data.email) && (/[.]/).test(obj_data.email)){

              //Checking if email is already exist to database______________________________________________________
              this.subs = this.service.checkingEmail(obj_data.email).subscribe((result) => {
                this.subs.unsubscribe();
                if(result.response === 'no-data'){
                  
                  //Checking the password strength________________________________________________________
                  if(this.passStrength(obj_data.password)){

                    //check if user enable admin, and check all the current password of admins______________________________________________
                    if(this.condition_adminNotAdmin){
                      this.creatingAccount(obj_data, 'admin');

                    }else{
                      this.creatingAccount(obj_data, 'not-admin');
                    }
                  }

                }else{
                  this.errorSignupArr[3][0] = "!This Email is already exist.";
                  this.errorSignupArr[3][1] = true;
                }
              });
            }else{
              this.errorSignupArr[3][0] = "!The Email is undefined.";
              this.errorSignupArr[3][1] = true;
            }
        }else{
          this.errorSignupArr[2][0] = "!Please check your contact-number";
          this.errorSignupArr[2][1] = true;
        }

    }

  }


  //creating account func________________________________________________
  creatingAccount(obj_data: register, adminNot: string): void{
    //Finally creating account of user_____________________________________________________
    this.subs = this.service.register(obj_data, adminNot).subscribe((result) => {
     this.subs.unsubscribe();
     let doc = <HTMLSelectElement>document.querySelector('.formselect');
     doc.selectedIndex = 0;

     this.condition_signup_clicked = true;
     this.formGroup_signup = this.formBuild.group({
      firstname:[''],
      lastname:[''],
      contactnumber:[''],
      email:[''],
      password:[''],
      adminPassword: ['']
    });
   }, (err) => console.log(err));
 }


 printing_condition: boolean = false;
  printing(): void{
    this.printing_condition = true;
    setTimeout(() => {
      window.print();
      this.printing_condition = false;
    }, 200);
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
      this.errorSignupArr[4][1] = true;
      this.errorSignupArr[4][0] = txtErr;
    }

    return condition;
  }


  //Checking all input field if empty______________________________________________________________________________
  checkingField(data: register): boolean{
    let condition = true;
    if(data.firstname !== '' && data.firstname !== ' '){

      if(data.lastname !== '' && data.lastname !== ' '){

        if(data.contact_number !== '' && data.contact_number !== ' '){

          if(data.email !== '' && data.email !== ' '){

              if(data.password !== '' && data.password !== ' '){

                if(data.gender !== 'Male' && data.gender !== 'Female' && data.gender !== 'Prefer not to say'){
                  this.errorSignupArr[5][0] = "!Please select your gender.";
                  this.errorSignupArr[5][1] = true;
                }

              }else{
                this.errorSignupArr[4][0] = "!Please Fill up the password input field.";
                this.errorSignupArr[4][1] = true;
                condition = false;
              }        

          
          }else{
            this.errorSignupArr[3][0] = "!Please Fill up the email input field.";
            this.errorSignupArr[3][1] = true;
            condition = false;
          }
        }else{
          this.errorSignupArr[2][0] = "!Please Fill up the contact-number input field.";
          this.errorSignupArr[2][1] = true;
          condition = false;
        }
      }else{
        this.errorSignupArr[1][0] = "!Please Fill up the lastname input field.";
        this.errorSignupArr[1][1] = true;
        condition = false;
      }
    }else{
      this.errorSignupArr[0][0] = "!Please Fill up the firstname input field.";
      this.errorSignupArr[0][1] = true;
      condition = false;
    }


    return condition;
  }
}
