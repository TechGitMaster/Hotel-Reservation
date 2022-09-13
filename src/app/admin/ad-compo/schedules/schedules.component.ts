import { Component, OnInit } from '@angular/core';
import { WeekService, MonthService, WorkWeekService, EventSettingsModel, DragEventArgs, PopupCloseEventArgs } from '@syncfusion/ej2-angular-schedule';
import { of, Subscription } from 'rxjs';
import { AdServiceService } from '../../ad-service.service';
import { timeDate, date, schedAppointment, calendarApp } from '../../../objects';

@Component({
  selector: 'app-schedules',
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.css']
})
export class SchedulesComponent implements OnInit {

  subs!: Subscription;
  subsCalendar!: Subscription;
  subsAppointment!: Subscription;

  calendar: any = document.querySelector('.calendar');
  condition_clickedmonth!: boolean;

  month_names: Array<string> = new Array<string>('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 
  'Dec');


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
  array_data_notAvailable: Array<date> = new Array<date>();

  str_AMPM!: string;
  AM_avail!: Array<string>;
  PM_avail!: Array<string>;

  data_schedAppointment!: Array<schedAppointment>;
  goForCalendarAppointment: Array<calendarApp> = new Array<calendarApp>();
  data_AppointmentDeleted!: Array<schedAppointment>;

  header_info!: Array<any>;

  public eventSettings!: EventSettingsModel;
  constructor(private service: AdServiceService) { }

  ngOnInit(): void {
    this.data_AppointmentDeleted = new Array<schedAppointment>();
    this.header_info = new Array<any>(true);

    this.str_AMPM = "Loading...";
    this.PM_avail = new Array<string>();
    this.AM_avail = new Array<string>();
    this.count_0day = 0;
    this.day_year_month_selected = new Array<string>("", "", "");
    this.day_year_month_selected[0] = "0";

    this.condition_clickedmonth = false;
    this.day_numbers = new Array<Array<string>>();    


    //This is to get the timeDate____________________________________________________
    this.subsCalendar = this.service.getTimdate().subscribe((result) => {
      this.subsCalendar.unsubscribe();
      let res = {
        PM: result.PM,
        AM: result.AM,
        DATE: result.DATE
      } as timeDate;

      this.AM_avail = res.AM;
      this.PM_avail = res.PM;
      this.array_data_notAvailable = res.DATE;

      if(this.AM_avail.length == 0 || this.PM_avail.length == 0){
        this.str_AMPM = "No time available.";
      }

      this.generateCalendar(this.curr_month.value, this.curr_year.value);

      //Disable past month_________________________________________________
      this.disableMonths();
    },(error) => 
    {
      this.subs.unsubscribe();
      location.reload()
    });

    this.getAppointments();
  }


  //Click change to deleted shedules and show all schedules______________________________________________________________
  click_change_header(): void{
    if(this.header_info[0]){
      this.getDeleted_Appointment();
      this.header_info = new Array<any>(false);
    }else{
      this.getAppointments();
      this.header_info = new Array<any>(true);
    }

  }


  //Get the deleted appointment_______________________________________________________________
  message: string = '';
  getDeleted_Appointment(): void{
    this.data_AppointmentDeleted = new Array<schedAppointment>();
    this.message = 'Loading...';

    var subs = this.service.getDeletedAppointment().subscribe((ress) => {
      subs.unsubscribe();

      if(ress.response === 'success'){
        this.message = 'success';
        this.data_AppointmentDeleted = ress.data;
      }else{
        this.message = 'No deleted schedule ever recorded.';
      }

    }, (err) => {
      subs.unsubscribe();
      location.reload();
    });

  }

  //Retrieve appointment_______________________________________________________________________
  retrieve(numb: number): void{
    var subs = this.service.retrieve_appointment(this.data_AppointmentDeleted[numb]._id).subscribe(() => {
      subs.unsubscribe();
      this.getDeleted_Appointment();
    }, (err) => {
      subs.unsubscribe();
      location.reload();
    });
  }

