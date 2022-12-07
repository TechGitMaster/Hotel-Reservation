import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Subscription } from 'rxjs';
import { MainServiceService } from 'src/app/main_serivce/main-service.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  constructor(private router: Router, private service: MainServiceService, private builder: FormBuilder, private cookieservice: CookieService) { }


  condition_menu: boolean = false;
  arrHandle: Array<any> = new Array<any>();
  conditionFixDiv: boolean = false;
  condition_component: number = 0;

  formGroup_newPassword!: FormGroup;
  errArrPassword!: Array<Array<any>>;
  logoutCondition: boolean = false;
  img_selected: string = '';

  seeNotArr_password: Array<boolean> = new Array<boolean>(false, false, false);

  ngOnInit(): void {
    this.errArrPassword = new Array<Array<any>>([false, ""], [false, ""], [false, ""]);

    this.formGroup_newPassword = this.builder.group({
      currentPass: [''],
      newPass: [''],
      confirmPass: ['']
    });

    this.gettingCall();
  }

  //Getting call______________________________________________________________
  emitSubs!: Subscription;
  emit_selectedImage!: Subscription;
  gettingCall(): void{
    this.emitSubs = this.service.emitSending.subscribe((result) => {
      this.emitSubs.unsubscribe();
      this.emit_selectedImage.unsubscribe();

      this.conditionFixDiv = true;
      this.arrHandle = result;

      this.seeNotArr_password = new Array<boolean>(false, false, false);

      this.gettingCall();
    });

    this.emit_selectedImage = this.service.selected_image.subscribe((data: any) => {
      this.emitSubs.unsubscribe();
      this.emit_selectedImage.unsubscribe();

      this.img_selected = data;


      this.gettingCall();
    });
  }

  //Back emit call.. Yes or No_______________________________________________
  yesNO(condition: boolean): void{
    this.conditionFixDiv = false;
    if(!this.logoutCondition){
      this.service.emitCallBack(new Array<any>(condition));
    }else{
      if(condition){
        this.cookieservice.deleteAll('/');
        location.reload();
      }else{
        this.logoutCondition = false;
        this.arrHandle = new Array<any>();
      }
    }
  }



  //Burger navigation______________________________________________________
  burger_navigation(name: string): void{
    var subs = this.service.checkingToken().subscribe(() => {
      this.service.emitComponent(name);
      this.router.navigate([`/mc/${name}`]);
    }, (err) => {
      subs.unsubscribe();
      location.reload();
    });
  }


  //Navigation click bttns_________________________________________________
  navigation(numb: number): void{
    this.condition_component = numb;
  }

  //Logout_______________________________________________________________
  logout(): void{
    this.logoutCondition = true;
    this.arrHandle = new Array<any>('yesNo', 'Logout', 'Are you sure you want to logout?');
    this.conditionFixDiv = true;
  }

  //Function password icon see or not_________________________________________
  passSeeNot(condition: string): void{
    if(condition === 'pass'){
     if(!this.seeNotArr_password[0]){
       this.seeNotArr_password[0] = true;
     }else{
       this.seeNotArr_password[0] = false;
     }
    }else if(condition === 'newPass'){
     if(!this.seeNotArr_password[1]){
       this.seeNotArr_password[1] = true;
     }else{
       this.seeNotArr_password[1] = false;
     }
    }else{
      if(!this.seeNotArr_password[2]){
        this.seeNotArr_password[2] = true;
      }else{
        this.seeNotArr_password[2] = false;
      }
    }
   }


  //Change Password Button______________________________________________________________________
  subsChange!: Subscription;
  changePassword(): void{
    let current = this.formGroup_newPassword.value.currentPass;
    let newP = this.formGroup_newPassword.value.newPass;
    let confirmP = this.formGroup_newPassword.value.confirmPass;

    this.errArrPassword = new Array<Array<any>>([false, ""], [false, ""], [false, ""]);
    if(current.length > 0 && newP.length > 0){
        this.subsChange = this.service.checkingPassword(current).subscribe((data) => {
          this.subsChange.unsubscribe();
          if(data.response === 'success'){
            
            if(confirmP == newP){
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
                  this.errArrPassword[1][1] = "This is your current password!";
                  this.errArrPassword[2][0] = true;
                  this.errArrPassword[2][1] = "This is your current password!";
                }
              }
            }else{
              this.errArrPassword[1][0] = true;
              this.errArrPassword[1][1] = "New password and confirm password are not same!";
              this.errArrPassword[2][0] = true;
              this.errArrPassword[2][1] = "New password and confirm password are not same!";
            }
          }else{
            this.errArrPassword[0][0] = true;
            this.errArrPassword[0][1] = "Please provide a correct password!";
          }


        }, (err) => {
          this.subsChange.unsubscribe();
          location.reload();
        });
    }else{
      this.errArrPassword[0][1] = "Empty input field!";
      this.errArrPassword[1][1] = "Empty input field!";

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

    if(!condition){
      this.errArrPassword[1][0] = true;
      this.errArrPassword[1][1] = txtErr;
    }

    return condition;
  }
}
