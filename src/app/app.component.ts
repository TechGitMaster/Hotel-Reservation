import { AfterViewInit, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';  
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { MainServiceService } from './main_compo/main-service.service';
import { register, login } from './objects';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit{
  subs!: Subscription;
  condition_login!: boolean;
  condition_login_signup_clicked!: boolean;
  condition_clicked_signup!: boolean;
  condition_menu!: boolean;
  clicked_handle!: string;
  notification_icon!: string;
  menubar_icon!: string;
  calendar: any = document.querySelector('.calendar');
  condition_clickedmonth!: boolean;
  formGroup_signup!: FormGroup;
  formGroup_login!: FormGroup;
  formGroup_setAppointment!: FormGroup;
  errorLoginArr!: Array<Array<any>>;
  errorSignupArr!: Array<Array<any>>;

  month_names: Array<string> = new Array<string>('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 
  'December');

  month_names_final!: Array<Array<string>>;

  day_numbers!: Array<Array<string>>;

  currDate: Date = new Date();
  
  curr_month = {value: this.currDate.getMonth()}
  curr_year = {value: this.currDate.getFullYear()}

  year_selected!: string;
  month_select!: string;
  day_select!: string;
  count_0day!: number;

  day_year_month_selected!: Array<string>;

  constructor(public http: HttpClient, private router: Router, private cookieservice: CookieService,
    private formBuilder: FormBuilder, private service: MainServiceService){} 

  ngOnInit(): void {
    this.condition_menu = false;
    this.condition_login = false;
    this.condition_login_signup_clicked = false;
    this.condition_clicked_signup = false;
    this.clicked_handle = 'home';
    this.notification_icon = "assets/icon/bell.png";
    this.menubar_icon = "/assets/icon/menu.png";


    this.count_0day = 0;
    this.day_year_month_selected = new Array<string>("", "", "");
    this.day_year_month_selected[0] = "0";

    this.condition_clickedmonth = false;
    this.day_numbers = new Array<Array<string>>();
    this.generateCalendar(this.curr_month.value, this.curr_year.value);    

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

    //Error login_______________________________________________
    this.errorLoginArr = new Array<Array<any>>(['email', false], ['password', false]);
    this.errorSignupArr = new Array<Array<any>>(['firstname', false], ['lastname', false], ['contact-number', false], 
    ['email', false], ['password', false], ['gender', false]);

    //Forms_____________________________________________________
    this.formGroup_login = this.formBuilder.group({
      email: [''],
      password: ['']
    });

    this.formGroup_signup = this.formBuilder.group({
      firstname:[''],
      lastname:[''],
      contactnumber:[''],
      email:[''],
      password:['']
    });

    this.formGroup_setAppointment = this.formBuilder.group({
      fullname: [''],
      email: [''],
      numberguest: [''],
      contactnumber: [''],
      letusknown: [''],
      time: [''],
      amPm: [''],
    });
  }

  ngAfterViewInit(): void {
  }

  //clicked Menu Icon___________________________________________________________
  clickedMenu(condition: boolean): void{
    this.condition_menu = condition;
  }


  //Selected navigation_____________________________________________________________
  funcClickable(condition: string): void{
    var element = document.querySelectorAll('.navclickable');
    var username = this.condition_login ? <HTMLSpanElement> document.querySelector('.username'): <HTMLSpanElement> document.querySelector('.sd');
    var navigationforAll = <HTMLDivElement> document.querySelector('.navigationforAll');

    this.condition_menu = false;

    if(condition !== '' && condition !== ' ' && this.clicked_handle !== condition){
      if(condition === 'contact-us'){

        element.forEach((divelement) => {
          var docs = <HTMLDivElement>divelement;
          docs.style.color = "black";
        });

        this.notification_icon = "assets/icon/bell 1.png";
        this.menubar_icon = "/assets/icon/menu1.png";

        if(this.condition_login) username.style.color = "#0A2B6A";
        navigationforAll.style.background = "none";

      }else{

        element.forEach((divelement) => {
          var docs = <HTMLDivElement>divelement;
          docs.style.color = "#FCFBFB";
        });
        
        this.notification_icon = "assets/icon/bell.png";
        this.menubar_icon = "/assets/icon/menu.png";

        if(this.condition_login) username.style.color = "#FCFBFB";
        navigationforAll.style.background = "rgba(0, 0, 0, 0.582)";
      }

      this.clicked_handle = condition;
      this.router.navigate(['/'+condition]);
    }
  }

  //Sign_in button_____________________________________________________
  funcSignIn(condition: boolean): void{
    this.condition_clicked_signup = condition;
    this.condition_login_signup_clicked = false;
    this.condition_menu = false;
  }

  //Create One button__________________________________________________
  createOne(): void{
    this.condition_login_signup_clicked = true;
  }


  //Sign in with Google_______________________________________________
  signInWithGoogle(){
    this.service.googleService();
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
          this.cookieservice.set('token', result.tokens);
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
    ['email', false], ['password', false], ['gender', false]);

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

                    //Checking the Gender if validate________________________________________________________
                    if(obj_data.gender === 'Male' || obj_data.gender === 'Female' || obj_data.gender === 'Prefer not to say'){

                      //Finally creating account of user_____________________________________________________
                      this.subs = this.service.register(obj_data).subscribe((result) => {

                        this.subs.unsubscribe();
                        console.log(result);

                      }, (err) => console.log(err));

                    }else{
                      console.log('error Gender');
                      this.errorSignupArr[5][0] = "!Please select your gender.";
                      this.errorSignupArr[5][1] = true;
                    }
                  }

                }else{
                  console.log('email already exist');
                  this.errorSignupArr[3][0] = "!This Email is already exist.";
                  this.errorSignupArr[3][1] = true;
                }
              });
            }else{
              console.log('error email');
              this.errorSignupArr[3][0] = "!this Email is already taken.";
              this.errorSignupArr[3][1] = true;
            }
        }else{
          console.log('error contact number');
          this.errorSignupArr[2][0] = "!Please check your contact-number";
          this.errorSignupArr[2][1] = true;
        }

    }

  }

  //Set Appointment button______________________________________________
  submitAppointment(): void{
    console.log(this.day_year_month_selected);
    console.log(this.formGroup_setAppointment.value);
  }

  

  //___________________________________________________________________________________________________________________
  isLeapYear(year: any): any {
      return (year % 4 === 0 && year % 100 !== 0 && year % 400 !== 0) || (year % 100 === 0 && year % 400 ===0)
  }
  
  getFebDays(year: any): any{
      return this.isLeapYear(year) ? 29 : 28;
  }
  


  array_data_notAvailable: Array<any> = new Array<any>(
    { day:"12", month:"6", year:"2022" },
    { day:"20", month:"6", year:"2022" },
    );

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

  calenpick(index:number, condition: string){
    if(condition === "true"){
      this.condition_clickedmonth = false;
      this.curr_month.value = index;
  
      this.generateCalendar(index, this.curr_year.value)
    }
  }

  month_picker: any = document.querySelector('#month-picker')
  
  
  clickMonthPicker(){
    this.condition_clickedmonth = true;
  }

  curr_year_condition = this.curr_year.value;

  prevtxt: string = "";
  nextxt: string = ">";
  
  prevyear(){
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
  
      this.generateCalendar(this.curr_month.value, this.curr_year.value)
    }
  }
 

  //Checking all input field if empty______________________________________________________________________________
  checkingField(data: register): boolean{
    let condition = true;
    if(data.firstname !== '' && data.firstname !== ' '){

      if(data.lastname !== '' && data.lastname !== ' '){

        if(data.contact_number !== '' && data.contact_number !== ' '){

          if(data.email !== '' && data.email !== ' '){

            if(data.password === '' || data.password === ' '){
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
