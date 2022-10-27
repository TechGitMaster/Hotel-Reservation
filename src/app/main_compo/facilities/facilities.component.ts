import { Component, OnInit } from '@angular/core';
import { ImageFacilities } from '../../objects'

@Component({
  selector: 'app-facilities',
  templateUrl: './facilities.component.html',
  styleUrls: ['./facilities.component.css']
})
export class FacilitiesComponent implements OnInit {

  constructor() { }

  img_selected: string = '';

  Image_Facilities!: Array<ImageFacilities>;
  Image_Gym!: Array<any>;
  Image_Ground!: Array<any>;
  Image_Pool!: Array<any>;

  ngOnInit(): void {
    this.Image_Facilities = new Array<ImageFacilities>({
      url: '/assets/image/m_1.jpg',
      row: '1/3',
      col: ''
     },
     {
      url: '/assets/image/m_2.jpg',
      row: '',
      col: ''
     },
     {
      url: '/assets/image/m_3.jpg',
      row: '',
      col: ''
     },
     {
      url: '/assets/image/m_4.jpg',
      row: '',
      col: ''
     },
     {
      url: '/assets/image/m_5.jpg',
      row: '',
      col: ''
     },
     {
      url: '/assets/image/m_6.jpg',
      row: '2/4',
      col: '3'
     }
     );

      this.Image_Gym = new Array<any>(
        { 
          image: "/assets/image/g_1.jpg",
          thumbImage: "/assets/image/g_1.jpg"
        }, 
        { 
          image: "/assets/image/g_2.jpg",
          thumbImage: "/assets/image/g_2.jpg"
        },
        { 
          image: "/assets/image/g_3.jpg",
          thumbImage: "/assets/image/g_3.jpg"
        }
      );

      this.Image_Ground = new Array<any>(
        { 
          image: "/assets/image/gr_1.jpg",
          thumbImage: "/assets/image/gr_1.jpg"
        }, 
        { 
          image: "/assets/image/gr_2.jpg",
          thumbImage: "/assets/image/gr_2.jpg"
        }, 
        { 
          image: "/assets/image/gr_3.jpg",
          thumbImage: "/assets/image/gr_3.jpg"
        }, 
        { 
          image: "/assets/image/gr_4.jpg",
          thumbImage: "/assets/image/gr_4.jpg"
        }, 
      );

      this.Image_Pool = new Array<any>(
        { 
          image: "/assets/image/p_1.jpg",
          thumbImage: "/assets/image/p_1.jpg"
        }, 
        { 
          image: "/assets/image/p_2.jpg",
          thumbImage: "/assets/image/p_2.jpg"
        },
        { 
          image: "/assets/image/p_3.jpg",
          thumbImage: "/assets/image/p_3.jpg"
        },
      );

  }

  selected_img(numb: number): void{
    this.img_selected = this.Image_Facilities[numb].url;
  }

}
