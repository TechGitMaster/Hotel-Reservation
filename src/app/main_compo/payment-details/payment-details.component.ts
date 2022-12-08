import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MainServiceService } from 'src/app/main_serivce/main-service.service';

@Component({
  selector: 'app-payment-details',
  templateUrl: './payment-details.component.html',
  styleUrls: ['./payment-details.component.css']
})
export class PaymentDetailsComponent implements OnInit, AfterViewInit {

  constructor(private service: MainServiceService, private actRoute: ActivatedRoute, private formGroup: FormBuilder) { 

  }

  ngAfterViewInit(): void {
    this.service.emit_PaymentExpired(false);
  }


  formGroup_payment!: FormGroup;
  condition_expiredNot: string = 'false';

  service_subs!: Subscription;
  
  token_converted_data: Array<string> = new Array<string>( "","","","","","","","","","","","","","","","","","","","","","","" );
  protected token_converted!: any;
  protected token!: string;
  ngOnInit(): void {
    this.token = this.actRoute.snapshot.params['_pT'];
    this.formGroup_payment = this.formGroup.group({
      first_name: [''],
      last_name: [''],
      email: [''],
      email_re: [''],
      contact_number: ['']
    });


    if(this.token.length > 0){

      this.service_subs = this.service.extracting_payment(this.token).subscribe((result) => {
        this.service_subs.unsubscribe();

        if(result.response !== 'error'){
          console.log(result.token);
          this.token_converted = result.token;
          this.details_func();
        }else{
          this.condition_expiredNot = 'true';
        }

      });

    }else{
      this.condition_expiredNot = 'true';
    }
  }


  details_func(): void{
    this.token_converted_data = new Array<string>( "","","","","","","","","","","","","","","","","","","","","","","" );

    setTimeout(() => {
      this.token_converted_data[0] = this.token_converted.transaction_id;
      this.token_converted_data[1] = this.token_converted.nameRoom;
      this.token_converted_data[2] = this.token_converted.typeRoom;
      this.token_converted_data[3] = this.token_converted.acquired_persons;
      this.token_converted_data[4] = this.token_converted.paymentMethod;
      this.token_converted_data[5] = this.token_converted.first_name;
      this.token_converted_data[6] = this.token_converted.last_name;
      this.token_converted_data[7] = this.token_converted.email;
      this.token_converted_data[8] = this.token_converted.phone_number;
      this.token_converted_data[9] = this.token_converted.guest_member;
      this.token_converted_data[10] = this.token_converted.checkInDay;
      this.token_converted_data[11] = this.token_converted.checkInMonY;
      this.token_converted_data[12] = this.token_converted.checkOutDay;
      this.token_converted_data[13] = this.token_converted.checkOutMonY;
      this.token_converted_data[14] = this.token_converted.transaction_date;
      this.token_converted_data[15] = this.token_converted.price;
      this.token_converted_data[16] = this.token_converted.acquired_days;
      this.token_converted_data[17] = this.token_converted.total_day_price;
      this.token_converted_data[18] = this.token_converted.default_Personprice;
      this.token_converted_data[19] = this.token_converted.addtionalPax;
      this.token_converted_data[20] = this.token_converted.persons_price;
      this.token_converted_data[21] = this.token_converted.subTotal;
      this.token_converted_data[22] = this.token_converted.total_price;
    }, 300);

  }

  conditionPrint: boolean = true;
  printing(): void{
    this.conditionPrint = false;

    this.details_func();
    setTimeout(() => {
      window.print();
      this.conditionPrint = true;
    }, 600)
  }
}