  //This is to delete permanently the schedule______________________________________________________
  deleteSched(numb: number): void{
    this.service.openCall(new Array<any>("deleteEvent"));

    var subs = this.service.backEmitter.subscribe((ress) => {
      subs.unsubscribe();
      if(ress[0] && ress[1]){
        subs = this.service.delete_permanently(this.data_AppointmentDeleted[numb]._id).subscribe(() => {
          subs.unsubscribe();
          this.getDeleted_Appointment();
        }, (err) => {
          subs.unsubscribe();
          location.reload();
        })
      }
    });
  }




  //This is to get all the appointment of the admin___________________________________________________
  getAppointments(): void{
    //this is to remove license alert window of scheduler.js_____________________________________ 
    try{
      setTimeout(() => {
        let jslicensing = <HTMLDivElement>document.querySelector('#js-licensing');
        jslicensing.remove();
      }, .1);
    }catch(err){
      window.onload = () => {
        setTimeout(() => {
          let jslicensing = <HTMLDivElement>document.querySelector('#js-licensing');
          jslicensing.remove();
        }, .1);
      }
    }

    this.goForCalendarAppointment = new Array<calendarApp>();
    this.subsAppointment = this.service.getAllSched().subscribe((result) => {
      this.subsAppointment.unsubscribe();
      if(result.response === 'success'){
        this.data_schedAppointment = result.data;
        for(let count = 0;count < this.data_schedAppointment.length;count++){
          let date = this.data_schedAppointment[count].date.split(' ');
          let month = this.month_names.indexOf(date[0]);
          let day = parseInt(date[1]);
          let year = parseInt(date[2]);

          let timeArr = this.data_schedAppointment[count].timeDate.split(',')[0].split(" ")[0].split(":");
          let hours = parseInt(timeArr[0]);
          let minutes = parseInt(timeArr[1]);

          //Add to array object________________________________________
          this.goForCalendarAppointment.push(
            { 
              id: this.data_schedAppointment[count]._id,
              Subject: "Appointment",
              Description: `<span>Full name: ${this.data_schedAppointment[count].fullname}</span><br/>
                            <span>Email: ${this.data_schedAppointment[count].reserved_email}</span><br/>
                            <span>Number of guest: ${this.data_schedAppointment[count].numGuest}</span><br/>
                            <span>Contact number: ${this.data_schedAppointment[count].contact_num}</span><br/><br/>
                            <span>${this.data_schedAppointment[count].message}</span>`,

              StartTime: new Date(year, month, day, hours, minutes),
              EndTime: new Date(year, month, day, hours, minutes)
            } as calendarApp);


            if(count == this.data_schedAppointment.length-1){
              //This is to set the data to Scheduler_____________________________________________
              this.eventSettings = { dataSource: this.goForCalendarAppointment, allowEditing: false, allowAdding: false };
            }
        }
      } 
    },(error) => 
    {
      this.subs.unsubscribe();
      location.reload()
    });
  }



  //APPOINTMENT SCHEDULE Action______________________________________________________________________________________________________
  subsDeleteEvent!: Subscription;
  backSubs!: Subscription;

  popupOpen(args: PopupCloseEventArgs): void{
    if(args.type === 'DeleteAlert'){
      args.cancel = true;
      this.deleleFunc(args);
    }
  }
  
  deleleFunc(args: any): void{
    let obs = args.data as any;
    this.service.openCall(new Array<any>("chooseSchedMoveTrash_cancel"));

    this.backSubs = this.service.backEmitter.subscribe((res) => {
      this.backSubs.unsubscribe();
      if(res[0]){
        if(res[1]){
          this.goForCalendarAppointment = this.goForCalendarAppointment.filter((obj) => { return obj.id !== obs['id'] });

          this.subsDeleteEvent = this.service.cancelTrashEvent(obs['id'], res[2]).subscribe(() => {
            this.subsDeleteEvent.unsubscribe();
            this.eventSettings = { dataSource: this.goForCalendarAppointment, allowEditing: false, allowAdding: false }; 
          },(error) => 
          {
            this.subs.unsubscribe();
            location.reload()
          });
        }
      }
    });
  }


















  //CALENDAR AND TIME SCHEDULE______________________________________________________________________________________________________



  isLeapYear(year: any): any {
    return (year % 4 === 0 && year % 100 !== 0 && year % 400 !== 0) || (year % 100 === 0 && year % 400 ===0)
  }

