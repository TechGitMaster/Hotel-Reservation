import { Component, OnInit } from '@angular/core';
import { ImageFacilities } from '../../objects'
import { OwlOptions} from 'ngx-owl-carousel-o';

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

  customOptions: OwlOptions = {
    loop: false,
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
    center: false,
    lazyLoad: true,
    autoHeight: true,
    responsive: {
      0: {
        items: 2
      },
      400: {
        items: 2
      },
      740: {
        items: 2
      },
      940: {
        items: 2
      }
    },
    nav: false
  };

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
          id: '1',
          image: "/assets/image/g_1.jpg",
          thumbImage: "/assets/image/g_1.jpg"
        }, 
        { 
          id: '2',
          image: "/assets/image/g_2.jpg",
          thumbImage: "/assets/image/g_2.jpg"
        },
        { 
          id: '3',
          image: "/assets/image/g_3.jpg",
          thumbImage: "/assets/image/g_3.jpg"
        }
      );

      this.Image_Ground = new Array<any>(
        { 
          id: '1',
          image: "/assets/image/gr_1.jpg",
          thumbImage: "/assets/image/gr_1.jpg"
        }, 
        { 
          id: '2',
          image: "/assets/image/gr_2.jpg",
          thumbImage: "/assets/image/gr_2.jpg"
        }, 
        { 
          id: '3',
          image: "/assets/image/gr_3.jpg",
          thumbImage: "/assets/image/gr_3.jpg"
        }, 
        { 
          id: '4',
          image: "/assets/image/gr_4.jpg",
          thumbImage: "/assets/image/gr_4.jpg"
        }, 
      );

      this.Image_Pool = new Array<any>(
        { 
          id: '1',
          image: "/assets/image/p_1.jpg",
          thumbImage: "/assets/image/p_1.jpg"
        }, 
        { 
          id: '2',
          image: "/assets/image/p_2.jpg",
          thumbImage: "/assets/image/p_2.jpg"
        },
        { 
          id: '3',
          image: "/assets/image/p_3.jpg",
          thumbImage: "/assets/image/p_3.jpg"
        },
      );

  }

  selected_img(numb: number): void{
    this.img_selected = this.Image_Facilities[numb].url;
  }

  condition_move: boolean = false;
  condition_down: boolean = false;
  mouseDown(): void{
    this.condition_down = true;
  }
  mouseMove(): void{
    if(this.condition_down) this.condition_move = true;
  }
  selectedImage(child_num: number, counted: number): void{
    if(!this.condition_move) {
      switch(counted){
        case 1:
          this.img_selected = this.Image_Gym[child_num].image;
        break;
        case 2:
          this.img_selected = this.Image_Ground[child_num].image; 
        break;
        case 3:
          this.img_selected = this.Image_Pool[child_num].image; 
        break;
      }
    }
    
    this.condition_move = false;
    this.condition_down = false;
  }

}
