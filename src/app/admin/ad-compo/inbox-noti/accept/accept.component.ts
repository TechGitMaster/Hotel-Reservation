import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdServiceService } from 'src/app/admin/ad-service.service';
import { mails } from 'src/app/objects';

@Component({
  selector: 'app-accept',
  templateUrl: './accept.component.html',
  styleUrls: ['./accept.component.css']
})
export class AcceptComponent implements OnInit {

  constructor(private service: AdServiceService) { }

  subs!: Subscription;

  condition_firstLoad: boolean = false;

  numb_allMails!: number;
  numbCountLimit!: number;
  numbCountSkip!: number;
  lengthMails!: number;
  handle_numberSelected!: number;

  condition_Delete!: boolean;
  condition_selectMails!: boolean;
  condition_InqueryAppointment!:boolean;
  condition_loading!: boolean;
  condition_checkedAll!: boolean;
  arr_Checked!: Array<Array<any>>;

  st_LoadingNoData!: string;
  condition_newMailSelected!: string;

  numbMailsArr_notForAll!: Array<mails>;
  arr_selectedMail!: Array<string>;
  
  date: Date = new Date();
  

  ngOnInit(): void {
    this.numb_allMails = 0;
    this.numbCountLimit = 0;
    this.numbCountSkip = -15;
    this.lengthMails = 0;
    this.handle_numberSelected = -1;

    this.condition_checkedAll = false;
    this.condition_selectMails = false;
    this.condition_InqueryAppointment = false;
    this.condition_newMailSelected = '';
    this.condition_Delete = false;

    this.condition_loading = true;
    this.st_LoadingNoData = '';

    this.arr_Checked = new Array<Array<any>>();
    this.numbMailsArr_notForAll = new Array<mails>();
    this.arr_selectedMail = new Array<string>("", "", "", "", "", "", "", "", "", "");

    this.callMailsNext();
  }


  //Next button to get mails_____________________________________________________________
  callMailsNext(): void{
    if(!this.condition_Delete){
      if(this.numb_allMails == 0 && !this.condition_firstLoad){
        this.condition_firstLoad = true;
        this.condition_loading = true;
        this.st_LoadingNoData = 'Loading...';
        this.numbCountLimit += 15;
        this.numbCountSkip += 15;
        this.funcCallMails();
      }else{
        if(this.lengthMails == this.numbCountLimit && this.numbCountLimit < this.numb_allMails){
          this.condition_loading = true;
          this.st_LoadingNoData = 'Loading...';
          this.numbCountLimit += 15;
          this.numbCountSkip += 15;
          this.funcCallMails();
        } 
      }
    }
  }

  //Back button to get mails_____________________________________________________________
  callMailsBack(): void{
    if(this.lengthMails > 15 && !this.condition_Delete){
      this.condition_loading = true;
      this.st_LoadingNoData = 'Loading...';
      this.numbCountLimit -= 15;
      this.numbCountSkip -= 15;
      this.funcCallMails();
    }
  }

  //Uncheck all the box before next and back________________________________________________
  funcUncheckBox(): void{
    this.condition_checkedAll = false;
    this.arr_Checked = new Array<Array<any>>();

    var parentCheckBox = <HTMLInputElement>document.querySelector('.checkBoxParent');
    parentCheckBox.checked = false;

  }

  //Get the mails________________________________________________________
  funcCallMails(){
    this.numbMailsArr_notForAll = new Array<mails>();
    this.subs = this.service.getAcceptedDecline(this.numbCountSkip, this.numbCountLimit, 'accepted' as string).subscribe((result) => {
      this.subs.unsubscribe();
      this.funcUncheckBox();
      if(result.response !== 'no-data'){

        this.numbMailsArr_notForAll = result.data;
        this.condition_loading = false;
        this.numb_allMails = result.count_data;
        this.lengthMails = this.numbCountSkip+this.numbMailsArr_notForAll.length;
      
      }else{
        //no_data _________________
        this.st_LoadingNoData = 'Empty accepted mail...';
        this.numb_allMails = 0;
        this.lengthMails = 0;
      }
    }, (error) => 
    {
      this.subs.unsubscribe();
      location.reload()
    });
  }

  //Caculate date__________________________________
  dateCalcu(day: string, month: string, time: string): string{

    var dayDate = ''+this.date.getDate();

    return (day !== dayDate ? month+' '+day:time);
  }



