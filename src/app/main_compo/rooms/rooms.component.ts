import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MainServiceService } from 'src/app/main_serivce/main-service.service';
import { getRoomsLandpage } from '../../objects';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.css']
})
export class RoomsComponent implements OnInit {

  constructor(private service: MainServiceService, private router: Router) { }

  condition_have_room!: boolean;
  final_converted_data!: Array<getRoomsLandpage>;
  subs!: Subscription;
  ngOnInit(): void {
    this.final_converted_data = new Array<getRoomsLandpage>();
    this.condition_have_room = false;

    //GET ALL ROOM___________________________________________________________
    this.subs = this.service.getAllRoom().subscribe(async (result) => {
      this.subs.unsubscribe();
      this.condition_have_room = true;
        if(result.response === 'success'){

          let condition = false;
          for await(let data of result.data){

            let objs = {
              _id: data._id,
              nameRoom: data.nameRoom,
              addInfo: data.addInfo,
              defaultPrice: data.defaultPrice,
              goodPersons: data.goodPersons,
              pricePersons: data.pricePersons,
              typeRoom: data.typeRoom,
              imgArr: data.imgArr,
              confirmNot: data.confirmNot,
              Left_Or_Right: !condition ? 'right':'left'
            } as getRoomsLandpage;

            condition = !condition ? true:false;
            this.final_converted_data.push(objs);
          }   

        }
    }); 
  }


  reserve(id: number): void{
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
