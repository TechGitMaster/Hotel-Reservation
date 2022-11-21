import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Subscription } from 'rxjs';
import { MainServiceService } from 'src/app/main_serivce/main-service.service';
import { getRoomsLandpage } from '../../objects';
import { OwlOptions, SlidesOutputData } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.css']
})
export class RoomsComponent implements OnInit {

  constructor(private service: MainServiceService, private router: Router, private cookieService: CookieService) { }

  date!: Date;
  condition_have_room!: boolean;
  final_converted_data!: Array<getRoomsLandpage>;
  subs!: Subscription;
 
  minCheckIn!: Date;
  minCheckOut!: Date;

  checkIn_mess!: string;
  checkOut_mess!: string;
  persons_count!: number;
  room_selected!: string;

  txt_availableNot!: string;
  roomName_arr!: Array<any>;

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    navSpeed: 1000,
    autoplay: false,
    autoplaySpeed: 1000,
    autoplayTimeout: 5000,
    autoplayMouseleaveTimeout: 5000,
    autoplayHoverPause: true,
    navText: ['', ''],
    center: false,
    lazyLoad: true,
    slideBy: 'page',
    autoHeight: true,
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 1
      },
      740: {
        items: 1
      },
      940: {
        items: 1
      }
    },
    nav: false
  };

  ngOnInit(): void {
    this.getRooms();
  }



  //SECLECTION ______________________________________________________________________________________________
  serviceSelectedCall: string = 'All';
  roomSelectedCall: string = 'All';
  changeService(event: any): void{
    if(event.target.value === 'All' || event.target.value === 'Rental' || event.target.value === 'Staycation'){
      this.serviceSelectedCall = event.target.value;
    }else{
      this.serviceSelectedCall = 'All';
    }
    this.getRooms();
  }

  changeRoom(event: any): void{
    if(event.target.value === 'All' || event.target.value === 'Studio' || event.target.value === '1bedroom' || event.target.value === '2bedroom'){
      this.roomSelectedCall = event.target.value;
    }else{
      this.roomSelectedCall = 'All';
    }
    this.getRooms();
  }


  img_selected: string = '';
  condition_move: boolean = false;
  condition_down: boolean = false;
  mouseDown(): void{
    this.condition_down = true;
  }
  mouseMove(): void{
    if(this.condition_down) this.condition_move = true;
  }
  selectedImage(parent_num: number, child_num: number): void{
    if(!this.condition_move) {
      this.img_selected = this.final_converted_data[parent_num].imgArr[child_num].image;
    }
    this.condition_move = false;
    this.condition_down = false;
  }

  //GET THE ROOMS________________________________________________________________________________________________________
  getRooms(): void{
    this.checkIn_mess = 'Check in date';
    this.checkOut_mess = 'Check out date';
    this.persons_count = -1;
    this.room_selected = '';
    this.txt_availableNot = 'Select room';

    let doc = <HTMLSelectElement>document.querySelector('.selectSS');
    doc.value = 'Person';

    this.final_converted_data = new Array<getRoomsLandpage>();
    this.condition_have_room = false;
    this.roomName_arr = new Array<any>();

    //GET ALL ROOM___________________________________________________________
    this.subs = this.service.getAllRoom(this.serviceSelectedCall, this.roomSelectedCall).subscribe(async (result) => {
      this.subs.unsubscribe();
      this.condition_have_room = true;
        if(result.response === 'success'){

          let condition = false;

          //Room_________________________________________________
          for await(let data of result.data){
            let arr_img = new Array<any>();
            let count_num = 0;
            for await(let imgI of data.imgArr){
              count_num += 1;
              arr_img.push( {
                id: ''+count_num,
                image: imgI[0],
                thumbImage: imgI[0],
              });
            }

            let objs = {
              _id: data._id,
              nameRoom: data.nameRoom,
              addInfo: data.addInfo,
              defaultPrice: data.defaultPrice,
              goodPersons: data.goodPersons,
              pricePersons: data.pricePersons,
              typeRoom: data.typeRoom,
              typeRoom2: data.typeRoom2,
              imgArr: arr_img,
              confirmNot: data.confirmNot,
              Left_Or_Right: !condition ? 'right':'left'
            } as getRoomsLandpage;

            condition = !condition ? true:false;
            this.final_converted_data.push(objs);
          }   

          //Room name_________________________________________________________
          for await(let data of result.rooms_DataF){
            if(data.confirmNot === 'false' && data.typeRoom) this.roomName_arr.push([data._id, data.nameRoom]);
          }

          this.txt_availableNot = this.roomName_arr.length > 0 ? 'Select room':'No Available room';
        }else{
          this.txt_availableNot = "No Available room"   
        }
    }); 

    this.date = new Date() as Date;

    this.minCheckIn = new Date();
    this.minCheckOut = new Date();
  }




  //Check-in bttn______________________________________________
  async checkIn(event: any){
    
    let arr_month = new Array<string>('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec');

    const arr_data = ''+event.target.value;
    let date_arr = arr_data.split(' ');

    
    //Get month______________________________________
    let count = 0;
    let handle_month_count = 0;
    let converting_int_String = "";
    let for_month = "";
    for await (let datas_month of arr_month){
      if(datas_month === date_arr[1]){
        handle_month_count = (count);
      }
      count++;
    }

    if(handle_month_count < 10){
      converting_int_String = "0"+(handle_month_count);
      for_month = "0"+(handle_month_count+1);
    }else{
      converting_int_String = ""+(handle_month_count);
      for_month = ""+(handle_month_count+1);
    }

    this.minCheckOut = new Date(parseInt(date_arr[3]), parseInt(converting_int_String), parseInt(date_arr[2])+1);

    this.checkIn_mess = `${date_arr[3]}-${for_month}-${date_arr[2]}`;

    this.checkOut_mess = 'Check out date';
  }

  //Check-out bttn______________________________________________
  async checkOut(event: any){
    let arr_month = new Array<string>('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec');

    const arr_data = ''+event.target.value;
    let date_arr = arr_data.split(' ');

    
    //Get month______________________________________
    let count = 0;
    let handle_month_count = 0;
    let converting_int_String = "";
    for await (let datas_month of arr_month){
      if(datas_month === date_arr[1]){
        handle_month_count = count;
      }
      count++;
    }

    if(handle_month_count < 10){
      converting_int_String = "0"+(handle_month_count+1);
    }else{
      converting_int_String = ""+(handle_month_count+1);
    }

    this.checkOut_mess = `${date_arr[3]}-${converting_int_String}-${date_arr[2]}`;
  }

  //Persons selection_______________________________________________
  persons(event: any): void{
    if(event.target.selectedIndex-1 != -1){
      this.persons_count = parseInt(event.target.selectedIndex);
    }else{
      this.persons_count = -1;
    }
  }

  //Room name________________________________________________________
  roomName(event: any): void{
    if(event.target.selectedIndex-1 != -1){
      this.room_selected = this.roomName_arr[event.target.selectedIndex-1][0];
    }else{
      this.room_selected = '';
    }
  }


  //Reserve bttn____________________________________________________________________
  reserveBttn(): void{
    if(this.checkIn_mess !== 'Check in date' && this.checkOut_mess !== 'Check out date'){
      if(this.persons_count > -1){
        if(this.room_selected !== ''){

          if(this.checkingDateCheckInout_good()){
            let reservation = {
              checkIn: this.checkIn_mess,
              checkOut: this.checkOut_mess,
              personsCount: this.persons_count,
              room_sh: this.room_selected,
              time: new Date().getMinutes()
            };
            
            var token = this.cookieService.get('token');
  
            if(token !== '' && token !== ' '){
              this.subs = this.service.token_get(reservation).subscribe((ress) => {
                this.subs.unsubscribe();
  
                if(ress._ds){ 
                  this.service.emit_PaymentExpired(false);
                  this.router.navigate([`/mc/payment/${ress.data}`]);
                }else{
                  location.reload();
                }
              });
            }else{
              this.subs = this.service.token_get(reservation).subscribe((ress) => {
                this.subs.unsubscribe();
                this.service.emit_PaymentExpired(false);
                this.router.navigate([`/mc/payment/${ress.data}`]);
              });
            }
          }

        }else{
          alert('Select a room.');
        }
      }else{
        alert('Select how many person.');
      }
    }else{
      if(this.checkIn_mess === 'Check in date'){
        alert('Check in date is empty.');
      }else{
        alert('Check out date is empty.');
      }
    }
  }

  checkingDateCheckInout_good(): boolean{
    let checkIn = this.checkIn_mess.split('-');
    let checkOut = this.checkOut_mess.split('-');

    let condition = false;

    if(this.date.getFullYear() <= parseInt(checkIn[0]) && this.date.getMonth() <= parseInt(checkIn[1]) && this.date.getDate() <= parseInt(checkIn[2])){
      if(parseInt(checkIn[0]) <= parseInt(checkOut[0])){

        if(parseInt(checkIn[1]) == parseInt(checkOut[1]) && (parseInt(checkIn[2])+1) <= parseInt(checkOut[2])){
          condition = true;
        }else if(parseInt(checkIn[1]) < parseInt(checkOut[1])){
          condition = true;
        }else{
          alert('Check-out is not on current date of check in.');
        }

       }else{
        alert('Check-out is not on current date of check in.');
       }
    }else{
      alert('Check-in is not on current date.');
    }

    return condition;
  }

  //Click bttn_____________________________________________________________________
  scrollUp(): void{
    window.scrollTo({ top: 0 });
    return;
  }


  //Navigate to contact us________________________________________________
  navigates(): void{
    window.scrollTo({ top: 0 });

    setTimeout(() => {
      this.router.navigate(['/mc/contact-us']);
    }, 350);
  }


  //Set appointment__________________________________________________________________
  appointment_go(): void{
    document.getElementById("room_divs")?.scrollIntoView(false)
    setTimeout(() => {
      window.scrollBy(0,550);
    }, 400)
  }

}
