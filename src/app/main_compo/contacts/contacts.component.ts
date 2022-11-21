import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MainServiceService } from 'src/app/main_serivce/main-service.service';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent implements OnInit {

  constructor(private service: MainServiceService, private formBuild: FormBuilder) { }

  formGroup!: FormGroup;
  subs!: Subscription;
  errInquery!: Array<Array<any>>;
  ngOnInit(): void {
    this.errInquery = new Array<Array<any>>(['', false], ['', false], ['', false]);
    this.formGroup = this.formBuild.group({
      fullname: [''],
      email: [''],
      letusknown: ['']
    });

    this.checkingIfLogin();
  }

  //Checking login_____________________________________________________________________________________________
  checkingIfLogin(): void{
    this.subs = this.service.checkingToken().subscribe((result) => {
      this.subs.unsubscribe();
       this.formGroup = this.formBuild.group({
        fullname: [result.data_info.fullName],
        email: [result.data.email],
        letusknown: ['']
      });
    })
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

  inquerySubmit(): void{
    this.errInquery = new Array<Array<any>>(['', false], ['', false], ['', false]);

    if(this.formGroup.value.fullname !== '' && this.formGroup.value.fullname !== ' '){
      if((this.formGroup.value.email !== '' && this.formGroup.value.email !== ' ') && 
      (/[@]/).test(this.formGroup.value.email) && (/[.]/).test(this.formGroup.value.email)){

        if(this.formGroup.value.fullname.length <= 40){
          if(this.formGroup.value.letusknown.length > 0 && this.formGroup.value.letusknown !== ' '){
            if(this.formGroup.value.letusknown.length <= 200){
              this.subs = this.service.sendAppointment(this.formGroup, '', this.date_converting(), 'inquery', '', '').subscribe((res) => {
                this.formGroup = this.formBuild.group({
                  fullname: [''],
                  email: [''],
                  letusknown: ['']
                });
                
                this.service.emitShowSuccess();
              });
            }else{
              this.errInquery[2] = ['Max character is 200 length!', true];
            }
          }else{
            this.errInquery[2] = ['Empty input field!', true];
          }
        }else{
          this.errInquery[0] = ['Max character is 40 length!', true];
        }

    
      }else{
        if((this.formGroup.value.email === '' || this.formGroup.value.email === ' ')){
          this.errInquery[1] = ['Empty input field!', true];
        }else{
          this.errInquery[1] = ['Check email again!', true];
        }
      }
    }else{
      this.errInquery[0] = ['Empty input field!', true];
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
}
