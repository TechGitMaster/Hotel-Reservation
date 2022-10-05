import { Component, OnInit } from '@angular/core';
import { ImageFacilities } from '../../objects'

@Component({
  selector: 'app-facilities',
  templateUrl: './facilities.component.html',
  styleUrls: ['./facilities.component.css']
})
export class FacilitiesComponent implements OnInit {

  constructor() { }

  Image_Facilities!: Array<ImageFacilities>;
  Image_Gym!: Array<string>;
  Image_Ground!: Array<string>;
  Image_Pool!: Array<string>;

  ngOnInit(): void {
    this.Image_Facilities = new Array<ImageFacilities>({
      url: '/assets/image/463342.png',
      row: '1/3',
      col: ''
     },
     {
      url: '/assets/image/463342.png',
      row: '',
      col: ''
     },
     {
      url: '/assets/image/463342.png',
      row: '',
      col: ''
     },
     {
      url: '/assets/image/463342.png',
      row: '',
      col: ''
     },
     {
      url: '/assets/image/463342.png',
      row: '',
      col: ''
     },
     {
      url: '/assets/image/463342.png',
      row: '2/4',
      col: '3'
     }
     );


     this.Image_Gym = new Array<string>("/assets/image/463342.png", "/assets/image/463342.png", "/assets/image/463342.png",
      "/assets/image/463342.png", "/assets/image/463342.png");

      this.Image_Ground = new Array<string>("/assets/image/463342.png", "/assets/image/463342.png", "/assets/image/463342.png",
      "/assets/image/463342.png", "/assets/image/463342.png");

      this.Image_Pool = new Array<string>("/assets/image/463342.png", "/assets/image/463342.png", "/assets/image/463342.png",
      "/assets/image/463342.png", "/assets/image/463342.png");
  }

}
