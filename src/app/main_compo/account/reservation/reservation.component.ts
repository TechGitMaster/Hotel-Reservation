import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MainServiceService } from 'src/app/main_serivce/main-service.service';
import { reservation } from 'src/app/objects';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css']
})
export class ReservationComponent implements OnInit {

  constructor(private service: MainServiceService) { }

  subs!: Subscription;
  skip!: number;
  limit!: number;

  arr_data!: Array<reservation>;
  radioName!: string;
  loadingMessage!: string;
  nomalizeSelected!: string;
  count!: number;
  count_for5!: number;

  ngOnInit(): void {
    this.count = 0;
    this.count_for5 = 0;

    this.skip = 0;
    this.limit = 5;
    this.radioName = 'pending';
    this.nomalizeSelected = this.radioName.charAt(0).toUpperCase() + this.radioName.slice(1);

    this.getData();
  }
  

  //Get data reservation_____________________________________________________________
  getData(): void{
    this.arr_data = new Array<reservation>();
    this.loadingMessage = 'Loading...';

    this.subs = this.service.getReservation(this.skip, this.limit, (this.radioName === 'pending' ? 'all':this.radioName)).subscribe((result) => {
      this.subs.unsubscribe();

      if(result.response === 'success'){
        this.arr_data = result.data;
        this.count = result.count;
        this.count_for5 = this.arr_data.length;
      }else{
        this.count = 0;
        this.count_for5 = 0;
        this.loadingMessage = result.response;
      }

    }, (err) => {
      this.subs.unsubscribe();
      location.reload();
    });
  }

  //right bttn________________________________________________________
  right(): void{
    if(this.arr_data.length != 0){
      if(this.limit < this.count){
        this.skip += 5;
        this.limit += 5;
        this.getData();
      }
    }
  }


  //left bttn_______________________________________________________
  left(): void{
    if(this.arr_data.length != 0){
      if(this.skip != 0){
        this.skip -= 5;
        this.limit -= 5;
        this.getData();
      }
    }
  }


  //Click radio bttn__________________________________________________________________________
  chnageR(event: any): void{
    var nomalizeSelected = event.target.value.charAt(0).toLowerCase() + event.target.value.slice(1);
    if(nomalizeSelected === 'pending' || nomalizeSelected === 'accepted' || nomalizeSelected === 'declined' || nomalizeSelected === 'canceled'){
      this.clickRadio(nomalizeSelected);
    }else{
      this.clickRadio('pending');
    }
  }
  clickRadio(name: string): void{
    this.radioName = name;
    this.nomalizeSelected = this.radioName.charAt(0).toUpperCase() + this.radioName.slice(1);
    this.getData();
  }