  getFebDays(year: any): any{
    return this.isLeapYear(year) ? 29 : 28;
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
      var condition = "false";

      if (i >= first_day.getDay()) {

        //Disable past days on current month____________________________________________________________
        if(year === currDate.getFullYear() && month === currDate.getMonth()){
          if(((i - first_day.getDay() + 1) >= currDate.getDate())){
            condition = "true";
          }
        }else{
          condition = "true";
        }

        //Check not available days____________________________________________________________
        if(condition !== 'false'){
          for await (let data of this.array_data_notAvailable){
            if(`${(i - first_day.getDay() + 1)}` === data.day && `${ month }` === data.month && `${ this.year_selected }` === data.year){
              condition = "falses";
            }
          }
        }
        
        var array = new Array<string>( `${(i - first_day.getDay() + 1)}`, condition);

        this.day_numbers.push(array);

      }else{
        this.count_0day += 1;
        this.day_numbers.push(new Array<string>("", ""));
      }
  }
}

month_list:any = document.querySelector('.month-list');

numshandlePickDay: number = 0;
condition_clicked: boolean = false;
condition_checkBox: boolean = false;

checkBoxes(event: any): void{
  this.condition_checkBox = event.target.checked;
}

daypick(index: string, condition: string, indexNum: number){
  var ofIn = this.month_names.indexOf(this.month_select);
  if(!this.condition_clicked && this.condition_checkBox){
    this.condition_clicked = true;
    if(condition === 'true'){
      this.array_data_notAvailable.push({day: index, month: ''+ofIn, year: this.year_selected});
      this.day_numbers[indexNum][1] = "falses";

      this.subs = this.service.saveDate(this.array_data_notAvailable).subscribe((result) => {
        this.subs.unsubscribe();
        this.condition_clicked = false;
      },(error) => 
      {
        this.subs.unsubscribe();
        location.reload()
      });
    }else if(condition === 'falses'){
      this.day_numbers[indexNum][1] = "true";
      let handleNu = 0;
      
      for(let count = 0;count < this.array_data_notAvailable.length;count++){


        if(this.array_data_notAvailable[count].day === index && this.array_data_notAvailable[count].month === ''+ofIn &&
          this.array_data_notAvailable[count].year === this.year_selected){
            handleNu = count;
        }

        if(count == this.array_data_notAvailable.length-1){
          this.array_data_notAvailable.splice(handleNu, 1);
          this.subs = this.service.saveDate(this.array_data_notAvailable).subscribe((result) => {
            this.subs.unsubscribe();
            this.condition_clicked = false;
          },(error) => 
          {
            this.subs.unsubscribe();
            location.reload()
          });
        }
      }
    }
  }
}

