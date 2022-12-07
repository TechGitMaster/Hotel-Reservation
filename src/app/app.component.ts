import { AfterViewInit, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, Subscription } from 'rxjs';
import {  NavigationEnd, Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { MainServiceService } from './main_serivce/main-service.service';
import { register, login, googleDataUser, timeDate } from './objects';
import { HostListener } from '@angular/core';
import { notification_user } from './objects';
import * as e from 'express';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit{
  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    this.condition_admin_user = false;
    this.condition_header = true;
    this.condition_router_outlet = false;
    
    setTimeout(() => {
      location.reload();
    }, 100);
  }


  condition_router_outlet: boolean = true;

  subs!: Subscription;
  condition_admin_user!: boolean;
  condition_login!: boolean;
  condition_login_signup_clicked!: string;
  condition_clicked_signup!: string;
  condition_appointment!: boolean;
  condition_footer!: boolean;
  condition_header!: boolean;
  condition_menu!: boolean;
  clicked_handle!: string;
  notification_icon!: string;
  menubar_icon!: string;
  calendar: any = document.querySelector('.calendar');
  condition_clickedmonth!: boolean;
  formGroup_signup!: FormGroup;
  formGroup_login!: FormGroup;
  formGroup_setAppointment!: FormGroup;
  formGroup_forgotPassword!: FormGroup;
  formGroup_newPassword!: FormGroup;
  formGroup_verifyAdmin!: FormGroup;
  errorLoginArr!: Array<Array<any>>;
  errorSignupArr!: Array<Array<any>>;
  condition_signin!: boolean;
  condition_adminNotAdmin!: boolean;
  condition_OTP!: boolean;
  handle_email_OTP!: string;
  errArrForgotPassword!: Array<Array<any>>;
  showSuccessfully_request!: boolean;
  handle_fullname!: string;
  handle_email!: string;
  typeOfAccount_close: boolean = false;
  condition_fromPaymentLogin: boolean = false;
  termsAndCondition: boolean = false;

  month_names: Array<string> = new Array<string>('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 
  'Dec');
  seeNotArr_password: Array<boolean> = new Array<boolean>(false, false, false);

  month_names_final!: Array<Array<string>>;

  day_numbers!: Array<Array<string>>;

  timeDate!: timeDate;
  timeAvailable!: Array<any>;

  currDate: Date = new Date();
  
  curr_month = {value: this.currDate.getMonth()}
  curr_year = {value: this.currDate.getFullYear()}

  year_selected!: string;
  month_select!: string;
  day_select!: string;
  count_0day!: number;

  finalAppointment_date!: Array<string>;
  day_year_month_selected!: Array<string>;

  constructor(public http: HttpClient, private router: Router, private cookieservice: CookieService,
    private formBuilder: FormBuilder, private service: MainServiceService){} 

  ngOnInit(){
    this.service.voided_appointment();
    this.showSuccessfully_request = false;
    this.condition_admin_user = false;
    this.condition_menu = false;
    this.condition_login = false;
    this.condition_login_signup_clicked = 'login';
    this.condition_clicked_signup = 'false';
    this.condition_signin = false;
    this.condition_adminNotAdmin = false;
    this.condition_OTP = false;
    this.handle_email_OTP = '';
    this.clicked_handle = 'home';
    this.notification_icon = "assets/icon/bell.png";
    this.menubar_icon = "/assets/icon/menu.png";
    this.handle_fullname = '';
    this.handle_email = '';


    this.count_0day = 0;
    this.timeAvailable = new Array<any>();
    this.finalAppointment_date = new Array<string>("", "am");

    
    let dates = new Date();
    this.day_year_month_selected = new Array<string>(`${dates.getDate()}`, `${this.month_names[dates.getMonth()]}`, `${dates.getFullYear()}`);

    this.condition_clickedmonth = false;
    this.day_numbers = new Array<Array<string>>();

    //Disable past month_________________________________________________
    this.disableMonths();

    //Error login_______________________________________________
    this.errorLoginArr = new Array<Array<any>>(['email', false], ['password', false]);
    this.errorSignupArr = new Array<Array<any>>(['firstname', false], ['lastname', false], ['contact-number', false], 
    ['email', false], ['password', false], ['gender', false], ['admin password', false], ['confirmPass', false]);

    //Error forgot password_________________________________________
    this.errArrForgotPassword = new Array<Array<any>>(['', false], ['', false]);

    //Forms_____________________________________________________
    this.formGroup_login = this.formBuilder.group({
      email: ['abpadillamail@gmail.com'],
      password: ['YF9ac466i1AwQwkb@']
    });

    this.formGroup_signup = this.formBuilder.group({
      firstname:[''],
      lastname:[''],
      contactnumber:[''],
      email:[''],
      password:[''],
      confirmPass: [''],
      adminPassword: ['']
    });

    this.formGroup_setAppointment = this.formBuilder.group({
      fullname: [''],
      fName: [''],
      lName: [''],
      email: [''],
      numberguest: [''],
      contactnumber: [''],
      letusknown: [''],
      time: ['']
    });

    this.formGroup_forgotPassword = this.formBuilder.group({
      email: [''],
      verify: ['']
    });

    this.formGroup_newPassword = this.formBuilder.group({
      newPassword: [''],
      verifyPassword: ['']
    });

    this.formGroup_verifyAdmin = this.formBuilder.group({
      verfiyOTP: ['']
    });

    //checking if the link is contact-us.. then hide "set appointment"________________________
    this.condition_appointment = false;
    this.condition_footer = false;
    this.condition_header = false;
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.clicked_handle = this.router.url.split('/')[2];
        if(this.router.url === '/mc/contact-us'){
          this.condition_appointment = true;
        }else if(this.router.url === '/mc/user-account'){
          this.condition_appointment = true;
          this.condition_footer = true;
          this.condition_header = true;
        }
      }
    });

    this.checkingAdminUser();
  }

  ngAfterViewInit(): void {
  }





  //Notification checking______________________________________________________________________________________________________________
  subs_notification!: Subscription;
  nums: number = 0;
  notifi_numberCon: boolean = false;
  handle_notifi_numb: string = '';

  countAll_noti = 0;
  clicked_noti: boolean = false;
  arr_notification: Array<notification_user> = new Array<notification_user>();
  loading_message: string = '';
  notification_checking(): void{
    if(this.subs_notification != null) this.subs_notification.unsubscribe();

    this.subs_notification = this.service.listen().subscribe((res) => {
      if(res === this.handle_email){
        this.getNotification_checking(true);
      }
    });
  }

  getNotification_checking(condition: boolean): void{
    //Checking________
    if(condition){
      var subs = this.service.getNotification_clicked(this.handle_email).subscribe((ress) => {
        subs.unsubscribe();

        if(ress.response === 'success'){
          if(!this.clicked_noti){
            this.notifi_numberCon = true;
            this.handle_notifi_numb = ress.count < 10 ? `0${ress.count}`: `${ress.count}`;
          }else{
            this.loading_message = 'Loading...';
            this.arr_notification = new Array<notification_user>();
            subs = this.service.change_clickedNoti(this.handle_email).subscribe(() => {
              subs.unsubscribe();
              this.getNotification_checking(false);
            }, (err) => {
              subs.unsubscribe();
              location.reload();
            });
          }
        } 

      }, (err) => {
        subs.unsubscribe();
        location.reload();
      });
    }else{

      //get notification__________________________________________
      var subs = this.service.getNotification(0, 3).subscribe((ress) => {
        subs.unsubscribe();

        if(ress.response === 'success'){
          this.countAll_noti = ress.count;
          this.arr_notification = ress.data;
        }else{
          this.loading_message = 'Empty Notification.';
        }

      }, (err) => {
        subs.unsubscribe();
        location.reload();
      });
    }
  }

  //Notification icon click bttn________________________________________________________
  notiClick(): void{  
    if(!this.clicked_noti){
      this.clicked_noti = true;
      this.loading_message = 'Loading...';
      this.arr_notification = new Array<notification_user>();
      this.notifi_numberCon = false;


      var subs = this.service.change_clickedNoti(this.handle_email).subscribe(() => {
        subs.unsubscribe();
        this.getNotification_checking(false);
      }, (err) => {
        subs.unsubscribe();
        location.reload();
      });
    }else{
      this.clicked_noti = false;
    }
  }

  //checking the date and also if it's new___________________________________
  checking(condition: boolean, dates: string): string{

    let str = '';

    let date = new Date();
    let handle_date = dates.split(',')[1].split(' ');

    if(handle_date[0] === this.month_names[date.getMonth()] && handle_date[1] === ''+date.getDate() &&
      handle_date[2] === ''+date.getFullYear()){
        str = (condition ? 'new': dates.split(',')[0]);
    }else{
      str = (condition ? '': dates);
    }

    return str;
  }

  //Delete bttn notificaition____________________________________________________________
  deletes(numb: number): void{
    var subs = this.service.deleteNotication(this.arr_notification[numb]._id).subscribe((result) => {
      subs.unsubscribe();

      this.loading_message = 'Loading...';
      this.arr_notification = new Array<notification_user>();
      this.getNotification_checking(false);

    }, (err) => {
      subs.unsubscribe();
      location.reload();
    });
  }


  //_____________________________________________________________________________________________________________________________






  //The subscribe still running but it will only stop once the EventEmitter is emitting and start again__________________________________
  //not-found.components will give the EventEmitter a data_____________________________
  //Successfully send request will show when the EventEmitter activate______________________________
  subsEventEmitter!: Subscription;
  subsSuccessShow!: Subscription;
  subsComponent!: Subscription;
  subsNotexpired!: Subscription;
  subsFromPayment!: Subscription;
  con_expired: boolean = false;
  callWaiting():void{

    //When the token is not expired or expired in payment____________________________________________________
    this.subsNotexpired = this.service.notexpired_Payment.subscribe((res) => {
      this.unsubscribe_Event();
      this.con_expired = true;
      this.condition_admin_user = res;
      this.callWaiting();
    });

    //When it's unkown link and token expired in payment__________________________________________
    this.subsEventEmitter = this.service.dataSTR.subscribe(() => {
      this.unsubscribe_Event();

      this.condition_appointment = true;
      this.callWaiting();
    });


    //Appointment and Inquery success send_________________________________________
    this.subsSuccessShow = this.service.showSuccess.subscribe(() => {
      this.unsubscribe_Event();

      this.showSuccessfully_request = true;

      this.callWaiting();
    });

    //When the user click the component from "Account settings"______________________
    this.subsComponent = this.service.menubarComponent.subscribe((result) => {
      this.unsubscribe_Event();

      this.condition_header = false;

      if(result !== 'contact-us'){
        this.condition_admin_user = true;
        this.condition_appointment = false;
      }else{
        this.condition_admin_user = true;
      }

      this.callWaiting();
    });


    //This is to login the user when from payment__________________________________
    this.subsFromPayment = this.service.login_from_payment.subscribe(() => {
      this.unsubscribe_Event();

      this.condition_fromPaymentLogin = true;
      this.funcSignIn('true');

      this.callWaiting();
    });

  }

  unsubscribe_Event(): void{
    this.subsFromPayment.unsubscribe();
    this.subsSuccessShow.unsubscribe();
    this.subsEventEmitter.unsubscribe();
    this.subsComponent.unsubscribe();
    this.subsNotexpired.unsubscribe();
  }

  //Checking if admin or normal_user _____________________________________________________________________
  checkingAdminUser(): void{
    var token = this.cookieservice.get('token');

    this.callWaiting();

    if(token !== '' && token !== ' '){
      
      this.subs = this.service.checkingToken().subscribe((result) => {
        this.subs.unsubscribe();
        if(result.response !== 'no-data'){
          if(result.data.adminNot === 'admin'){
           
            //admin_______________________
            this.condition_admin_user = false;
            this.condition_clicked_signup = 'false';
          }else{
            //normal-user ____________________
            //home page____________________
            this.handle_fullname = result.data_info.fullName;
            this.handle_email = result.data.email;
            

            //Auto fill set appointment______________________________
            this.formGroup_setAppointment = this.formBuilder.group({
              fullname: [result.data_info.fullName],
              fName: [(result.data_info.firstname === '' ? result.data_info.fullName.split(' ')[0]:result.data_info.firstname)],
              lName: [(result.data_info.lastname  === '' ? result.data_info.fullName.split(' ')[1]:result.data_info.lastname)],
              email: [result.data_info.email],
              numberguest: [''],
              contactnumber: [result.data_info.contactnumber],
              letusknown: [''],
              time: ['']
            });

            this.condition_login = true;
            if(!this.con_expired)this.condition_admin_user = true;
            this.getNotification_checking(true);
            this.notification_checking();
            this.availableDate();
          }
        }else{
          this.cookieservice.deleteAll('/');
          if(!this.con_expired)this.condition_admin_user = true;
          this.availableDate();
        }
      }, (err) => {
        
        this.subs.unsubscribe();
        this.cookieservice.deleteAll('/');
        if(!this.con_expired)this.condition_admin_user = true;
        this.availableDate();
      });
    }else{
      this.cookieservice.deleteAll('/');
      if(!this.con_expired) this.condition_admin_user = true;
      this.availableDate();
    }
  }


  //Getting the not available date and time, for set appointment_____________________________________________________________
  array_data_notAvailable: Array<any> = new Array<any>();
  array_time_available: Array<any> = new Array<any>();

  //get the available time and not available date___________________________________
  availableDate(): void{
    this.subs = this.service.gettingDate().subscribe((res) => {
      this.subs.unsubscribe();
      this.timeDate = res.data;
      this.array_data_notAvailable = this.timeDate.DATE;
      
      this.availableTime(true);
      this.generateCalendar(this.curr_month.value, this.curr_year.value);    
    });
  }

  //Get not available time______________________________________________________________________
  availableTime(condition: boolean): void{
    this.timeAvailable = new Array<any>();
    setTimeout(() => {
      let doc = <HTMLSelectElement>document.querySelector('.ds_DF');
      doc.selectedIndex = 0;
      let doc2 = <HTMLSelectElement>document.querySelector('.ds_APM');
      doc2.selectedIndex = condition ? 0:1;
  
      this.finalAppointment_date = new Array<string>("", "am");
      this.finalAppointment_date[1] = condition ? 'am':'pm';
  
      this.array_time_available = new Array<any>();
      
      let arr_months = new Array<string>('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec');
      let date = new Date();

      this.subs = this.service.gettingTime(`${this.day_year_month_selected[1]} ${this.day_year_month_selected[0]} ${this.day_year_month_selected[2]}`).subscribe(async (result) => {
        let month = arr_months.indexOf(this.day_year_month_selected[1]);
        let day = parseInt(this.day_year_month_selected[0]);
        let year = parseInt(this.day_year_month_selected[2]);
        let time_tempos = new Array<any>();
        
        this.subs.unsubscribe();
        if(result.response === 'success'){
          if(condition){
  
            //FOR AM SCANNING IF AVAILABLE__________________________________________________
            for await(let time of this.timeDate.AM){
              let cond = true;
  
              //AM checking if already reserved__________________________________________________
              for await(let data of result.data){
                let split = data.timeDate.split(',');
                let split2 = split[0].split(' ');
                if(split2[1] === 'am'){
                  if(time === data.time){
                    cond = false;
                    time_tempos.push([time, 'reserved']);
                    break;
                  }
                }
              }
  
              //AM checking pass time_____________________________________________________________
              if(cond){
                let time_c = time.split(':');
                let hrs_c = parseInt(time_c[0]);
                let mns_c = parseInt(time_c[1]);
                
                if(year == date.getFullYear() && month == date.getMonth() && day == date.getDate()){
                  if(date.getHours() < 12){
                    if(hrs_c <= date.getHours()){
                      if(mns_c < date.getMinutes()){
                        cond = false;
                        time_tempos.push([time, 'passT']);
                      }
                    }
                  }else{
                    cond = false;
                    time_tempos.push([time, 'passT']);
                  }
                }
              }

              if(cond){
                time_tempos.push([time, 'true']);
              }
            }
  
            this.timeAvailable = time_tempos;
          }else{
  
  
            //FOR PM SCANNING IF AVAILABLE____________________________________________________
            for await(let time of this.timeDate.PM){
              let cond = true;
  
              //PM checking if already reserved__________________________________________________
              for await(let data of result.data){
                let split = data.timeDate.split(',');
                let split2 = split[0].split(' ');
                if(split2[1] === 'pm'){
                  if(time === data.time){
                    cond = false;
                    time_tempos.push([time, 'reserved']);
                    break;
                  }
                }
              }

              //PM checking pass time_____________________________________________________________
              if(cond){
                let time_c = time.split(':');
                let hrs_c = parseInt(time_c[0]);
                let mns_c = parseInt(time_c[1]);
                
                if(year == date.getFullYear() && month == date.getMonth() && day == date.getDate()){
                  if(date.getHours() < 17){
                    if(hrs_c <= date.getHours()){
                      if(mns_c < date.getMinutes()){
                        cond = false;
                        time_tempos.push([time, 'passT']);
                      }
                    }
                  }else{
                    cond = false;
                    time_tempos.push([time, 'passT']);
                  }
                }
              }
  
              if(cond){
                time_tempos.push([time, 'true']);
              }
            }
  
            //Converting... Example 13:00 pm it must be 01:00 pm_____________________________________________________
            let arr_tempo = new Array<any>();
            for await(let data of time_tempos){
              let arr_time = data[0].split(':');
              let date_num = parseInt(arr_time[0]);
              if(date_num > 12){
                arr_tempo.push([`0${date_num-12}:${arr_time[1]}`, data[1]]);
              }else{
                arr_tempo.push([data[0], data[1]]);
              }
            }
            this.timeAvailable = arr_tempo;
  
          }
        }else{
          if(condition){
            //AM________________________
            for await(let time of this.timeDate.AM){
              let cond = true;

              //AM checking pass time_____________________________________________________________
              let time_c = time.split(':');
              let hrs_c = parseInt(time_c[0]);
              let mns_c = parseInt(time_c[1]);
                
              if(year == date.getFullYear() && month == date.getMonth() && day == date.getDate()){
                if(date.getHours() < 12){
                  if(hrs_c <= date.getHours()){
                    if(mns_c < date.getMinutes()){
                      cond = false;
                      time_tempos.push([time, 'passT']);
                    }
                  }
                }else{
                  cond = false;
                  time_tempos.push([time, 'passT']);
                }
              }

              if(cond){
                time_tempos.push([time, 'true']);
              }

              this.timeAvailable = time_tempos;
            }
          }else{
            //PM_______________________
            //FOR PM SCANNING IF AVAILABLE____________________________________________________
            for await(let time of this.timeDate.PM){
              let cond = true;

              //PM checking pass time_____________________________________________________________
              let time_c = time.split(':');
              let hrs_c = parseInt(time_c[0]);
              let mns_c = parseInt(time_c[1]);
                
              if(year == date.getFullYear() && month == date.getMonth() && day == date.getDate()){
                if(date.getHours() < 17){
                  if(hrs_c <= date.getHours()){
                    if(mns_c < date.getMinutes()){
                      cond = false;
                      time_tempos.push([time, 'passT']);
                    }
                  }
                }else{
                  cond = false;
                  time_tempos.push([time, 'passT']);
                }
              }
  
              if(cond){
                time_tempos.push([time, 'true']);
              }

              //Converting... Example 13:00 pm it must be 01:00 pm_____________________________________________________
              let arr_tempo = new Array<any>();
              for await(let data of time_tempos){
                let arr_time = data[0].split(':');
                let date_num = parseInt(arr_time[0]);
                if(date_num > 12){
                  arr_tempo.push([`0${date_num-12}:${arr_time[1]}`, data[1]]);
                }else{
                  arr_tempo.push([data[0], data[1]]);
                }
              }

              this.timeAvailable = arr_tempo;
            }
          }
        }
      });
    }, 200);
  }


  clickAM_PMS(event: any): void{
    
    if(event.target.value.toLowerCase() === 'am' || event.target.value.toLowerCase() === 'pm'){
      if(event.target.value.toLowerCase() === 'am'){
        this.availableTime(true);
      }else{
        this.availableTime(false);
      }
    }else{
      this.availableTime(true);
    }
  }

  //Click time____________________________________________________________________________
  timeClick(): void{
    let AM = this.timeDate.AM.filter((time) => { return time == this.formGroup_setAppointment.value.time});

    //convert PM to 24 hrs time_______________________________________________________________________________
    let PM = new Array<any>();
    if(this.finalAppointment_date[1] === 'pm'){

      let strA = this.formGroup_setAppointment.value.time.split(':');
      let final_converted_pm = `${(parseInt(strA[0]) != 12 ? `${Math.floor(12+parseInt(strA[0]))}`:strA[0])}:${strA[1]}`;

      PM = this.timeDate.PM.filter((time) => { return time == final_converted_pm});
    }

    if(AM.length == 1 || PM.length == 1){
      this.finalAppointment_date[0] = this.finalAppointment_date[1] === 'am' ? AM[0]: PM[0];
    }
  }


  //clicked Menu Icon___________________________________________________________
  clickedMenu(condition: boolean): void{
    this.condition_menu = condition;
  }


  //Selected navigation_____________________________________________________________
  funcClickable(condition: string): void{
    this.condition_menu = false;
    this.clicked_noti = false;
    if(condition !== '' && condition !== ' '){
      this.clicked_handle = condition;

      if(this.clicked_handle === 'user-account'){
        this.condition_appointment = true;
        this.condition_footer = true;
        this.condition_header = true;
      }else{
        this.condition_appointment = false;
        this.condition_footer = false;
        this.condition_header = false;
      }

      this.condition_router_outlet = true;
      this.router.navigate([`/mc/${condition}`]);
      //this.router.navigateByUrl(`/mc/${condition}`, {skipLocationChange: true}).then(() => {
      //  this.router.navigate([`/mc/${condition}`]);
      //});
      
    }
  }

  //Sign_in button_____________________________________________________
  funcSignIn(condition: string): void{
    this.termsAndCondition = false;
    this.condition_clicked_signup = condition;
    this.condition_login_signup_clicked = 'login';
    this.condition_menu = false;
    this.condition_adminNotAdmin = false;
    this.seeNotArr_password = new Array<boolean>(false, false, false);
    this.verifyTxt = 'Verify';
    
    this.errorLoginArr = new Array<Array<any>>(['email', false], ['password', false]);
    this.errorSignupArr = new Array<Array<any>>(['firstname', false], ['lastname', false], ['contact-number', false], 
    ['email', false], ['password', false], ['gender', false], ['admin password', false], ['confirmPass', false]);

    this.formGroup_signup = this.formBuilder.group({
      firstname:[''],
      lastname:[''],
      contactnumber:[''],
      email:[''],
      password:[''],
      confirmPass: [''],
      adminPassword: ['']
    });

    this.formGroup_verifyAdmin = this.formBuilder.group({
      verfiyOTP: ['']
    });
    
    this.errArrForgotPassword = new Array<Array<any>>(['', false], ['', false]);  
  }

  //Create One button__________________________________________________
  createOneForgotLogin(condition: string): void{
    this.termsAndCondition = false;
    this.condition_login_signup_clicked = condition;
  }

  //Click Privacy and policy_____________________________________________
  privacy_policy(): void{
    this.termsAndCondition = !this.termsAndCondition ? true: false;
  }


  //Login button_______________________________________________________
  stringToken_admin: string = '';
  expiredDate!: Date;
  loginbttn(): void{
    const obj_data = {
      email: this.formGroup_login.value.email,
      password: this.formGroup_login.value.password,
    } as login;

    this.errorLoginArr[0][1] = false;
    this.errorLoginArr[1][1] = false;
    if(obj_data.email.length > 0 && obj_data.password.length > 0){
      this.subs = this.service.login(obj_data).subscribe((result) => {
        this.subs.unsubscribe();
        if(result.response !== 'no-data' && result.response !== 'wrong-password'){
          this.expiredDate = new Date();
          this.expiredDate.setDate( this.expiredDate.getDate() + 1 );

          //if not admin refresh the browser________________________________________________
          if(result.adminNot === 'admin') {
            if(!this.condition_fromPaymentLogin){
              this.stringToken_admin = result.tokens;

              this.condition_clicked_signup = 'true';
              this.condition_login_signup_clicked = 'adminOTP';
              
              console.log(""+result.otp);

            }else{
              this.condition_login_signup_clicked = 'loginFromadmin';
            }
          }else {
            this.cookieservice.set('token', result.tokens, { expires: this.expiredDate, path: '/', sameSite: 'Strict'});
            if(!this.condition_fromPaymentLogin) {
              location.reload();
            }else{
              this.condition_login_signup_clicked = 'sorryToKeepWaiting';
            }
          };

        }else if(result.response === 'wrong-password'){
          //wrong password___________________
          this.errorLoginArr[1][0] = "Wrong password please try again!";
          this.errorLoginArr[1][1] = true;
        }else{
          //no data_________________________
          this.errorLoginArr[0][0] = "Please check your email and try again!";
          this.errorLoginArr[1][0] = "Please check your password and try again!";
          this.errorLoginArr[0][1] = true;
          this.errorLoginArr[1][1] = true;
        }
      });
    }else{
      this.errorLoginArr[0][0] = "Please Fill up the email input field!";
      this.errorLoginArr[1][0] = "Please Fill up the password input field!";
      if(obj_data.email.length == 0 && obj_data.password.length == 0){
        this.errorLoginArr[0][1] = true;
        this.errorLoginArr[1][1] = true;
      }else if(obj_data.email.length == 0){
        this.errorLoginArr[0][1] = true;
      }else{
        this.errorLoginArr[1][1] = true;
      }
    }
  }

  
  //Function button admin or not admin_______________________________________
  adminNotAdmin(condition: boolean): void{
    this.condition_adminNotAdmin = condition;
  }


  //Function password icon see or not_________________________________________
  passSeeNot(condition: string): void{
   if(condition === 'pass'){
    if(!this.seeNotArr_password[0]){
      this.seeNotArr_password[0] = true;
    }else{
      this.seeNotArr_password[0] = false;
    }
   }else{
    if(!this.seeNotArr_password[1]){
      this.seeNotArr_password[1] = true;
    }else{
      this.seeNotArr_password[1] = false;
    }
   }
  }


  //Sign in with Google button_______________________________________________
  signInWithGoogle(){

    var expiredDate = new Date();
    expiredDate.setDate( expiredDate.getDate() + 1 );

    if(!this.condition_signin){
      this.condition_signin = true;

      //get the data of user from google_____________________________________________________________
      this.subs = this.service.googleService().subscribe(({fullName, email, response}: googleDataUser) => {
        this.subs.unsubscribe();
        if(response !== 'no-data'){

          //Checking if the Email is already exist_________________________________________________________________
          this.subs = this.service.checkingEmail(email).subscribe((data) => {
            this.subs.unsubscribe();

            if(data.response === 'no-data'){

              //if the email is not exist create an account, login and get the token_____________________________________________________
              this.subs = this.service.gmailRegister({ firstname: '', lastname: '', contact_number: '', email: email, password: '', gender: ''} as register,
              fullName).subscribe((datas) => {

                this.subs.unsubscribe();
                this.cookieservice.set('token', datas.tokens, { expires: expiredDate, path: '/', sameSite: 'Strict'});
                //refresh browser________________________________________________
                if(!this.condition_fromPaymentLogin) {
                  location.reload();
                }else{
                  this.funcSignIn('false');
                }
              });
            }else{

              //get the email of user and convert it to token_____________________________________________________
              this.subs = this.service.gmailLogin({ email: email, password: '' } as login).subscribe((datas) => {
                this.subs.unsubscribe();
                this.cookieservice.set('token', datas.tokens, { expires: expiredDate, path: '/', sameSite: 'Strict'});
                //refresh browser________________________________________________
                if(!this.condition_fromPaymentLogin) {
                  location.reload();
                }else{
                  this.funcSignIn('false');
                }
              });
            }
          });
        }else{
          this.condition_signin = false;
        }
      });
    }
  }

  //SingUp button______________________________________________________
  FuncsignUp(): void{
    const gender = <HTMLSelectElement> document.querySelector('.formselect');
    const obj_data = {
      firstname: this.formGroup_signup.value.firstname,
      lastname: this.formGroup_signup.value.lastname,
      contact_number: this.formGroup_signup.value.contactnumber,
      email: this.formGroup_signup.value.email,
      password: this.formGroup_signup.value.password,
      confirmPass: this.formGroup_signup.value.confirmPass,
      gender: gender.value
    } as register;
    
    this.errorSignupArr = new Array<Array<any>>(['firstname', false], ['lastname', false], ['contact-number', false], 
    ['email', false], ['password', false], ['gender', false], ['admin password', false], ['confirmPass', false]);

      //Checking all input field if empty or not_____________________________________________________
      if(this.checkingField(obj_data)){
        
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
                      
                      this.subs = this.service.checkingAdminpassword(this.formGroup_signup.value.adminPassword).subscribe((result) => {
                        this.subs.unsubscribe();
                        
                        if(result.response !== 'no'){
                          this.creatingAccount(obj_data, 'admin');
                        }else{
                          this.errorSignupArr[6][0] = "Please check the admin password and try again!";
                          this.errorSignupArr[6][1] = true;
                        }

                      });

                    }else{
                      if(this.termsAndCondition){
                        this.creatingAccount(obj_data, 'not-admin');
                      }else{
                        this.errorSignupArr[6][0] = "Please check the Terms and condition!";
                          this.errorSignupArr[6][1] = true;
                      }
                    }
                  }

                }else{
                  this.errorSignupArr[3][0] = "This Email is already exist!";
                  this.errorSignupArr[3][1] = true;
                }
              });
            }else{
              this.errorSignupArr[3][0] = "The Email is undefined!";
              this.errorSignupArr[3][1] = true;
            }
      
    }

  }

  //creating account func________________________________________________
  creatingAccount(obj_data: register, adminNot: string): void{

     //Finally creating account of user_____________________________________________________
     this.subs = this.service.register(obj_data, adminNot).subscribe((result) => {

      this.subs.unsubscribe();
      
      this.condition_login_signup_clicked = "successCreated";

    }, (err) => console.log(err));
  }

  //Set Appointment button______________________________________________
  errAppointment: Array<Array<any>> = new Array<Array<any>>(['', false], ['', false], ['', false], ['', false], ['', false], ['', false], ['', false], ['', false]);
  submitAppointment(): void{
    this.errAppointment = new Array<Array<any>>(['', false], ['', false], ['', false], ['', false], ['', false], ['', false], ['', false], ['', false]);

    if(this.checkingAInputField()){
      if(this.finalAppointment_date[0] !== ''){

        let dateArrival = `${this.finalAppointment_date[0]} ${this.finalAppointment_date[1]},${this.day_year_month_selected[1]} ${this.day_year_month_selected[0]} ${this.day_year_month_selected[2]}`;
        this.subs = this.service.sendAppointment(this.formGroup_setAppointment, dateArrival, this.date_converting(), 'appointment', this.textarea_details, this.transaction_ID()).subscribe((res) => {
          this.subs.unsubscribe();
          this.showSuccessfully_request = true;

          this.formGroup_setAppointment = this.formBuilder.group({
            fullname: [''],
            fName: [''],
            lName: [''],
            email: [''],
            numberguest: [''],
            contactnumber: [''],
            letusknown: [''],
            time: ['']
          });

          setTimeout(() => {
            let doc = <HTMLSelectElement>document.querySelector('.ds_DF');
            doc.selectedIndex = 0;
          }, 500);
          
          this.finalAppointment_date = new Array<string>("", this.finalAppointment_date[1]);
          //this.day_year_month_selected = new Array<string>("", "", "");
          //this.day_year_month_selected[0] = "0";

          this.numGuest_func();

        }, (err) => {
          this.subs.unsubscribe();
          location.reload();
        });

      }else{
        this.errAppointment[4] = ['Please select a time!', true];
      }
    }
  }

  //Get date converted____________________________________________________________________________________________
  date_converting(): string{
    let date = new Date();

    //Hours_________________________________________
    let hours = date.getHours()
    let converted_hours = (hours < 13 ? hours: (hours-12));
    let converted_hours2 = ( new String(converted_hours).split('').length == 1 ? `0${converted_hours}`:converted_hours);

    //AM-PM__________________________________________
    let amPm = (hours < 12 ? 'am':'pm');

    //Minutes___________________________________________
    let minutes = date.getMinutes();
    let converted_minutes = (minutes >= 10 ? minutes:`0${minutes}`);

    //month______________________________________________
    let arr_months = new Array<string>('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec');

    return `${converted_hours2}:${converted_minutes} ${amPm},${arr_months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
  }

  //Transaction ID maker and information________________________________________________________
  transaction_ID(): any{

    //Details guest______________________________________________________________
    
    const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let transaction_id = '#';

    //Letter random________________________________
    for(let count = 0;count < 5;count++){
      transaction_id += alphabet[Math.floor(Math.random() * alphabet.length)];

      if(count+1 == 5){
        //Number random______________________________
        for(let count2 = 0;count2 < 4;count2++){
          transaction_id += `${Math.floor((Math.random() * 9))}`;

          if(count2 == 3){
            return transaction_id;
          }
        }
      }
    }
  }

  //ADD GUEST______________________________________________________________________________________

  //Guest details check bttn_______________________________________________________________
  cond_check: boolean = true;
  arr_details!: Array<any>;
  countD: number = 1;
  countGuest!: number;
  textarea_details: string = '';
  boolean_close: boolean = false;
  GDetails_check(): void{
    this.textarea_details = '';
    this.countGuest = parseInt(this.formGroup_setAppointment.value.numberguest);    
    this.arr_details = new Array<any>();
    if(!this.cond_check){
      this.cond_check = true;
      for(this.countD = 1;this.countD < this.countGuest;this.countD++){
        this.arr_details.push([ '', '', '' ]);
      }
    }else{
      this.cond_check = false;
      this.countD = 1;
    }
  }

  ex_GDetails(numb: number): void{
    let INFO_dtails = document.querySelectorAll('.INFO_dtails > div');
    INFO_dtails.item(numb).remove();
    this.arr_details.splice(numb);
    this.countD -= 1;

    if(this.countD == 1){
      let doc = <HTMLInputElement> document.querySelector('#flexCheckChecked');
      doc.checked = false;
      this.cond_check = false;
    }
  } 

  addGuest(): void{
    this.arr_details.push([ '', '', '' ]);
    this.countD += 1;
  }

  updateArr_fill(numb_child: number, numb_parent: number, event: any): void{

    if(numb_child == 2){
      let doc = <HTMLInputElement>document.querySelector(`.forminput_details_${numb_parent}`);
      doc.value = doc.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
    }

    this.arr_details[numb_parent][numb_child] = event.target.value;
  }

  //_________________________________________________________________________________________________


  //Selection guest count func__________________________________________
  numGuest_func(): void{
    //let doc = <HTMLInputElement>document.querySelector('.checkGuest');
    //doc.checked = false;
    //this.cond_check = false;
    this.countD = 1;
    this.textarea_details = '';

    this.countGuest = parseInt(this.formGroup_setAppointment.value.numberguest);    
    this.arr_details = new Array<any>();
    for(this.countD = 1;this.countD < this.countGuest;this.countD++){
      this.arr_details.push([ '', '', '' ]);
    }
  }

  //Checking appointment input field_______________________________________________
  checkingAInputField(): boolean{
    let condition = true;
    this.textarea_details = '';

    //this.formGroup_setAppointment.value.fullname
    if(this.formGroup_setAppointment.value.fName !== '' && this.formGroup_setAppointment.value.fName !== ' '){

      if(this.formGroup_setAppointment.value.fName.length <= 20){

        if(this.formGroup_setAppointment.value.lName !== '' && this.formGroup_setAppointment.value.lName !== ' '){
          if(this.formGroup_setAppointment.value.lName.length <= 20){

            this.formGroup_setAppointment.value.fullname = this.formGroup_setAppointment.value.fName+" "+this.formGroup_setAppointment.value.lName;

            if((/[@]/).test(this.formGroup_setAppointment.value.email) && (/[.]/).test(this.formGroup_setAppointment.value.email)){
              if((/^\d+$/).test(this.formGroup_setAppointment.value.numberguest) && this.formGroup_setAppointment.value.numberguest.length > 0){
    
                let condition_GuestHave = true;
                if(this.countD > 1) {
                  for(let count = 0;count < this.arr_details.length;count++){
                    if(this.arr_details[count][0] === '' || this.arr_details[count][1] === '' || this.arr_details[count][2] === ''){
                      this.errAppointment[5][0] = "Check the input field on guest names!";
                      this.errAppointment[5][1] = true;
                      condition = false;   
                      condition_GuestHave = false;
                    }else{
                      this.textarea_details += 
                        `${this.arr_details[count][0]+' '+this.arr_details[count][1]},${this.arr_details[count][2]}${count != this.arr_details.length-1 ? '\n':''}`
                    }
                  }
                }
      
                if(condition_GuestHave){
                  if(this.formGroup_setAppointment.value.contactnumber.length != 0){
                    let removeWhite = this.formGroup_setAppointment.value.contactnumber.replaceAll(' ','');
                    if(removeWhite.length != 11){
                      this.errAppointment[3] = ['Contact number must exact 11 length!', true];
                      condition = false;
                      condition_GuestHave = false;
                    }
                  }else{
                    this.errAppointment[3] = ['Empty input field!', true];
                    condition = false;
                    condition_GuestHave = false;
                  }
                }
    
                if(condition_GuestHave){
                  if(this.formGroup_setAppointment.value.letusknown.length > 200){
                    this.errAppointment[6] = ['Max character is 200 length!', true];
                    condition = false;
                    condition_GuestHave = false;
                  }
                }
      
              }else{
                if(this.formGroup_setAppointment.value.numberguest.length == 0){
                  this.errAppointment[2] = ['Select how many guest!', true];
                  condition = false;
                }else{
                  this.errAppointment[2] = ['Only numbers need!', true];
                  condition = false;
                }
              }
            }else{
              this.errAppointment[1] = ['Check email again!', true];
              condition = false;
            }

          }else{
            this.errAppointment[7] = ['Max character is 20 length!', true];
            condition = false;
          }
        }else{
          this.errAppointment[7] = ['Empty input field!', true];
          condition = false;
        }

      }else{
        this.errAppointment[0] = ['Max character is 20 length!', true];
        condition = false;
      }
    }else{
      this.errAppointment[0] = ['Empty input field!', true];
      condition = false;
    }
    return condition;
  }

  //For appointment____________________________________________________________
  funcOnlyNumber(condition: boolean): void{
    if(!condition){
      let guestNum = <HTMLInputElement>document.querySelector('.guestNum');
      guestNum.value = guestNum.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
    }else{
      let contact = <HTMLInputElement>document.querySelector('.contacts');
      contact.value = contact.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');

      this.formGroup_setAppointment.value.contactnumber = contact.value;
    }
  }

  //For Signup________________________________________________________________
  funcOnlyNumber_signup(): void{
    let contacts_signup = <HTMLInputElement>document.querySelector('.contacts_signup');
    contacts_signup.value = contacts_signup.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');

    this.formGroup_signup.value.contactnumber = contacts_signup.value;
  }

  //For Admin OTP________________________________________________________________
  funcOnlyNumber_OTPAdmin(): void{
    let otpAdmin = <HTMLInputElement>document.querySelector('.otpAdmin');
    otpAdmin.value = otpAdmin.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');

    this.formGroup_verifyAdmin.value.verfiyOTP = otpAdmin.value;
  }

  //FORGOT PASSWORD__________________________________________________________________________________________________


  //send OTP code___________________________________________________
  sendOTTxt: string = 'Get OTP';
  sendOTP(): void{
      const email = this.formGroup_forgotPassword.value.email;

      this.errArrForgotPassword = new Array<Array<any>>(['', false], ['', false]);

      if(email !== '' && email !== ' '){
        if((/[@]/).test(email) && (/[.]/).test(email)){
          
          if(this.sendOTTxt === 'Get OTP'){

            this.sendOTTxt = 'Sending..';

            this.subs = this.service.sendOTP(email).subscribe((result) => {
              this.subs.unsubscribe();
              this.sendOTTxt = 'Get OTP';
              
              if(result.response === 'success'){
      
                this.condition_OTP = true;
                this.handle_email_OTP = email;
      
              }else{
                this.errArrForgotPassword[0] = ["The Email is undefined!", true];
              }
            }, (err) => { this.sendOTTxt = 'Get OTP'; console.log(err) });
          }
        }else{
          this.errArrForgotPassword[0] = ["The Email is undefined!", true];
        }
      }else{
        this.errArrForgotPassword[0] = ['Please Fill up the email input field!', true];
      }
  }


  //Verify OTP code________________________________________________________
  verifyTxt: string = 'Verify';
  verfiyOTP(): void{
    var verify = this.formGroup_forgotPassword.value.verify;
    this.errArrForgotPassword = new Array<Array<any>>(['', false], ['', false]);
    
    if(this.verifyTxt === 'Verify'){
      if(verify !== '' && verify !== ' '){
        if((/^\d+$/).test(verify)){
            this.verifyTxt = 'Verifying..';

            this.subs = this.service.verifyCode(this.handle_email_OTP, verify).subscribe((result) => {
              this.subs.unsubscribe();
              this.verifyTxt = 'Verify';

              if(result.response === 'success'){
                this.condition_login_signup_clicked = 'changePassword';
              }else if(result.response === 'no-data'){

              }else{
                this.errArrForgotPassword[1] = ['Incorrect code. Try again!', true];
              }
            });
        }else{
        this.errArrForgotPassword[1] = ['No letter included. Just a number!', true];
        }
      }else{
        this.errArrForgotPassword[1] = ['Please Fill up the verify input field!', true];
      }
    }
  }

  //Verifying code for admin__________________________________________________________________
  subs_adminOTP!: Subscription;
  verfiyOTP_admin(): void{
    let value_vf = this.formGroup_verifyAdmin.value.verfiyOTP;
    this.errArrForgotPassword = new Array<Array<any>>(['', false], ['', false]);

    if(this.verifyTxt !== 'Verifying..'){
      if(value_vf.length > 0){
        if((/^\d+$/).test(value_vf)){
            this.verifyTxt = 'Verifying..';

            this.subs_adminOTP = this.service.verifyCode(this.formGroup_login.value.email, value_vf).subscribe((result: any) => {
    
              this.subs.unsubscribe();
              this.verifyTxt = 'Verify';

              if(result.response === 'success'){
                this.cookieservice.set('token', this.stringToken_admin, { expires: this.expiredDate, path: '/', sameSite: 'Strict'});
                this.condition_admin_user = false;
                this.condition_clicked_signup = 'false';
                  
                location.reload();

              }else if(result.response === 'no-data'){

              }else{
                this.errArrForgotPassword[0] = ['Incorrect code. Try again!', true];
              }
            });
        }else{
          this.errArrForgotPassword[0] = ['No letter included. Just a number!', true];
        }
      }else{
        this.errArrForgotPassword[0] = ['Please Fill up the verify input field!', true];
      }
    }
  }

  //Change password_______________________________________________________________________
  changingTXT: string = "Change";
  changePassword(): void{
      const { newPassword, verifyPassword } = this.formGroup_newPassword.value;
      this.errArrForgotPassword = new Array<Array<any>>(['', false], ['', false]);

      if((newPassword !== '' && newPassword !== ' ') && (verifyPassword !== '' && verifyPassword !== ' ')){

        if(this.passStrength(newPassword)){

          if(newPassword === verifyPassword){

            if(this.handle_email_OTP !== ''){

              if(this.changingTXT === 'Change'){
                this.changingTXT = 'Changing..';
                this.subs = this.service.changePassword(this.handle_email_OTP, newPassword).subscribe((result) => {
                  this.subs.unsubscribe();
                  this.changingTXT = 'Change';

                  if(result.response === 'success'){
                    this.condition_login_signup_clicked = "successChange";
                  }
                });
              }
            }else{
              this.errArrForgotPassword[0] = ['No email. Refresh the browser!', true];
            }
          }else{
            this.errArrForgotPassword[0] = ['Please check the 2 input field. It must be same!', true];
            this.errArrForgotPassword[1] = ['Please check the 2 input field. It must be same!', true];
          }
        }else{
          this.errArrForgotPassword[0] = [this.errorSignupArr[4][0], true];
        }
      }else{

        if((newPassword === '' || newPassword === ' ') && (verifyPassword === '' || verifyPassword === ' ')){
          this.errArrForgotPassword[0] = ['Please Fill up the input field!', true];
          this.errArrForgotPassword[1] = ['Please Fill up the input field!', true];
        }else if((newPassword === '' && newPassword === ' ')){
          this.errArrForgotPassword[0] = ['Please Fill up the input field!', true];
        }else{
          this.errArrForgotPassword[1] = ['Please Fill up the input field!', true];
        }
        
      }
  }


  //Success alert_________________________________________________
  successChange(): void{
    this.condition_clicked_signup = 'false';
  }











  //___________________________________________________________________________________________________________________


  isLeapYear(year: any): any {
      return (year % 4 === 0 && year % 100 !== 0 && year % 400 !== 0) || (year % 100 === 0 && year % 400 ===0)
  }
  
  getFebDays(year: any): any{
      return this.isLeapYear(year) ? 29 : 28;
  }
  

  availableTime_All: Array<any> = new Array<any>();
  availableTime_ForRed(condition: boolean, months: number, days: number, years: number): any{
    return new Promise((resolve, reject) => {
      let arr_months = new Array<string>('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec');
      let date = new Date();

      let arr_TempoHandle = new Array<any>();
      this.subs = this.service.gettingTime(`${arr_months[months]} ${days} ${years}`).subscribe(async (result) => {
        let month = months;
        let day = days;
        let year = years;
        let time_tempos = new Array<any>();
        
        this.subs.unsubscribe();
        if(result.response === 'success'){
          if(condition){
  
            //FOR AM SCANNING IF AVAILABLE__________________________________________________
            for await(let time of this.timeDate.AM){
              let cond = true;
  
              //AM checking if already reserved__________________________________________________
              for await(let data of result.data){
                let split = data.timeDate.split(',');
                let split2 = split[0].split(' ');
                if(split2[1] === 'am'){
                  if(time === data.time){
                    cond = false;
                    time_tempos.push([time, 'reserved']);
                    break;
                  }
                }
              }
  
              //AM checking pass time_____________________________________________________________
              if(cond){
                let time_c = time.split(':');
                let hrs_c = parseInt(time_c[0]);
                let mns_c = parseInt(time_c[1]);
                
                if(year == date.getFullYear() && month == date.getMonth() && day == date.getDate()){
                  if(date.getHours() < 12){
                    if(hrs_c <= date.getHours()){
                      if(mns_c < date.getMinutes()){
                        cond = false;
                        time_tempos.push([time, 'passT']);
                      }
                    }
                  }else{
                    cond = false;
                    time_tempos.push([time, 'passT']);
                  }
                }
              }

              if(cond){
                time_tempos.push([time, 'true']);
              }
            }
  
            this.availableTime_All.push(time_tempos);
          }else{
  
  
            //FOR PM SCANNING IF AVAILABLE____________________________________________________
            for await(let time of this.timeDate.PM){
              let cond = true;
  
              //PM checking if already reserved__________________________________________________
              for await(let data of result.data){
                let split = data.timeDate.split(',');
                let split2 = split[0].split(' ');
                if(split2[1] === 'pm'){
                  if(time === data.time){
                    cond = false;
                    time_tempos.push([time, 'reserved']);
                    break;
                  }
                }
              }

              //PM checking pass time_____________________________________________________________
              if(cond){
                let time_c = time.split(':');
                let hrs_c = parseInt(time_c[0]);
                let mns_c = parseInt(time_c[1]);
                
                if(year == date.getFullYear() && month == date.getMonth() && day == date.getDate()){
                  if(date.getHours() < 17){
                    if(hrs_c <= date.getHours()){
                      if(mns_c < date.getMinutes()){
                        cond = false;
                        time_tempos.push([time, 'passT']);
                      }
                    }
                  }else{
                    cond = false;
                    time_tempos.push([time, 'passT']);
                  }
                }
              }
  
              if(cond){
                time_tempos.push([time, 'true']);
              }
            }
  
            //Converting... Example 13:00 pm it must be 01:00 pm_____________________________________________________
            let arr_tempo = new Array<any>();
            for await(let data of time_tempos){
              let arr_time = data[0].split(':');
              let date_num = parseInt(arr_time[0]);
              if(date_num > 12){
                arr_tempo.push([`0${date_num-12}:${arr_time[1]}`, data[1]]);
              }else{
                arr_tempo.push([data[0], data[1]]);
              }
            }
            arr_TempoHandle = arr_tempo;
          }
          this.availableTime_All.push(arr_TempoHandle);
        }else{
          if(condition){
            //AM________________________
            for await(let time of this.timeDate.AM){
              let cond = true;

              //AM checking pass time_____________________________________________________________
              let time_c = time.split(':');
              let hrs_c = parseInt(time_c[0]);
              let mns_c = parseInt(time_c[1]);
                
              if(year == date.getFullYear() && month == date.getMonth() && day == date.getDate()){
                if(date.getHours() < 12){
                  if(hrs_c <= date.getHours()){
                    if(mns_c < date.getMinutes()){
                      cond = false;
                      time_tempos.push([time, 'passT']);
                    }
                  }
                }else{
                  cond = false;
                  time_tempos.push([time, 'passT']);
                }
              }

              if(cond){
                time_tempos.push([time, 'true']);
              }

              arr_TempoHandle = time_tempos;
            }

            this.availableTime_All.push(arr_TempoHandle);
          }else{
            //PM_______________________
            //FOR PM SCANNING IF AVAILABLE____________________________________________________
            for await(let time of this.timeDate.PM){
              let cond = true;

              //PM checking pass time_____________________________________________________________
              let time_c = time.split(':');
              let hrs_c = parseInt(time_c[0]);
              let mns_c = parseInt(time_c[1]);
                
              if(year == date.getFullYear() && month == date.getMonth() && day == date.getDate()){
                if(date.getHours() < 17){
                  if(hrs_c <= date.getHours()){
                    if(mns_c < date.getMinutes()){
                      cond = false;
                      time_tempos.push([time, 'passT']);
                    }
                  }
                }else{
                  cond = false;
                  time_tempos.push([time, 'passT']);
                }
              }
  
              if(cond){
                time_tempos.push([time, 'true']);
              }

              //Converting... Example 13:00 pm it must be 01:00 pm_____________________________________________________
              let arr_tempo = new Array<any>();
              for await(let data of time_tempos){
                let arr_time = data[0].split(':');
                let date_num = parseInt(arr_time[0]);
                if(date_num > 12){
                  arr_tempo.push([`0${date_num-12}:${arr_time[1]}`, data[1]]);
                }else{
                  arr_tempo.push([data[0], data[1]]);
                }
              }
              arr_TempoHandle = arr_tempo;
            }

            this.availableTime_All.push(arr_TempoHandle);
          }
        }

        setTimeout(resolve, 50);
      });
    });
  }

  async generateCalendar(month: any, year: any) {
  
    this.count_0day = 0;
    this.day_numbers = new Array<Array<string>>();
  
      let days_of_month = [31, this.getFebDays(year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

  
      let currDate = new Date()
      if (!month) month = currDate.getMonth()
      if (!year) year = currDate.getFullYear()
  
      let curr_month = `${this.month_names[month]}`
      this.year_selected = `${year}`;
      this.month_select = curr_month;
  
      // get first day of month
      
      if(this.day_year_month_selected[0] === ""){
        this.day_year_month_selected[1] = this.month_select;
        this.day_year_month_selected[2] = this.year_selected;
      }

      let first_day = new Date(year, month, 1)

      for (let i = 0; i <= days_of_month[month] + first_day.getDay() - 1; i++) {
        var condition = false;
        
        if (i >= first_day.getDay()) {
          
          //Disable past days on current month____________________________________________________________
          if(year === currDate.getFullYear() && month === currDate.getMonth()){
            if(((i - first_day.getDay() + 1) >= currDate.getDate())){
              condition = true;
            }
          }else{
            condition = true;
          }

          //Check not available days____________________________________________________________
          for(var count = 0;count < this.array_data_notAvailable.length;count++){
            if(`${(i - first_day.getDay() + 1)}` === this.array_data_notAvailable[count].day && 
            `${ month }` === this.array_data_notAvailable[count].month && 
            `${ this.year_selected }` === this.array_data_notAvailable[count].year){
              condition = false;
            }
          }
          
          let conditionFor_noTime = false;
          if(condition){
            let conditiont_f = true;
            for(let timeF = 1;timeF <= 2;timeF++){
              await this.availableTime_ForRed((conditiont_f ? conditiont_f = false: conditiont_f = true), month, (i - first_day.getDay() + 1), year);
  
              if(timeF == 2){
                console.log(this.availableTime_All);
                for(let count_FA = 0;count_FA < this.availableTime_All.length;count_FA++){
                  for(let countDD = 0;countDD < this.availableTime_All[count_FA].length;countDD++){
                    if(this.availableTime_All[count_FA][countDD][1] === 'true'){
                      conditionFor_noTime = true;
                    }
                  }
                }
                this.availableTime_All = new Array<any>();
              }
            }
          }else{
            conditionFor_noTime = true;
          }
          
          var array = new Array<string>( `${(i - first_day.getDay() + 1)}`, `${(conditionFor_noTime ? condition:'no_time')}`);

          this.day_numbers.push(array);

        }else{
          this.count_0day += 1;
          this.day_numbers.push(new Array<string>("", ""));
        }
    }
  }
  
  month_list:any = document.querySelector('.month-list');
  
  numshandlePickDay: number = 0;

  daypick(index: string, condition: string){
    if(condition === 'true'){
      this.day_year_month_selected[0] = index;
      this.day_year_month_selected[1] = this.month_select;
      this.day_year_month_selected[2] = this.year_selected;

      this.availableTime(true);
    }
  }

  daypick_hover(numbCondition: string, condition: string, mouseCondition: string){
    if(condition === 'true'){
      if(mouseCondition === 'mouseover'){
        this.numshandlePickDay = parseInt(numbCondition);
      }else{
        this.numshandlePickDay = 0;
      }
    }
  }

  month_picker: any = document.querySelector('#month-picker')
  
  
  clickMonthPicker(){
    this.condition_clickedmonth = true;
  }

  calenpick(index:number, condition: string){
    if(condition === "true"){
      this.condition_clickedmonth = false;
      this.curr_month.value = index;
  
      this.generateCalendar(index, this.curr_year.value)
    }
  }

  curr_year_condition = this.curr_year.value;

  prevtxt: string = "";
  nextxt: string = ">";
  
  async prevyear(){
    if((this.curr_year.value-1) == this.curr_year_condition){
      --this.curr_year.value;

      this.day_numbers = Array<Array<string>>();

      this.prevtxt = "";
      this.nextxt = ">";
      
      var prev = document.querySelector('.preprev');
      var next = document.querySelector('.prenext')
      var prevDocu = <HTMLParagraphElement>prev;
      var nextDocu = <HTMLParagraphElement>next;

      nextDocu.style.cursor = "pointer";
      prevDocu.style.cursor = "none";

      //Disable past month_________________________________________________
      await this.disableMonths();
      
      this.generateCalendar(this.curr_month.value, this.curr_year.value)
    }
  }

  nextyear(){
    if((this.curr_year.value+1) == (this.curr_year_condition+1)){
  
      ++this.curr_year.value;

      this.day_numbers = Array<Array<string>>();

      this.prevtxt = "<";
      this.nextxt = "";

      var prev = document.querySelector('.preprev');
      var next = document.querySelector('.prenext');
      var prevDocu = <HTMLParagraphElement>prev;
      var nextDocu = <HTMLParagraphElement>next;

      nextDocu.style.cursor = "none";
      prevDocu.style.cursor = "pointer";
      
      this.month_names_final = new Array<Array<string>>();

      //Enable past month_________________________________________________
      this.month_names.forEach((month) => {
        this.month_names_final.push(new Array<string>(month, 'true'));
      });

      this.generateCalendar(this.curr_month.value, this.curr_year.value)
    }
  }


  disableMonths(): void{
    this.month_names_final = new Array<Array<string>>();

    //Disable past month_________________________________________________
    var condition = false;
    for(var count = 0;count < this.month_names.length;count++){
      var array = new Array<string>();
      array.push(this.month_names[count]);
      if(this.month_names[count] === this.month_names[this.currDate.getMonth()]){
        condition = true;
      }

      array.push(`${condition}`);

      this.month_names_final.push(array);
    }
  }


  //Follow link us__________________________________________________________________________________________________
  linkFollowus(count: number): void{
    let link = '';
    switch(count){
      case 1:
        link = "https://www.facebook.com/profile.php?id=100086738842410";
      break;
      case 2:
        link = "https://www.instagram.com/abe_manhattan";
      break;
      case 3:
        link = "https://www.twitter.com/abe_manhattan";
      break;
    }

    window.open(link);
  }
 

  //Checking all input field if empty______________________________________________________________________________
  checkingField(data: register): boolean{
    let condition = true;
    if(data.firstname !== '' && data.firstname !== ' '){
      if(data.firstname.length <= 15){

        if(data.lastname !== '' && data.lastname !== ' '){
          if(data.lastname.length <= 20){

            if(data.contact_number !== '' && data.contact_number !== ' '){
              if(data.contact_number.length == 11){

                if(data.email !== '' && data.email !== ' '){
    
                  if(data.password !== '' && data.password !== ' '){

                    if(data.confirmPass !== '' && data.confirmPass !== ' '){

                      if(data.password === data.confirmPass){
                        if(data.gender === 'Male' || data.gender === 'Female' || data.gender === 'Prefer not to say'){
    
                          if(this.condition_adminNotAdmin && this.formGroup_signup.value.adminPassword === '' || this.formGroup_signup.value.adminPassword === ' '){
                            this.errorSignupArr[6][0] = 'Please Fill up the password input field!';
                            this.errorSignupArr[6][1] = true;
                            condition = false;
                          } 
        
                        }else{
                          this.errorSignupArr[5][0] = "Please select your gender!";
                          this.errorSignupArr[5][1] = true;
                        }
                      }else{
                        this.errorSignupArr[7][0] = 'Not same password!';
                        this.errorSignupArr[7][1] = true;
                        this.errorSignupArr[4][0] = "Not same password!";
                        this.errorSignupArr[4][1] = true;
                        condition = false;
                      }

                    }else{
                      this.errorSignupArr[7][0] = 'Please Fill up the confirm password input field!';
                      this.errorSignupArr[7][1] = true;
                      condition = false;
                    }
    
                  }else{
                    this.errorSignupArr[4][0] = "Please Fill up the password input field!";
                    this.errorSignupArr[4][1] = true;
                    condition = false;
                  }        
    
              
                }else{
                  this.errorSignupArr[3][0] = "Please Fill up the email input field!";
                  this.errorSignupArr[3][1] = true;
                  condition = false;
                }
              }else{
                if(!(/\s/g).test(data.contact_number)){
                  this.errorSignupArr[2][0] = "Contact number must exact 11 length!";
                  this.errorSignupArr[2][1] = true;
                  condition = false;
                }
              }


            }else{
              this.errorSignupArr[2][0] = "Please Fill up the contact-number input field!";
              this.errorSignupArr[2][1] = true;
              condition = false;
            }

          }else{
            this.errorSignupArr[1][0] = "Max character is 20 length!";
            this.errorSignupArr[1][1] = true;
            condition = false;
          }

        }else{
          this.errorSignupArr[1][0] = "Please Fill up the lastname input field!";
          this.errorSignupArr[1][1] = true;
          condition = false;
        }

      }else{
        this.errorSignupArr[0][0] = "Max character is 15 length!";
        this.errorSignupArr[0][1] = true;
        condition = false;
      }
    }else{
      this.errorSignupArr[0][0] = "Please Fill up the firstname input field!";
      this.errorSignupArr[0][1] = true;
      condition = false;
    }


    return condition;
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
              txtErr = "The password must contain special characters!";
            }
          }else{
            condition = false;
            txtErr = "The password must contain numeric values!";
          }
        }else{
          condition = false;
          txtErr = "The password must contain uppercase characters!";
        }
      }else{
        condition = false;
        txtErr = "The password must contain lowercase characters!";
      }
    }else{
      condition = false;
      txtErr = "Length must be greater than 8 or equal to 8!";
    }

    this.errorSignupArr[4][0] = txtErr;
    this.errorSignupArr[4][1] = condition ? false: true;

    return condition;
  }





}
