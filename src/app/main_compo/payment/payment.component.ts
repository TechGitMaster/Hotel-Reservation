import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { MainServiceService } from 'src/app/main_serivce/main-service.service';
//import { render } from 'creditcardpayments/creditCardPayments';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';

declare var paypal: any;

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit, AfterViewInit {
  @ViewChild('paypalbuttons', { static: false }) paypalElement!: ElementRef;

  //HttpBackend is to ignore httpInterceptor________________________________________________
  httpClient: HttpClient;
  constructor(private service: MainServiceService, private actRoute: ActivatedRoute, httpBackend: HttpBackend, private formGroup: FormBuilder) {
    this.httpClient = new HttpClient(httpBackend);
  }

  ngAfterViewInit(): void {
    this.service.emit_PaymentExpired(false);
  }

  protected token!: string;
  img_selected: string = '';
  token_convert!: any;
  condition_expiredNot!: string;
  condition_paymentSection!: boolean;
  condition_paymentMethod!: string;
  condition_alertAfterpayment: boolean = false;
  subs!: Subscription;

  data_room!: any;
  day_count_reservation!: number;
  day_checkInOut_convert!: string;
  person_total!: any;
  total_price_perDay!: any;
  total_price!: any;
  textarea_details!: string;
  price_room!: any;
  
  arr_img_transaction: Array<string> = new Array<string>();
  arr_blob_transaction: Array<any> = new Array<any>();
  arr_data_savingInfo: Array<any> = new Array<any>('', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '');

  errAppointment!: Array<any>;
  formGroup_payment!: FormGroup;

  cond_check: boolean = true;
  arr_details: Array<any> = new Array<any>();
  countD: number = 1;
  boolean_close: boolean = false;
  arrHandle: Array<any> = new Array<any>('');

  ngOnInit(): void {
    this.errAppointment = new Array<any>(['', false], ['', false], ['', false], ['', false], ['', false], ['', false], ['', false]);
    this.formGroup_payment = this.formGroup.group({
      first_name: [''],
      last_name: [''],
      email: [''],
      email_re: [''],
      contact_number: ['']
    });

    this.condition_expiredNot = 'new';
    this.condition_paymentSection = true;
    this.condition_paymentMethod = 'new';

    this.token = this.actRoute.snapshot.params['_pT'];
    if(this.token.length > 0){
      this.subs = this.service.checking_tokenNotExpired(this.token).subscribe((ress) => {
        this.subs.unsubscribe();
        
        if(ress.response === 'success'){

          this.token_convert = ress.data;

          //DATE CONVERTING________________________________________________________________
          this.day_checkInOut_convert = this.date_CheckinOut_convert();
          const oneDay = 24 * 60 * 60 * 1000;

          let checkIn_arr = this.token_convert.checkIn.split('-');
          let checkOut_arr = this.token_convert.checkOut.split('-');
          
          //Convert to how many per day__________________________________________________________________________________
          let date1 = new Date(parseInt(checkIn_arr[0]), parseInt(checkIn_arr[1]), parseInt(checkIn_arr[2])) as any;
          let date2 = new Date(parseInt(checkOut_arr[0]), parseInt(checkOut_arr[1]), parseInt(checkOut_arr[2])) as any;
          this.day_count_reservation = Math.round(Math.abs((date1 - date2) / oneDay));

          //TIME SESSION EXPIRED______________________________________________________________
          this.sessionCOUNT();

          //GET ROOM DATA________________________________________________________________________________
          this.subs = this.service.getRoom_payment(ress.data.room_sh).subscribe((res) => {
            this.subs.unsubscribe();

            if(res.response === 'success'){

              this.condition_expiredNot = 'false';
              this.data_room = res.data;
  

              //Total persons________________________________
              this.person_total = this.total_persons();
              //Total price perday_________________________________
              this.total_price_perDay = Math.floor(this.data_room.defaultPrice * (this.day_count_reservation > 1 ? (this.day_count_reservation-1):0));
              //Total price___________________________________
              this.total_price = ((parseInt(this.data_room.defaultPrice) + this.person_total) + this.total_price_perDay).toFixed(2);
              
              this.price_room = ''+this.data_room.defaultPrice+'.00';
              this.person_total = this.person_total.toFixed(2);
              this.total_price_perDay = this.total_price_perDay.toFixed(2);
              this.arr_data_savingInfo[0] = this.token_convert.room_sh;
              this.arr_data_savingInfo[3] = this.token_convert.personsCount;
              this.arr_data_savingInfo[4] = this.person_total;
              this.arr_data_savingInfo[5] = this.total_price_perDay;
              this.arr_data_savingInfo[6] = this.total_price;

              //Checking availability___________________________________
              this.checking_roomAvailability();

              //Information of number people______________________________________________________
              for(this.countD = 1;this.countD < this.token_convert.personsCount;this.countD++){
                      this.arr_details.push([ '', '', '' ]);
              }

              //Converting the total price from PHP to USD_______________________________________
              /*this.subs = this.httpClient.get(`https://api.apilayer.com/exchangerates_data/convert?to=USD&from=PHP&amount=${this.total_price}`,
              { headers: { 'apikey': 'gWHuBlOrWyFBTlc89gB1KTSxQbvHhRE5' } }).subscribe((ress: any) => {
                this.subs.unsubscribe();
                
                this.converted_from_PHPtoUSD = ress.result;
              });*/

            }else{
              this.condition_expiredNot = 'true';
              this.service.emit_PaymentExpired(true);
            }
          });

        }else{
          this.condition_expiredNot = 'true';
          this.service.emit_PaymentExpired(true);
        }
      });
    }

    this.checkingIfLogin();
  }


  handleNumber!: number;
  handleInterval_session!: any;
  st_session: string = '';
  clear_subs!: Subscription;
  condition_forInterval: boolean = false;
  txt_alertWindow: string = '';
  st_timerS: string = 'minutes';
  //SESSION EXPIRED COUNT___________________________________________________________________________________________
  sessionCOUNT(): void{
    this.handleNumber = this.token_convert.time;
    let condtAlert = -1;
    
    this.handleInterval_session = setInterval(() => {
      let dates = new Date();
      let minutess = this.handleNumber <= dates.getMinutes() ? ((this.handleNumber+20)-dates.getMinutes()): Math.abs(((60-this.handleNumber)+dates.getMinutes())-20);
      let secondss = (60-dates.getSeconds());

      this.st_session = ''+(minutess < 10 ? '0'+minutess:minutess)+":"+(secondss < 10 ? '0'+secondss:(secondss == 10 ? '0'+(secondss-1):(secondss-1)));
      if(minutess == 0 && secondss == 1){
        clearInterval(this.handleInterval_session);
        if(!this.condition_forInterval){
          this.clear_subs = this.service.deleting_sessionAfter(this.token).subscribe(() => {
            this.clear_subs.unsubscribe();
            location.reload();
          });
        }
      }

      if((minutess == 10 || minutess == 5 || minutess == 1) && condtAlert != minutess){
        condtAlert = minutess;
        this.txt_alertWindow = this.st_session;
        this.arrHandle = new Array<any>("showing_alertWindow");
      }

      if(minutess == 1){
        this.st_timerS = "minute";
      }else if(minutess == 0){
        this.st_timerS = "seconds";
      }
    }, 300);
  }


  //Checking login_____________________________________________________________________________________________
  subs_checkingLog!: Subscription;
  checkingIfLogin(): void{
    this.subs_checkingLog = this.service.checkingToken().subscribe((result) => {
      this.subs_checkingLog.unsubscribe();
      this.formGroup_payment = this.formGroup.group({
        first_name: [result.data_info.firstname],
        last_name: [result.data_info.lastname],
        email: [result.data_info.email],
        email_re: [result.data_info.email],
        contact_number: [result.data_info.contactnumber]
      });
    })
  }

  //SELECTED IMAGE___________________________________________________________
  selected_img(numb: number): void{
    this.img_selected = this.arr_img_transaction[numb];
  }

  //Bttn of select payment methods "Gcash or paypal"________________________________________________________
  paypals: any = null;
  identify_PM: string = '';
  gcash_bttn: string = '';
  paypal_bttn: string = '';
  subs_paypal!: Subscription;
  protected enable_bttn!: any;
  termsCondition: boolean = false;
  select_bttnPayment(payment_method: string): void{
    let flexRadioDefault1 = <HTMLInputElement>document.querySelector('#flexRadioDefault1');
    let flexRadioDefault2 = <HTMLInputElement>document.querySelector('#flexRadioDefault2');
    if(this.termsCondition){

      this.condition_paymentMethod = payment_method;

      this.identify_PM = payment_method;

      //Checking availability___________________________________
      this.subs = this.checking_roomAvailability().subscribe((res) => {
        if(res){
          //Radio bttn_________________________________
          if(payment_method === 'gcash' && this.gcash_bttn === ''){
            flexRadioDefault1.checked = true;
            flexRadioDefault2.checked = false;
            this.gcash_bttn = 'have';
            this.paypal_bttn = '';
          }else if(payment_method === 'paypal' && this.paypal_bttn === ''){
            this.paypal_bttn = 'have';
            this.gcash_bttn = '';

            flexRadioDefault1.checked = false;
            flexRadioDefault2.checked = true;

            //Open the paypal and make pay___________________________________________
            setTimeout(() => {

              if(this.paypals != null) this.paypals.close();

              this.paypals = paypal.Buttons({
                style: {
                  height: 45,
                },
                
                onInit: (data: any, actions: any) => {
                  // Disable the buttons paypal
                  actions.disable();
                  this.enable_bttn = actions;
                },

                onClick: () => {
                  //Checking if the user fill up the information and checking if room is still available_________________________

                  const data_info = this.formGroup_payment.value;

                  this.textarea_details = '';
                  this.errAppointment = new Array<any>(['', false], ['', false], ['', false], ['', false], ['', false], ['', false],  ['', false]);

                  if(this.checkingField(data_info)){
                    if(this.termsCondition){
                      this.subs = this.service.checking_alreadyHave_paypal(this.arr_data_savingInfo[0]).subscribe((data_reserve) => {
                        this.subs.unsubscribe();
                        if(data_reserve.response === 'success'){
                          this.transaction_ID(data_info, [], 'payment2');
                          this.enable_bttn.enable();
                        }else{
                          this.session_delete(data_reserve);
                        }
                      });
                    }else{
                      this.errAppointment[6][0] = "Please confirm that you're agreed for the terms and condition!";
                      this.errAppointment[6][1] = true;
                    }
                  }
                },

                createOrder: (data: any, actions: any) => {
                  return actions.order.create({
                    purchase_units: [
                      {
                        amount: {
                          currency_code: 'PHP',
                          //this.arr_data_savingInfo[6]
                          value: 1
                        }
                      }
                    ]
                  });
                },
                onApprove: async (data: any, actions: any) => {
                  const transaction = await actions.order.capture();
                  try{
                    let ds = transaction.id;

                    if(ds != null && ds !== 'undefined' && ds != undefined){

                      //Stop interval timer count down____________________________________________________
                      clearInterval(this.handleInterval_session);
                      this.condition_forInterval = true;

                      //Save data_____________________________________________________________________
                      this.subs_paypal = this.service.saving_information_payment(this.arr_data_savingInfo).subscribe((ress_saved) => {
                        this.subs_paypal.unsubscribe();

                          this.subs_paypal = this.service.send_reservation_toUser(this.arr_data_savingInfo).subscribe((data) => {
                          
                            this.subs_paypal.unsubscribe();
                            this.arrHandle = new Array<any>('progress', 100, 'Room has been reserved.');
  
                            //Deleting session______________________________________________________________
                            this.subs = this.service.deleting_sessionAfter(this.token).subscribe(() => {
                              //Show payment details for downloading payments____________________________________ 
                              this.subs.unsubscribe();
                              this.condition_paymentSection = false;
                              this.condition_alertAfterpayment = true;
                            });
                            
                          });
                        

                      });
                    }
                  }catch(err){
                    alert('Failed to pay. Logout your paypal account and try again!');
                  }
                },
                onCancel: () => {
                  if(this.subs_paypal != null) this.subs_paypal.unsubscribe();
                }
              });
              this.paypals.render(this.paypalElement.nativeElement);
            }, 100);

          }
        }
      });
    }else{
      flexRadioDefault1.checked = false;
      flexRadioDefault2.checked = false;
      alert("You need to check first the Terms and condition.");
    }
  }


  session_delete(ress_saved: any): void{
    this.subs = this.service.deleting_sessionAfter(this.token).subscribe((r) => {
      this.subs.unsubscribe();
      if(ress_saved.response === 'have'){
        alert('This room is already reserved by other user.');
      }else{
        alert('You already have reservation request for this room.');
      }
      location.reload();
    });
  }

  //Home page bttn click___________________________________________________________________________
  goHome(): void{
    if(this.condition_paymentSection){
      this.arrHandle = new Array<any>('exiting', 'Cancel transaction', 'Are you sure you want to cancel the transaction?');
    }else{
      this.yesNO(true);
    }
  }

  //Terms and condition bttn_____________________________________________________________________
  termsAndCondition(): void{
    let flexRadioDefault1 = <HTMLInputElement>document.querySelector('#flexRadioDefault1');
    let flexRadioDefault2 = <HTMLInputElement>document.querySelector('#flexRadioDefault2');
    if(!this.termsCondition){
      this.termsCondition = true;
    }else{
      this.condition_paymentMethod = "new";
      this.termsCondition = false;
      flexRadioDefault1.checked = false;
      flexRadioDefault2.checked = false;
      this.paypal_bttn = '';
    }
  }

  //Yes or No For back home_______________________________________________
  yesNO(condition: boolean): void{
    this.arrHandle = new Array<any>();
    if(condition){
      this.subs = this.service.deleting_sessionAfter(this.token).subscribe(() => {
        this.subs.unsubscribe();
        //'https://abpadilla.herokuapp.com/mc/home';
        //'http://localhost:4200/mc/home';
        window.location.href = 'https://abpadilla.herokuapp.com/mc/home';
      });
    }
  }

  //Login bttn_____________________________________________________________
  loginBttn(): void{
    this.arrHandle[0] = '';
    this.service.emit_loginFrompayment();
  }

  //Convert checkIn and out_______________________________________________________________________
  date_CheckinOut_convert(): string{
    let checkIn_arr = this.token_convert.checkIn.split('-');
    let checkIn = `${checkIn_arr[2]}/${this.month_names[(parseInt(checkIn_arr[1])-1)]}/${checkIn_arr[0]}`;

    let checkOut_arr = this.token_convert.checkOut.split('-');
    let checkOut = `${checkOut_arr[2]}/${this.month_names[(parseInt(checkOut_arr[1])-1)]}/${checkOut_arr[0]}`;

    this.arr_data_savingInfo[1] = `${this.month_namesFull[(parseInt(checkIn_arr[1])-1)]} ${checkIn_arr[2]} ${checkIn_arr[0]}`;
    this.arr_data_savingInfo[2] = `${this.month_namesFull[(parseInt(checkOut_arr[1])-1)]} ${checkOut_arr[2]} ${checkOut_arr[0]}`;
    return `${checkIn} - ${checkOut}`;
  }

  //Total of person__________________________________________________________________________
  total_persons(): number{
    this.token_convert.personsCount;
    this.data_room.goodPersons
    this.data_room.pricePersons;
    
    let number_total = 0;
    if(this.data_room.goodPersons < this.token_convert.personsCount){
      number_total = Math.floor((this.token_convert.personsCount - this.data_room.goodPersons) * this.data_room.pricePersons);
    }else{
      
      number_total = 0;
    } 


    return number_total;
  }



  //ADD GUEST______________________________________________________________________________________

  //Guest details check bttn_______________________________________________________________
  GDetails_check(): void{
    this.arr_details = new Array<any>();
    if(!this.cond_check){
      this.cond_check = true;
      for(this.countD = 1;this.countD < this.token_convert.personsCount;this.countD++){
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

    if(event.target.value.length == 0 && this.enable_bttn != null){
      this.enable_bttn.disable();
    }

    this.arr_details[numb_parent][numb_child] = event.target.value;
  }

  //_________________________________________________________________________________________________


  //Select image bttn__________________________________________________________
  async selectImage(event: any){
    if(!!event.target.files){
      for await(let file of event.target.files){

        if(file.size <= 500000){

          let reader = new FileReader();
          reader.readAsDataURL(file);

          reader.onload = (fileConverted) => {
            this.arr_img_transaction.push(''+fileConverted.target?.result);

            //This is blob for uploading the image to cloudinary___________________
            this.arr_blob_transaction.push([''+fileConverted.target?.result, file]);

          }
        }else{
          alert(`${file.name} is more than 500kb`);
        }
      }
    }
  }

  //Delete img______________________________________________________________________
  deleteImage(data_img: number): void{
    this.arr_img_transaction[data_img] = '';
    this.arr_blob_transaction[data_img][0] = '';

    this.arr_img_transaction = this.arr_img_transaction.filter((data) => data != '');
    this.arr_blob_transaction = this.arr_blob_transaction.filter((data) => data[0] != '');
  }


  //Get date converted____________________________________________________________________________________________
  month_names: Array<string> = new Array<string>('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 
  'Dec');
  month_namesFull: Array<string> = new Array<string>('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 
  'December');
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


    return `${converted_hours2}:${converted_minutes} ${amPm},${this.month_names[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
  }

  //Contact_number only number_____________________________________________
  only_number_contact(event: any): void{
    let doc = <HTMLInputElement>document.querySelector(`.forminputC`);
    doc.value = doc.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');

    this.formGroup_payment.value.contact_number = doc.value

    //Checking if empty disable button paypal_____________________________________________________
    if(event.target.value.length == 0 && this.enable_bttn != null){
      this.enable_bttn.disable();
    }
  }

  //Checking if empty if emtpy disable button paypal_____________________________________________________
  checkingFieldsF(event: any): void{
    if(event.target.value.length == 0 && this.enable_bttn != null){
      this.enable_bttn.disable();
    }
  }

  //Bttn make a request bttn when using "Gcash"____________________________________________________________________________
  makeA_reqest(): void{
    this.subs = this.service.checking_user().subscribe((res1) => {
      this.subs.unsubscribe();

      this.textarea_details = '';
      this.errAppointment = new Array<any>(['', false], ['', false], ['', false], ['', false], ['', false], ['', false], ['', false]);

      const data_info = this.formGroup_payment.value;

      if(this.checkingField(data_info)){
        if(this.termsCondition){

          //Clearing interval of timer countdown______________________________________________________________________
          clearInterval(this.handleInterval_session);
          this.condition_forInterval = true;

          this.arrHandle = new Array<any>('progress', Math.floor(Math.random() * 50), 'Making a request.');

          if(this.arr_blob_transaction.length != 0){
            //Upload image to cloudinary_____________________
            this.subs = this.service.uploadImage(this.arr_blob_transaction).subscribe((result) => {
              this.subs.unsubscribe();
              this.making_requestGcash(data_info, result.data, 'payment1')
            }); 
          }else{
            this.making_requestGcash(data_info, [], 'payment1');
          }
        }else{
          this.errAppointment[6][0] = "Please confirm that you're agreed for the terms and condition!";
          this.errAppointment[6][1] = true;
        }
      }
    }, (err) => {
      this.arrHandle = new Array<any>('showing');
    });
  }
  

  //Transaction ID maker and information________________________________________________________
  transaction_ID(data_info: any, arr_data: any, condition_payment: string): void{
    
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
            this.arr_data_savingInfo[7] = data_info.first_name;
            this.arr_data_savingInfo[8] = data_info.last_name;
            this.arr_data_savingInfo[9] = data_info.contact_number;
            this.arr_data_savingInfo[10] = data_info.email;
            this.arr_data_savingInfo[11] = arr_data;
            this.arr_data_savingInfo[12] = this.date_converting();
            this.arr_data_savingInfo[13] = condition_payment;
            this.arr_data_savingInfo[14] = transaction_id;
            this.arr_data_savingInfo[15] = this.textarea_details;
            this.arr_data_savingInfo[16] = ''+this.data_room.defaultPrice+'.00';
            this.arr_data_savingInfo[17] = this.data_room.nameRoom;
            this.arr_data_savingInfo[18] = this.data_room.typeRoom2;
            this.arr_data_savingInfo[19] = this.day_count_reservation;
          }
        }
      }
    }
  }

  //Upload data to make reservation request GCASH PAYMENT________________________________________
  making_requestGcash(data_info: any, arr_data: any, condition_payment: string): void{  
    this.transaction_ID(data_info, arr_data, condition_payment);
    this.subs = this.service.saving_information_payment(this.arr_data_savingInfo).subscribe((ress_saved) => {
      this.subs.unsubscribe();
      if(ress_saved.response === 'success'){
        this.arrHandle = new Array<any>('progress', 100, 'Reservertion has been requested.');

        //Deleting session______________________________________________________________
        this.subs = this.service.deleting_sessionAfter(this.token).subscribe(() => {
          //Show payment details for downloading payments____________________________________  
          this.subs.unsubscribe();
          this.condition_paymentSection = false; 
          this.condition_alertAfterpayment = true;
        });

      }else{
        this.subs = this.service.deleting_sessionAfter(this.token).subscribe((r) => {
          this.subs.unsubscribe();
          if(ress_saved.response === 'have'){
            alert('This room is already reserved by other user.');
          }else{
            alert('You already have reservation request for this room.');
          }
          location.reload();
        });
      }
    });
  }

  //Checking availability_______________________________________________________________________________
  checking_roomAvailability(): Observable<any>{
    return new Observable<any>((next) => {
      this.service.checking_roomAvailability(this.token_convert.room_sh, this.token).subscribe((ress) => {
        if(ress.response === 'have'){
          alert('This room is already reserved by other user.');
          location.reload();

          next.next(false);
        }else{
          next.next(true);
        }
      });
    }); 
  }

  //Checking all input field if empty______________________________________________________________________________
  checkingField(data: any): boolean{
    let condition = true;
    if(data.first_name !== '' && data.first_name !== ' '){
      if(data.first_name.length <= 15){

        if(data.last_name !== '' && data.last_name !== ' '){
          if(data.last_name.length <= 20){
            
            if(data.email !== '' && data.email !== ' '){
              if(data.email_re !== '' && data.email_re !== ' '){
    
                if(data.contact_number === '' || data.contact_number === ' '){
                  this.errAppointment[4][0] = "Please Fill up the contact-number input field!";
                  this.errAppointment[4][1] = true;
                  condition = false;
                }else{
                  if((/[@]/).test(data.email) && (/[.]/).test(data.email)){
                    if((/[@]/).test(data.email_re) && (/[.]/).test(data.email_re)){
    
                      if(data.email === data.email_re){
                        let removeWhite = data.contact_number.replaceAll(' ','');
                        if(removeWhite.length != 11){
                          this.errAppointment[4][0] = "Contact number must exact 11 length!";
                          this.errAppointment[4][1] = true;
                          condition = false;
                        }else{
                          if(this.cond_check){
    
                            for(let count = 0;count < this.arr_details.length;count++){
                              if(this.arr_details[count][0] === '' || this.arr_details[count][1] === '' || this.arr_details[count][2] === ''){
                                this.errAppointment[5][0] = "Check the input field on guest names!";
                                this.errAppointment[5][1] = true;
                                condition = false;   
                              }else{
                                this.textarea_details += 
                                  `${this.arr_details[count][0]+' '+this.arr_details[count][1]},${this.arr_details[count][2]}${count != this.arr_details.length-1 ? '\n':''}`
                              }
                            }
                          }
                        }
                      }else{
                        this.errAppointment[2][0] = "Not same email and email re-confirm!";
                        this.errAppointment[2][1] = true;
    
                        this.errAppointment[3][0] = "Not same email and email re-confirm!";
                        this.errAppointment[3][1] = true;
    
                        condition = false;
                      }
    
                    }else{  
                      this.errAppointment[3][0] = "Wrong format of email!";
                      this.errAppointment[3][1] = true;
                      condition = false;
                    }
                  }else{
                    this.errAppointment[2][0] = "Wrong format of email!";
                    this.errAppointment[2][1] = true;
                    condition = false;
                  }
                }
    
              }else{
                this.errAppointment[3][0] = "Please Fill up the email (re-confirm) input field!";
                this.errAppointment[3][1] = true;
                condition = false;
              }        
    
          
            }else{
              this.errAppointment[2][0] = "Please Fill up the email input field!";
              this.errAppointment[2][1] = true;
              condition = false;
            }
            
          }else{
            this.errAppointment[1][0] = "Max character is 20 length!";
            this.errAppointment[1][1] = true;
            condition = false;
          }
        
    
        }else{
          this.errAppointment[1][0] = "Please Fill up the lastname input field!";
          this.errAppointment[1][1] = true;
          condition = false;
        }
      }else{
        this.errAppointment[0][0] = "Max character is 15 length!";
        this.errAppointment[0][1] = true;
        condition = false;
      }

    }else{
      this.errAppointment[0][0] = "Please Fill up the firstname input field!";
      this.errAppointment[0][1] = true;
      condition = false;
    }

    if(!condition && this.enable_bttn != null){
      this.enable_bttn.disable();
    }

    return condition;
  }




  //DISPLAYING DETAILS SECTION____________________________________________________________________

  //Return check in and out____________________________________________________________________
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

  conditionPrint: boolean = true;
  printing(): void{
    this.conditionPrint = false;
    setTimeout(() => {
      window.print();
      this.conditionPrint = true;
    }, 200)
  }
}