daypick_hover(numbCondition: string, condition: string, mouseCondition: string){
  if(condition === 'true' || condition === 'falses'){
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




  subsEmitTimer!: Subscription;
  condition_add: boolean = true;
  condition_delete: boolean = false;
  checkBoxsAM: Array<number> = new Array<number>();
  checkBoxsPM: Array<number> = new Array<number>();

  //Add Slots AM__________________________________________________________________
  clickAddAM(): void{
    if(this.condition_add){
      this.service.openCall(new Array<any>("time", "Morning", "09:00 AM to 11:59 AM", "09", "11"));
      this.subsEmitTimer = this.service.backEmitter.subscribe(async (result) => {
        this.subsEmitTimer.unsubscribe();

        if(result[0]){
          let time = result[1]+":"+result[2];
          let conditionH = false;

          for await (let sd of this.AM_avail){
            if(sd === time){
              conditionH = true;
            }
          }
          
          if(!conditionH){
            this.AM_avail.push(time);
            this.AM_avail.sort();

            this.condition_add = false;
            this.subs = this.service.saveAM(this.AM_avail).subscribe((result) => {
              this.subs.unsubscribe();
              this.condition_add = true;
            },(error) => 
            {
              this.subs.unsubscribe();
              location.reload()
            });
          }
          
        }

      },(error) => 
      {
        this.subs.unsubscribe();
        location.reload()
      });
    }
  } 

  //Add Slots PM____________________________________________________________________________
  clickAddPM(): void{
    if(this.condition_add){
      this.service.openCall(new Array<any>("time", "Evening", "12:00 PM to 04:59 PM", "12", "16"));
      this.subsEmitTimer = this.service.backEmitter.subscribe(async (result) => {
        this.subsEmitTimer.unsubscribe();
        
        if(result[0]){
          let time = result[1]+":"+result[2];
          let conditionH = false;

          for await (let sd of this.PM_avail){
            if(sd === time){
              conditionH = true;
            }
          }

          if(!conditionH){
            this.PM_avail.push(time);
            this.PM_avail.sort();

            this.condition_add = false;
            this.subs = this.service.savePM(this.PM_avail).subscribe((result) => {
              this.subs.unsubscribe();
              this.condition_add = true;
            },(error) => 
            {
              this.subs.unsubscribe();
              location.reload()
            });
          }
        }

      },(error) => 
      {
        this.subs.unsubscribe();
        location.reload()
      });
    }
  } 

  PMConverting(time: string): string{

    let arr = time.split(':');
    let hours = parseInt(arr[0]);

    if(hours == 12) return time;

    hours -= 12;

    return `0${hours}:${arr[1]}`;

  }

  //Checkbox timer_______________________________________________________
  checkBoxeTimer(AMPM: string, index: number, event: any): void{
    let handleN = -1;
    if(AMPM === 'AM'){
      if(event.target.checked){
        this.checkBoxsAM.push(index);
      }else{
        for(let count = 0;count < this.checkBoxsAM.length;count++){
          if(this.checkBoxsAM[count] == index){
            handleN = count;
          }

          if(count+1 == this.checkBoxsAM.length){
            this.checkBoxsAM.splice(handleN);
          }
        }
      }
    }else{
      if(event.target.checked){
        this.checkBoxsPM.push(index);
      }else{
        for(let count = 0;count < this.checkBoxsPM.length;count++){
          if(this.checkBoxsPM[count] == index){
            handleN = count;
          }

          if(count+1 == this.checkBoxsPM.length){
            this.checkBoxsPM.splice(handleN);
          }
        }
      }
    }

    if(this.checkBoxsAM.length > 0 || this.checkBoxsPM.length > 0){
      this.condition_delete = true;
    }else{
      this.condition_delete = false;
    }
  }

  //Delete AM and PM_______________________________________________________________________
  async deleteCheckBox(){
    if(this.condition_delete){
      this.condition_delete = false;

      if(this.checkBoxsAM.length > 0){
        let arrTime_tmpo = this.AM_avail;

        for await(let index of this.checkBoxsAM){ 
          arrTime_tmpo = arrTime_tmpo.filter((time) => time !== this.AM_avail[index]);
        }

        this.AM_avail = arrTime_tmpo.sort();

      }

      if(this.checkBoxsPM.length > 0){
        let arrTime_tmpos = this.PM_avail;

        for await(let index of this.checkBoxsPM){
          arrTime_tmpos = arrTime_tmpos.filter((time) => time !== this.PM_avail[index]);
        }
        this.PM_avail = arrTime_tmpos.sort();
      }

    }

    if(this.checkBoxsPM.length > 0 && this.checkBoxsAM.length > 0){
      this.subs = this.service.deleteAMPM(this.AM_avail, this.PM_avail).subscribe(() => {
        this.subs.unsubscribe();

        this.checkBoxsAM = [];
        this.checkBoxsPM = [];

        this.str_AMPM = "No time available.";
      },(error) => 
      {
        this.subs.unsubscribe();
        location.reload()
      });
    }else{
      this.str_AMPM = "No time available.";
      if(this.checkBoxsAM.length > 0){
        this.subs = this.service.saveAM(this.AM_avail).subscribe(() => {
          this.subs.unsubscribe();

          this.checkBoxsAM = [];
        },(error) => 
        {
          this.subs.unsubscribe();
          location.reload()
        });
      }else{
        this.subs = this.service.savePM(this.PM_avail).subscribe(() => {
          this.subs.unsubscribe();

          this.checkBoxsPM = [];
        },(error) => 
        {
          this.subs.unsubscribe();
          location.reload()
        });
      }
    }
  }


}
