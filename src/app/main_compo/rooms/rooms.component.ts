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
 
  minCheckIn!: string;
  minCheckOut!: string;

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
    autoplay: true,
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
    this.checkIn_mess = 'Check in';
    this.checkOut_mess = 'Check out';
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

    let month = (this.date.getMonth()+1) < 10 ? `0${(this.date.getMonth()+1)}`:(this.date.getMonth()+1);
    let day = (this.date.getDate()) < 10 ? `0${(this.date.getDate())}`:(this.date.getDate());
    this.minCheckIn = `${this.date.getFullYear()}-${month}-${day}`;
    this.minCheckOut = '';
  }

  asd(num: number): void{
  }


  //Check-in bttn______________________________________________
  checkIn(event: any): void{
    let date = event.target.value.split('-');
    let day = parseInt(date[2])+1;
    this.minCheckOut = `${date[0]}-${date[1]}-${day}`;
    this.checkIn_mess = event.target.value;

    this.checkOut_mess = 'Check out';
  }

  //Check-out bttn______________________________________________
  checkOut(event: any): void{
    this.checkOut_mess = event.target.value;
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
    if(this.checkIn_mess !== 'Check in' && this.checkOut_mess !== 'Check out'){
      if(this.persons_count > -1){
        if(this.room_selected !== ''){

          if(this.checkingDateCheckInout_good()){
            let reservation = {
              checkIn: this.checkIn_mess,
              checkOut: this.checkOut_mess,
              personsCount: this.persons_count,
              room_sh: this.room_selected
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
      if(this.checkIn_mess === 'Check in'){
        alert('Check in is empty.');
      }else{
        alert('Check out is empty.');
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

}