  //checking the date and also if it's new___________________________________
  month_names: Array<string> = new Array<string>('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 
  'Dec');
  checking(condition: boolean, dates: string): string{

    let str = '';

    let date = new Date();
    let handle_date = dates.split(',')[1].split(' ');

    if(handle_date[0] === this.month_names[date.getMonth()] && handle_date[1] === ''+date.getDate() &&
      handle_date[2] === ''+date.getFullYear()){
        str = (condition ? 'new': dates.split(',')[0]);
    }else{
      str = (condition ? '': dates.split(',')[1]);
    }

    return str;
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

    return `${converted_hours2}:${converted_minutes} ${amPm},${this.month_names[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
  } 

  //Cancel bttn request___________________________________________________________________
  cancelRequest(numb: number): void{
    this.service.emitCall(new Array<any>("yesNo", "Cancel request", "Are you sure you want to cancel this request?"));

    this.subs = this.service.emitBack.subscribe((result) => {
      this.subs.unsubscribe();      
      if(result[0]){
        this.subs = this.service.cancelReservation(this.arr_data[numb]._id, this.arr_data[numb].room_id, 
          this.arr_data[numb].email_id, this.arr_data[numb].email, this.date_converting(), this.arr_data[numb].first_name, this.arr_data[numb].last_name)
        .subscribe((res) => { 
            this.subs.unsubscribe();

            this.selected_condition = false;
            this.skip = 0;
            this.limit = 5;
            this.getData();
            this.clickBack_selected();
        }, (err) => {
          this.subs.unsubscribe();
          location.reload();
        });
      }
    });
  }


  //move to trash reservation________________________________________________________
  movetoTrash(numb: number): void{
    this.subs = this.service.moveTo_trash_Reservation(this.arr_data[numb]._id, this.arr_data[numb].room_id, this.arr_data[numb].email_id).subscribe((res) => {
      this.subs.unsubscribe();

      this.selected_condition = false;
      this.skip = 0;
      this.limit = 5;
      this.getData();
      this.clickBack_selected();
    }, (err) => {
      this.subs.unsubscribe();
      location.reload();
    })
  }


  //click back selected____________________________________________________________
  clickBack_selected(): void{
    if(this.condition_delete){
      this.selected_condition = false;
      this.condition_ShowUpdate = false;
      setTimeout(() => {
        let rad1 = <HTMLInputElement>document.querySelector('#flexRadioDefault1');
        let rad2 = <HTMLInputElement>document.querySelector('#flexRadioDefault2');
        let rad3 = <HTMLInputElement>document.querySelector('#flexRadioDefault3');
        let rad4 = <HTMLInputElement>document.querySelector('#flexRadioDefault4');
        rad1.checked = false;

        switch(this.radioName){
          case 'pending':
            rad1.checked = true;
          break;
          
          case 'accepted':
            rad2.checked = true;
          break;

          case 'declined':
            rad3.checked = true;
          break;
          
          case 'canceled':
            rad4.checked = true;
          break;

        }
      }, 10);
    }
  }

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

  //Click details_______________________________________________________________________________
  selected_condition: boolean = false;
  arr_selected_data: Array<any> = new Array<any>();
  arr_image_tempo: Array<string> = new Array<string>();
  arr_image_blob: Array<any> = new Array<any>();

  condition_delete: boolean = true;
  condition_ShowUpdate: boolean = false;
  click_details(numb: number): void{
    this.condition_delete = true;
    this.arr_image_tempo = new Array<string>();
    this.arr_image_blob = new Array<any>();
    this.arr_selected_data = [this.arr_data[numb], numb];
    this.selected_condition = true;
  }

  //IMAGE UPDATE____________________________________________________________________________
  //This is to add image to Temporary Array______________________________________________
  async selectImage(event: any){
    if(!!event.target.files){
      for await(let file of event.target.files){

        if(file.size <= 500000){
          this.condition_ShowUpdate = true;

          let reader = new FileReader();
          reader.readAsDataURL(file);

          reader.onload = (fileConverted) => {
            this.arr_image_tempo.push(''+fileConverted.target?.result);

            //This is blob for uploading the image to cloudinary___________________
            this.arr_image_blob.push([''+fileConverted.target?.result, file]);

          }
        }else{
          alert(`${file.name} is more than 500kb`);
        }
      }
    }
  }


  //Delete image_________________________________________________________________________________________________________
  async deleteImage(url: string){
    this.arr_image_tempo = this.arr_image_tempo.filter((data) => data !== url);
    this.arr_image_blob = this.arr_image_blob.filter((data) => data[0] !== url);

    if(this.arr_image_tempo.length == 0){
      this.condition_ShowUpdate = false;      
    }
  }


  //Upload Image_____________________________________________________________________________
  uploadImage(): void{
    if(this.arr_image_blob.length > 0){
      this.condition_delete = false;
      this.condition_ShowUpdate = false;

      let percent = Math.floor(Math.random() * 90);

      this.service.emitCall(new Array<any>('progress', percent, 'Updating image to your request.'));

      this.subs = this.service.uploadImage(this.arr_image_blob).subscribe((result) => {
        this.subs.unsubscribe();

        let new_img_data = this.arr_selected_data[0].image_transaction;
        for(let data of result.data){
          new_img_data.push(data);
        }

        this.service.emitCall(new Array<any>('progress', (percent+5), 'Updating image to your request.'));

        this.subs = this.service.updateReservation_image(this.arr_selected_data[0]._id, this.arr_selected_data[0].room_id, 
          this.arr_selected_data[0].email_id, new_img_data).subscribe((ress) => {
            this.subs.unsubscribe();
            this.service.emitCall(new Array<any>('progress', 100, 'Successfully updating the image.'));
            this.arr_image_tempo = new Array<string>();

            setTimeout(() => {
              this.arr_selected_data[0].image_transaction = new_img_data;
              this.condition_delete = true;
            }, 100);

        });
        

      });
    }
  }
  
  //________PRINTING___________
  printing_condition: boolean = false;
  printing(): void{
    this.printing_condition = true;
    setTimeout(() => {
      window.print();
      this.printing_condition = false;
    }, 200);
  }

  //________IMG SELECTED__________
  img_selected(image: string): void{
    this.service.emit_selectedImage(image);
  }

}
