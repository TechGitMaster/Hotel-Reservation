import { AfterViewInit, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';  
import { Subscription } from 'rxjs';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { MainServiceService } from './main_serivce/main-service.service';
import { register, login, googleDataUser, timeDate } from './objects';
import { initializeApp } from '@firebase/app';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit{
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
  errorLoginArr!: Array<Array<any>>;
  errorSignupArr!: Array<Array<any>>;
  condition_signin!: boolean;
  condition_adminNotAdmin!: boolean;
  condition_OTP!: boolean;
  handle_email_OTP!: string;
  errArrForgotPassword!: Array<Array<any>>;
  showSuccessfully_request!: boolean;
  handle_fullname!: string;


  month_names: Array<string> = new Array<string>('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 
  'Dec');

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
    ['email', false], ['password', false], ['gender', false], ['admin password', false]);

    //Error forgot password_________________________________________
    this.errArrForgotPassword = new Array<Array<any>>(['', false], ['', false]);

    //Forms_____________________________________________________
    //'kylevelarde374@gmail.com'
    //'kyleAdmin375@gmail.com'
    this.formGroup_login = this.formBuilder.group({
      email: ['kylevelarde374@gmail.com'],
      password: ['YF9ac466i1AwQwkb@']
    });

    this.formGroup_signup = this.formBuilder.group({
      firstname:[''],
      lastname:[''],
      contactnumber:[''],
      email:[''],
      password:[''],
      adminPassword: ['']
    });

    this.formGroup_setAppointment = this.formBuilder.group({
      fullname: [''],
      email: [''],
      numberguest: [''],
      contactnumber: [''],
      letusknown: ['']
    });

    this.formGroup_forgotPassword = this.formBuilder.group({
      email: [''],
      verify: ['']
    });

    this.formGroup_newPassword = this.formBuilder.group({
      newPassword: [''],
      verifyPassword: ['']
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


  //The subscribe still running but it will only stop once the EventEmitter has data__________________________________
  //not-found.comonents will give the EventEmitter a data_____________________________
  //Successfully send request will show when the EventEmitter activate______________________________
  subsEventEmitter!: Subscription;
  subsSuccessShow!: Subscription;
  callWaiting():void{
    this.subsEventEmitter = this.service.dataSTR.subscribe(() => {
      this.subsEventEmitter.unsubscribe();
      this.subsSuccessShow.unsubscribe();
      this.condition_appointment = true;
      this.callWaiting();
    });

    this.subsSuccessShow = this.service.showSuccess.subscribe(() => {
      this.subsSuccessShow.unsubscribe();
      this.subsEventEmitter.unsubscribe();

      this.showSuccessfully_request = true;

      this.callWaiting();
    });
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

            this.handle_fullname = result.fullname;

            this.condition_login = true;
            this.condition_admin_user = true;
            this.availableDate();
          }
        }else{
          this.cookieservice.deleteAll('/');
          this.condition_admin_user = true;
          this.availableDate();
        }
      }, (err) => {
        
        this.subs.unsubscribe();
        this.cookieservice.deleteAll('/');
        this.condition_admin_user = true;
        this.availableDate();
      });
    }else{
      this.cookieservice.deleteAll('/');
      this.condition_admin_user = true;
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

    let doc = <HTMLSelectElement>document.querySelector('.ds_DF');
    doc.selectedIndex = 0;
    let doc2 = <HTMLSelectElement>document.querySelector('.ds_APM');
    doc2.selectedIndex = condition ? 0:1;

    this.finalAppointment_date = new Array<string>("", "am");
    this.finalAppointment_date[1] = condition ? 'am':'pm';

    this.array_time_available = new Array<any>();

    this.subs = this.service.gettingTime(`${this.day_year_month_selected[1]} ${this.day_year_month_selected[0]} ${this.day_year_month_selected[2]}`).subscribe(async (result) => {
    
      this.subs.unsubscribe();
      if(result.response === 'success'){
        let time_tempos = new Array<any>();
        if(condition){

          //AM checking not available__________________________________________________
          for await(let time of this.timeDate.AM){
            let cond = true;

            for await(let data of result.data){
              let split = data.timeDate.split(',');
              let split2 = split[0].split(' ');
              if(split2[1] === 'am'){
                if(time === data.time){
                  cond = false;
                  time_tempos.push([time, false]);
                  break;
                }
              }
            }

            if(cond){
              time_tempos.push([time, true]);
            }
          }

          this.timeAvailable = time_tempos;
        }else{


          //PM checking not available____________________________________________________
          
          for await(let time of this.timeDate.PM){
            let cond = true;

            for await(let data of result.data){
              let split = data.timeDate.split(',');
              let split2 = split[0].split(' ');
              if(split2[1] === 'pm'){
                if(time === data.time){
                  cond = false;
                  time_tempos.push([time, false]);
                  break;
                }
              }
            }

            if(cond){
              time_tempos.push([time, true]);
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
          for await(let data of this.timeDate.AM){
            this.timeAvailable.push([data, true]);
          }
        }else{
          //PM_______________________
          //Converting... Example 13:00 pm it must be 01:00 pm_____________________________________________________
          let arr_tempo = new Array<any>();
          for await(let data of this.timeDate.PM){
            let arr_time = data.split(':');
            let date_num = parseInt(arr_time[0]);
            if(date_num > 12){
              arr_tempo.push([`0${date_num-12}:${arr_time[1]}`, true]);
            }else{
              arr_tempo.push([data, true]);
            }
          }
          this.timeAvailable = arr_tempo;
        }
      }
    });
  }

  //AM and PM click_______________________________________________________________
  async clickAM_PM(condition: boolean){

    if(condition){
      this.availableTime(true);
    }else{  
      this.availableTime(false);
    }
  }

  //Click time____________________________________________________________________________
  timeClick(numb: number): void{
    this.finalAppointment_date[0] = this.finalAppointment_date[1] === 'am' ? this.timeDate.AM[numb]: this.timeDate.PM[numb];
  }


  //clicked Menu Icon___________________________________________________________
  clickedMenu(condition: boolean): void{
    this.condition_menu = condition;
  }


  //Selected navigation_____________________________________________________________
  funcClickable(condition: string): void{
    this.condition_menu = false;
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

      this.router.navigate([`/mc/${condition}`]);
    }
  }

  //Sign_in button_____________________________________________________
  funcSignIn(condition: string): void{
    this.condition_clicked_signup = condition;
    this.condition_login_signup_clicked = 'login';
    this.condition_menu = false;
    this.condition_adminNotAdmin = false;
    
    this.errorLoginArr = new Array<Array<any>>(['email', false], ['password', false]);
    this.errorSignupArr = new Array<Array<any>>(['firstname', false], ['lastname', false], ['contact-number', false], 
    ['email', false], ['password', false], ['gender', false], ['admin password', false]);

    this.errArrForgotPassword = new Array<Array<any>>(['', false], ['', false]);
  }

  //Create One button__________________________________________________
  createOneForgotLogin(condition: string): void{
    this.condition_login_signup_clicked = condition;
  }


  //Login button_______________________________________________________
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
          var expiredDate = new Date();
          expiredDate.setDate( expiredDate.getDate() + 1 );
          this.cookieservice.set('token', result.tokens, { expires: expiredDate, path: '/', sameSite: 'Strict'});

          //if not admin refresh the browser________________________________________________
          if(result.adminNot === 'admin') {
            this.condition_admin_user = false;
            this.condition_clicked_signup = 'false';

            this.router.navigate(['/ad/admin']);
          }else {
            location.reload();
          };

        }else if(result.response === 'wrong-password'){
          //wrong password___________________
          this.errorLoginArr[1][0] = "!Wrong password please try again.";
          this.errorLoginArr[1][1] = true;
        }else{
          //no data_________________________
          this.errorLoginArr[0][0] = "!Please check your email and try again.";
          this.errorLoginArr[1][0] = "!Please check your password and try again.";
          this.errorLoginArr[0][1] = true;
          this.errorLoginArr[1][1] = true;
        }
      });
    }else{
      this.errorLoginArr[0][0] = "!Please Fill up the email input field.";
      this.errorLoginArr[1][0] = "!Please Fill up the password input field.";
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
                location.reload();
              });
            }else{

              //get the email of user and convert it to token_____________________________________________________
              this.subs = this.service.gmailLogin({ email: email, password: '' } as login).subscribe((datas) => {
                this.subs.unsubscribe();
                this.cookieservice.set('token', datas.tokens, { expires: expiredDate, path: '/', sameSite: 'Strict'});
                //refresh browser________________________________________________
                location.reload();
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
                      
                      this.subs = this.service.checkingAdminpassword(this.formGroup_signup.value.adminPassword).subscribe((result) => {
                        this.subs.unsubscribe();
                        console.log(result);
                        
                        if(result.response !== 'no'){
                          this.creatingAccount(obj_data, 'admin');
                        }else{
                          this.errorSignupArr[6][0] = "!Please check the admin password and try again.";
                          this.errorSignupArr[6][1] = true;
                        }

                      });

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
      
      this.condition_clicked_signup = 'false';

    }, (err) => console.log(err));
  }

  //Set Appointment button______________________________________________
  errAppointment: Array<Array<any>> = new Array<Array<any>>(['', false], ['', false], ['', false], ['', false], ['', false]);
  submitAppointment(): void{
    this.errAppointment = new Array<Array<any>>(['', false], ['', false], ['', false], ['', false], ['', false]);

    if(this.checkingAInputField()){
      if(this.finalAppointment_date[0] !== ''){

        let dateArrival = `${this.finalAppointment_date[0]} ${this.finalAppointment_date[1]},${this.day_year_month_selected[1]} ${this.day_year_month_selected[0]} ${this.day_year_month_selected[2]}`;
        this.subs = this.service.sendAppointment(this.formGroup_setAppointment, dateArrival, this.date_converting(), 'appointment').subscribe((res) => {
          this.subs.unsubscribe();
          this.showSuccessfully_request = true;

          this.formGroup_setAppointment = this.formBuilder.group({
            fullname: [''],
            email: [''],
            numberguest: [''],
            contactnumber: [''],
            letusknown: ['']
          });

          let doc = <HTMLSelectElement>document.querySelector('.ds_DF');
          doc.selectedIndex= 0;
          
          this.finalAppointment_date = new Array<string>("", "am");
          this.day_year_month_selected = new Array<string>("", "", "");
          this.day_year_month_selected[0] = "0";
        }, (err) => {
          this.subs.unsubscribe();
          location.reload();
        });

      }else{
        this.errAppointment[4] = ['!Please select time.', true];
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


  //Checking appointment input field_______________________________________________
  checkingAInputField(): boolean{
    let condition = true;
    if(this.formGroup_setAppointment.value.fullname !== '' && this.formGroup_setAppointment.value.fullname !== ' '){
      if((/[@]/).test(this.formGroup_setAppointment.value.email) && (/[.]/).test(this.formGroup_setAppointment.value.email)){
        if((/^\d+$/).test(this.formGroup_setAppointment.value.numberguest) && this.formGroup_setAppointment.value.numberguest.length > 0){
          if(!(/^\d+$/).test(this.formGroup_setAppointment.value.contactnumber) || this.formGroup_setAppointment.value.contactnumber.length == 0
          || this.formGroup_setAppointment.value.contactnumber === ' '){
            if(this.formGroup_setAppointment.value.contactnumber.length == 0 || this.formGroup_setAppointment.value.contactnumber === ' '){
              this.errAppointment[3] = ['!Empty input field.', true];
              condition = false;
            }else{
              this.errAppointment[3] = ['!Only numbers need.', true];
              condition = false;
            }
          }
        }else{
          if(this.formGroup_setAppointment.value.numberguest.length == 0){
            this.errAppointment[2] = ['!Empty input field.', true];
            condition = false;
          }else{
            this.errAppointment[2] = ['!Only numbers need.', true];
            condition = false;
          }
        }
      }else{
        this.errAppointment[1] = ['!Check email again.', true];
        condition = false;
      }
    }else{
      this.errAppointment[0] = ['!Empty input field.', true];
      condition = false;
    }
    return condition;
  }

  funcOnlyNumber(condition: boolean): void{
    if(!condition){
      let guestNum = <HTMLInputElement>document.querySelector('.guestNum');
      guestNum.value = guestNum.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
    }else{
      let contact = <HTMLInputElement>document.querySelector('.contacts');
      contact.value = contact.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
    }
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
                this.errArrForgotPassword[0] = ["!The Email is undefined.", true];
              }
            }, (err) => { this.sendOTTxt = 'Get OTP'; console.log(err) });
          }
        }else{
          this.errArrForgotPassword[0] = ["!The Email is undefined.", true];
        }
      }else{
        this.errArrForgotPassword[0] = ['!Please Fill up the email input field.', true];
      }
  }


  //Verify OTP code________________________________________________________
  verifyTxt: string = 'Verify';
  verfiyOTP(): void{
    var verify = this.formGroup_forgotPassword.value.verify;
    this.errArrForgotPassword = new Array<Array<any>>(['', false], ['', false]);
    
    if(verify !== '' && verify !== ' '){
      if((/^\d+$/).test(verify)){

        if(this.verifyTxt === 'Verify'){
          this.verifyTxt = 'Verifying..';

          this.subs = this.service.verifyCode(this.handle_email_OTP, verify).subscribe((result) => {
            this.subs.unsubscribe();
            this.verifyTxt = 'Verify';

            if(result.response === 'success'){
              this.condition_login_signup_clicked = 'changePassword';
            }else if(result.response === 'no-data'){

            }else{
              console.log('incorrect');
              this.errArrForgotPassword[1] = ['!Incorrect code. Try again.', true];
            }
          });

        }
      }else{
        console.log('err');
       this.errArrForgotPassword[1] = ['!No letter included. Just a number.', true];
      }
    }else{
      console.log('err');
      this.errArrForgotPassword[1] = ['!Please Fill up the verify input field.', true];
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
              this.errArrForgotPassword[0] = ['!No email. Refresh the browser.', true];
            }
          }else{
            this.errArrForgotPassword[0] = ['!Please check the 2 input field. It must be same.', true];
            this.errArrForgotPassword[1] = ['!Please check the 2 input field. It must be same.', true];
          }
        }else{
          this.errArrForgotPassword[0] = [this.errorSignupArr[4][0], true];
        }
      }else{

        if((newPassword === '' || newPassword === ' ') && (verifyPassword === '' || verifyPassword === ' ')){
          this.errArrForgotPassword[0] = ['!Please Fill up the input field.', true];
          this.errArrForgotPassword[1] = ['!Please Fill up the input field.', true];
        }else if((newPassword === '' && newPassword === ' ')){
          this.errArrForgotPassword[0] = ['!Please Fill up the input field.', true];
        }else{
          this.errArrForgotPassword[1] = ['!Please Fill up the input field.', true];
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
  

  generateCalendar(month: any, year: any) {
  
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
          
          var array = new Array<string>( `${(i - first_day.getDay() + 1)}`, `${condition}` );

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
 

  //Checking all input field if empty______________________________________________________________________________
  checkingField(data: register): boolean{
    let condition = true;
    if(data.firstname !== '' && data.firstname !== ' '){

      if(data.lastname !== '' && data.lastname !== ' '){

        if(data.contact_number !== '' && data.contact_number !== ' '){

          if(data.email !== '' && data.email !== ' '){

              if(data.password !== '' && data.password !== ' '){

                if(data.gender === 'Male' || data.gender === 'Female' || data.gender === 'Prefer not to say'){

                  if(this.condition_adminNotAdmin && this.formGroup_signup.value.adminPassword === '' || this.formGroup_signup.value.adminPassword === ' '){
                    console.log('error admin password');
                    this.errorSignupArr[6][0] = '!Please Fill up the password input field.';
                    this.errorSignupArr[6][1] = true;
                    condition = false;
                  } 

                }else{
                  console.log('error Gender');
                  this.errorSignupArr[5][0] = "!Please select your gender.";
                  this.errorSignupArr[5][1] = true;
                }

              }else{
                console.log('error password');
                this.errorSignupArr[4][0] = "!Please Fill up the password input field.";
                this.errorSignupArr[4][1] = true;
                condition = false;
              }        

          
          }else{
            console.log('error email');
            this.errorSignupArr[3][0] = "!Please Fill up the email input field.";
            this.errorSignupArr[3][1] = true;
            condition = false;
          }
        }else{
          console.log('error Contact_number');
          this.errorSignupArr[2][0] = "!Please Fill up the contact-number input field.";
          this.errorSignupArr[2][1] = true;
          condition = false;
        }
      }else{
        console.log('error lastname');
        this.errorSignupArr[1][0] = "!Please Fill up the lastname input field.";
        this.errorSignupArr[1][1] = true;
        condition = false;
      }
    }else{
      console.log('error firstname');
      this.errorSignupArr[0][0] = "!Please Fill up the firstname input field.";
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

    this.errorSignupArr[4][0] = txtErr;
    this.errorSignupArr[4][1] = condition ? false: true;

    return condition;
  }





}