  //Click the div to see message________________________________________________________
  funcSeeMessage(number: number): void{
    if(!this.condition_Delete){
      this.condition_selectMails = true;
      this.handle_numberSelected = number;

      var data = this.numbMailsArr_notForAll[number] as mails;

      this.condition_newMailSelected = data.acceptedNot;

      this.condition_InqueryAppointment = data.appointmentNot === 'appointment' ? true: false;

      var email = ( data.email === '' ? data.reserved_email: data.email);
      var arr_dateTime = data.timeDate.split(',');
      var time = arr_dateTime[0];
      var date = arr_dateTime[1];

      this.arr_selectedMail = new Array<any>(data.reserved_email !== 'Bot message' ? email: data.reserved_email, 
      `${date}, ${time}`, String(data.favorite), (data.appointmentNot === 'appointment' ? 'Appointment':
      (data.appointmentNot === 'inquery' ? 'Inquery Message': 'Reservation')), data.fullname, data.reserved_email, 
      data.numGuest, data.contact_num, data.message, number, data.dateArrival);

      this.condition_checkedAll = false;
      this.arr_Checked = new Array<Array<any>>();
        
      this.arr_Checked.push(new Array<any>(data.IDS, number));
    }
  }


  //Favorite click_______________________________________________________________
  favoriteClick(number: number, favo_condition: any, condition: boolean): void{
    let numbers_count = number as number;
    if(!this.condition_Delete){
      if(!condition){
        numbers_count = parseInt(this.arr_selectedMail[9]);
      }

      this.subs = this.service.saveNotFavorite(this.numbMailsArr_notForAll[numbers_count].IDS, favo_condition, 'accept').subscribe((result) => {
        this.subs.unsubscribe();
        if(condition){
          this.numbMailsArr_notForAll[number].favorite = (!favo_condition ? true: false)
        }else{
          this.arr_selectedMail[2] = (!favo_condition ? 'true': 'false');
          this.numbMailsArr_notForAll[parseInt(this.arr_selectedMail[9])].favorite = (!favo_condition ? true: false)
        }
      }, (error) => 
      {
        this.subs.unsubscribe();
        location.reload()
      });
    }
  }



  //Check all checkBox__________________________________________________
  async checkAllbox(condition: any){
    if(!this.condition_Delete){
      this.arr_Checked = new Array<Array<any>>();
      if(this.numbMailsArr_notForAll.length > 0){
        this.condition_checkedAll = condition.target.checked;

        var div = document.querySelectorAll('.mails_divs > div');
        var count = 0;

        await div.forEach((div) => {
          var divParent = div.querySelector('.board_boxMail_'+count);
          var divParent2 = divParent?.querySelector('.divInput_'+count);
          var input = <HTMLInputElement>divParent2?.querySelector('.checksBoxMail_'+count);
          input.checked = condition.target.checked;
          count++;
        });

        if(condition.target.checked){
          var countfor = 0;
          for await(let data of this.numbMailsArr_notForAll){
            this.arr_Checked.push(new Array<any>(data.IDS, countfor));
            countfor++;
          }
        }
      }
    }
  }

  //Check manually checkBox__________________________________________________
  funcChecked_manually(number: number, event: any): void{
    if(!this.condition_Delete){
      var id = this.numbMailsArr_notForAll[number].IDS;
      if(this.condition_checkedAll){
        if(!event.target.checked){
          this.arr_Checked = this.arr_Checked.filter(data => data[0] != id);
        }else{
          this.arr_Checked.push(new Array<any>(id, number));
        }
      }else{
        if(event.target.checked){
          this.arr_Checked.push(new Array<any>(id, number));
        }else{
          this.arr_Checked = this.arr_Checked.filter((data) => data[0] != id);
        }
      }
    }
  }

  //Delete the checked box mails_______________________________________________________
  deleteMailsMessage: boolean = false;
  successDelete: boolean = false;
  messageDelete: string = 'Deleting the mails';
  deleteMails(){
    if(this.arr_Checked.length > 0 && !this.condition_Delete){
      this.successDelete = true;
      this.deleteMailsMessage = true;
      this.condition_Delete = true;

      this.messageDelete = `Deleting the mail${this.arr_Checked.length > 1 ? 's':''}`;

      this.subs = this.service.deleteMails(this.arr_Checked, 'accept').subscribe(async (result) => {
        this.subs.unsubscribe();

        this.messageDelete = `Successfully deleting Mail${this.arr_Checked.length > 1 ? 's':''}`;
        this.successDelete = false;


        setTimeout(() => this.deleteMailsMessage = false, 1000);
      

        this.condition_Delete = false; 
        this.condition_selectMails = false;
        this.numbCountSkip = 0;
        this.numbCountLimit = 15;
        this.condition_loading = true;
        this.st_LoadingNoData = 'Loading...';
        this.funcCallMails();
      }, (err) => {
        this.subs.unsubscribe();
        location.reload();
      });
    }
}
}
