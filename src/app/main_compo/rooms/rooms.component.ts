import { Component, OnInit } from '@angular/core';
import { dataRooms } from './objects';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.css']
})
export class RoomsComponent implements OnInit {

  handle_data_rooms!: dataRooms;

  sample_data: Array<Array<any>> = 
    new Array<Array<any>>( [0, 'Studio Type with Balcon', 'Located in General Roxas Ave, Cubao, Quezon City, Metro Manila.',
    'Manhattan Plaza Tower 1', '11-D', '1 Bedroom Studio type', '30.20 SQM', '', new Array<string>("/assets/image/roomsample.png") ]
    );

  final_converted_data!: Array<any>;

  constructor() { }

  ngOnInit(): void {

    this.final_converted_data = new Array<any>();
    var condition_left_or_right = true;
    for(var count = 0;count < this.sample_data.length;count++){
      this.handle_data_rooms = { 
        id: this.sample_data[count][0],
        title: this.sample_data[count][1],
        txt: this.sample_data[count][2],
        tower: this.sample_data[count][3],
        info1: this.sample_data[count][4],
        info2: this.sample_data[count][5],
        info3: this.sample_data[count][6],
        images: this.sample_data[count][8],
        Left_Or_Right: (condition_left_or_right ? 'right':'left'),
       }

       if(condition_left_or_right){
        condition_left_or_right = false;
       }else{
        condition_left_or_right = true;
       }

       this.final_converted_data.push(this.handle_data_rooms);
    }
  }


  reserve(id: number): void{
    return;
  }
}
