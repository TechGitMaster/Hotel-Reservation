import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AdServiceService } from '../../ad-service.service';
import { room } from 'src/app/objects';


@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.css']
})
export class RoomsComponent implements OnInit {

  constructor(private service: AdServiceService, private formBuilder: FormBuilder) { }

  subs!: Subscription;
  subsgetRoom!: Subscription;

  condition_ClickedseeAllRoom!: boolean; 
  condition_ClickedseeReserved!: boolean;

  header_txt!: Array<string>;

  clickedRadio_TypeRoom!: boolean;
  arr_image_tempo!: Array<string>;
  arr_image_blob!: Array<Blob>;
  arr_imageFinal!: Array<Array<string>>;
  arr_deletedImage!:  Array<string>;
  formGroup!: FormGroup;
  conditionErr!: Array<any>;
  countShownumb_images!: number;
  countNumb_images!: number;
  countNumb_deleteAndBlob!: number;

  getRooms!: Array<room>;
  getAllRoomsF!: Array<room>;
  messageForRooms!: string;
  countRoom!: string;
  object_roomSelected!: any;
  changingRoom_condition!: boolean;
  arr_imgArrFinalChanging!: Array<Array<string>>;
  deleteRoom_condition!: boolean;

  ngOnInit(): void {
    this.condition_ClickedseeReserved = false;
    this.condition_ClickedseeAllRoom = false;
    this.changingRoom_condition = false;
    this.deleteRoom_condition = false;
    this.header_txt = new Array<string>("Add new Room", "In this section you can now add rooms any time you wanted. By hitting the submit button it will automatically posted in your room section");
    this.clickedRadio_TypeRoom = false;
    this.object_roomSelected = null;
    this.getAllRoomsF = new Array<room>();
    this.arr_image_tempo = new Array<string>();
    this.arr_image_blob = new Array<Blob>();
    this.arr_imageFinal = new Array<Array<string>>();
    this.arr_deletedImage = new Array<string>();
    this.arr_imgArrFinalChanging = new Array<Array<string>>();
    this.conditionErr = new Array<any>(["", false], ["", false], ["", false], ["", false], ["", false]);
    this.countShownumb_images = 0;
    this.countNumb_images = 0;
    this.countNumb_deleteAndBlob = 0;
    this.messageForRooms = "Loading...";

    //Form group__________________________________________________________________
    this.formGroup = this.formBuilder.group({
      nameRoom: [''],
      addInfo: [''],
      defaultPrice: [''],
      goodPersons: [''],
      pricePersons: ['']
    });


    //Get all rooms_____________________________________________________________
    this.getAllRooms();
  }


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

  clickedSeeReserved(): void{
    this.condition_ClickedseeReserved = !this.condition_ClickedseeReserved ? true:false;
  }

  //Get all rooms______________________________________________________________________
  getAllRooms(): void{
    this.countRoom = '0';
    this.messageForRooms = "Loading...";
    this.getRooms = new Array<room>();
    this.subsgetRoom = this.service.getRoom(false).subscribe((res) => {
      this.subsgetRoom.unsubscribe();

      if(res.response === 'success'){
        this.getRooms = res.data;

        if(res.count < 10){
          this.countRoom = `0${res.count}`;
        }else{
          this.countRoom = ''+res.count;
        }

      }else{
        this.messageForRooms = "No rooms available.";
      }

    }, (err) => {
      this.subsgetRoom.unsubscribe();
      location.reload();
    });
  }

  getAllRoomsFromAll(){
    this.change_addRoom();
    this.condition_ClickedseeAllRoom = true;
    this.messageForRooms = "Loading...";
    this.getAllRoomsF = new Array<room>();
    setTimeout(() => {
      this.subsgetRoom = this.service.getRoom(true).subscribe((res) => {
        this.subsgetRoom.unsubscribe();
  
        if(res.response === 'success'){
          this.getAllRoomsF = res.data;
        }else{
          this.messageForRooms = "No rooms available.";
        }
  
      }, (err) => {
        this.subsgetRoom.unsubscribe();
        location.reload();
      });      
    }, 500);

  }



  clickRadio(condition: boolean): void{
    if(this.object_roomSelected == null){
      this.clickedRadio_TypeRoom = condition;
    }
  }


  //return room type____________________________________________________________________
  roomType(condition: boolean): string{
    return condition ? 'Staycation room': 'Rental room';
  }


  //This is to add image to Temporary Array______________________________________________
  async selectImage(event: any){
    if(!!event.target.files){

      if(this.object_roomSelected != null){
        this.changingRoom_condition = true;
      }

      for await(let file of event.target.files){

        if(file.size <= 500000){

          let reader = new FileReader();
          reader.readAsDataURL(file);

          reader.onload = (fileConverted) => {
            this.arr_image_tempo.push(''+fileConverted.target?.result);

            //This is blob for uploading the image to cloudinary___________________
            this.arr_image_blob.push(file);

            this.countShownumb_images = this.arr_image_tempo.length;
          }
        }else{
          alert(`${file.name} is more than 500kb`);
        }
      }
    }
  }

  //This is to delete the selected temporary image___________________________________________________
  async deleteImage(url: string, numb: number){
    if(this.arr_image_tempo.length > 0){

      if(this.arr_image_tempo.length > 1){
        this.arr_image_tempo.splice(numb, 1);
      }else{
        this.arr_image_tempo = new Array<string>();
      }
      this.countShownumb_images = this.arr_image_tempo.length;

      var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
      if(!urlRegex.test(url)){
        let temp_blob = new Array<Blob>();
        for(let count = 0;count < this.arr_image_blob.length;count++){
          if(count != numb){
            temp_blob.push(this.arr_image_blob[count]);
          }

          if(count+1 == this.arr_image_blob.length){
            this.arr_image_blob = temp_blob;
          }
        }
      }else{
        this.changingRoom_condition = true;
        for await(let arr of this.object_roomSelected.imgArr){
          if(arr[0] === url){
            this.arr_deletedImage.push(arr[1]);
          }
        }
      }


    }
  }

  //This is for displaying image_____________________________________________________________________
  displayImage(index: number): void{
    this.service.emitCall(new Array<any>("seeImage", index, this.arr_image_tempo));
  }

  //This is for uploading the image "1 by 1" to cloudinary and return the url of that image_____________________________________________________
  uploadImages(): void{

    if(this.countNumb_deleteAndBlob < (this.arr_image_blob.length+this.arr_deletedImage.length)){
      this.service.emitCall(new Array<any>("progress", (Math.floor((this.countNumb_deleteAndBlob * 90) / (this.arr_image_blob.length+this.arr_deletedImage.length))), 
      !this.changingRoom_condition ? 'Successfully created new room.': 'Successfully changing details.'));
    }

    this.subs = this.service.uploadImage(this.arr_image_blob[this.countNumb_images]).subscribe((result) => {
      this.subs.unsubscribe();
      this.countNumb_images++;
      this.countNumb_deleteAndBlob++;

      if(!this.changingRoom_condition){
        this.arr_imageFinal.push([result.data.avatar, result.data.cloudinary_id]);
      }else{
        this.arr_imgArrFinalChanging.push([result.data.avatar, result.data.cloudinary_id]);
      }

      if(this.countNumb_images != this.arr_image_blob.length){
        this.uploadImages();
      }else{
        this.service.emitCall(new Array<any>("progress", 99, !this.changingRoom_condition ? 'Successfully created new room.': 'Successfully changing details.'));

        if(!this.changingRoom_condition){
          this.createNewRoom();
        }else{
          this.changeInformation();
        }
      }
    }, (err) => {
      this.subs.unsubscribe();
      location.reload();
    });
  }


  //Create new room to database________________________________________________________________________________
  createNewRoom(): void{
    this.service.createNew_room(this.formGroup, this.clickedRadio_TypeRoom, this.arr_imageFinal).subscribe((result) => {
      this.subs.unsubscribe();

      this.formGroup = this.formBuilder.group({
        nameRoom: [''],
        addInfo: [''],
        defaultPrice: [''],
        goodPersons: [''],
        pricePersons: ['']
      });

      let divForAdded = document.querySelectorAll('.divForAdded > div');
      for(let count = 1;count < divForAdded.length;count++){
        divForAdded[count].remove();
      }
      
      this.arr_image_tempo = new Array<string>();
      this.arr_image_blob = new Array<Blob>();
      this.arr_imageFinal = new Array<Array<string>>();
      this.countShownumb_images = 0;

      this.service.emitCall(new Array<any>("progress", 100, 'Successfully created new room.'));
      this.getAllRooms();
    }, (err) => {
      this.subs.unsubscribe();
      location.reload();
    });
  }


  //This is create room bttn______________________________________________________________________
  async createRoom(){
    this.countNumb_images = 0;

    if(this.arr_image_tempo.length > 0 && this.arr_image_tempo.length >= 5){
      
      //Success. This area gonna proceed to upload informations of room in database________________________________________________
      let condition = await this.validationInput();
      if(condition){
        //Upload image to cloudinary_________________
        this.uploadImages();
      }

    }else{
      if(this.arr_image_tempo.length != 0){
        alert('You must to upload more than 5 images.');
      }else{
        alert('Please import image.');
      }
    }
  }

  //Validation input field_________________________________________________________
  validationInput(): boolean{
    this.conditionErr = new Array<any>(["!Input field is empty.", false], ["!Input field is empty.", false], ["!Input field is empty.", false], 
    ["!Input field is empty.", false], ["!Input field is empty.", false]);

    let condition = true;
    if(!!this.formGroup.value.nameRoom && !!this.formGroup.value.addInfo){
  
      //Checking error____________________________________________
      if(this.clickedRadio_TypeRoom){
        if(!this.formGroup.value.defaultPrice || !this.formGroup.value.goodPersons || !this.formGroup.value.pricePersons){
          condition = false;

          if(!this.formGroup.value.defaultPrice && !this.formGroup.value.goodPersons && !this.formGroup.value.pricePersons){
            this.conditionErr[2][1] = true;
            this.conditionErr[3][1] = true;
            this.conditionErr[4][1] = true;
          }else if(!this.formGroup.value.defaultPrice){
            this.conditionErr[2][1] = true;
          }else if(!this.formGroup.value.goodPersons){
            this.conditionErr[3][1] = true;
          }else{
            this.conditionErr[4][1] = true;
          }
        }
        
        if(condition){
          if(!(/^\d+$/).test(this.formGroup.value.defaultPrice)){
            condition = false;
            this.conditionErr[2][1] = true;
            this.conditionErr[2][0] = '!Only number is allowed.';
          }else if(!(/^\d+$/).test(this.formGroup.value.goodPersons)){
            condition = false;
            this.conditionErr[3][1] = true;
            this.conditionErr[3][0] = '!Only number is allowed.';
          }else if(!(/^\d+$/).test(this.formGroup.value.pricePersons)){
            condition = false;
            this.conditionErr[4][1] = true;
            this.conditionErr[4][0] = '!Only number is allowed.';
          }
        }
      }

    }else{
      condition = false;
      if(!this.formGroup.value.nameRoom && !this.formGroup.value.addInfo){
        this.conditionErr[0][1] = true;
        this.conditionErr[1][1] = true;
      }else if(!this.formGroup.value.nameRoom){
        this.conditionErr[0][1] = true;
      }else{
        this.conditionErr[1][1] = true;
      }
    }

    return condition;
  }


  //This is for auto erase the letter because the only need in input field is number___________________________________________________
  funcOnlynumber(numb: number): void{
    let arrDoc = ['fs1', 'fs2', 'fs3'];
    let doc = <HTMLInputElement>document.querySelector(`.${arrDoc[numb]}`);
    doc.value = doc.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');

    if(this.object_roomSelected != null){
      this.changingRoom_condition = true;
    }
  }

  //This is for "textarea" and "name of room" input field____________________________________________________________________
  nameAndInfo(): void{
    if(this.object_roomSelected != null){
      this.changingRoom_condition = true;
    }
  }


  //click Edit room_________________________________________________________
  editRoom(numb: number): void{
    if(this.object_roomSelected == null || this.object_roomSelected._id !== this.getRooms[numb]._id){
      this.condition_ClickedseeReserved = false;
      this.object_roomSelected = this.getRooms[numb];
      this.countShownumb_images = this.object_roomSelected.imgArr.length;
      this.editRoom_Change();
      }
  }

  //click Edit room from "All the room"_____________________________________________
  editRoomFromAll(numb: number): void{
    this.condition_ClickedseeReserved = false;
    this.condition_ClickedseeAllRoom = false;

    setTimeout(() => {
      this.object_roomSelected = this.getAllRoomsF[numb];
      this.countShownumb_images = this.object_roomSelected.imgArr.length;
      this.editRoom_Change();
    }, 500);
  }


  //Change the "Add new room" to "Edit room"_____________________________________________________________
  editRoom_Change(): void{
    this.countNumb_deleteAndBlob = 0;
    this.countNumb_images = 0;
    this.changingRoom_condition = false;
    this.deleteRoom_condition = false;
    this.arr_image_tempo = new Array<string>();
    this.arr_image_blob = new Array<Blob>();
    this.arr_deletedImage = new Array<string>();
    this.arr_imgArrFinalChanging = new Array<Array<string>>();

    let radio1 = <HTMLInputElement>document.querySelector('#flexRadioDefault1');
    let radio2 = <HTMLInputElement>document.querySelector('#flexRadioDefault2');

    this.header_txt = new Array<string>("Edit Room", "In this section you can now edit the selected room. Be careful on what data you going to change on this section.");

    //Information of room_________________________________________________________________________
    this.formGroup = this.formBuilder.group({
      nameRoom: [this.object_roomSelected.nameRoom],
      addInfo: [this.object_roomSelected.addInfo],
      defaultPrice: [this.object_roomSelected.defaultPrice],
      goodPersons: [this.object_roomSelected.goodPersons],
      pricePersons: [this.object_roomSelected.pricePersons]
    });


    this.clickedRadio_TypeRoom = this.object_roomSelected.typeRoom;
    if(!this.clickedRadio_TypeRoom){
      radio1.checked = true;
      radio2.checked = false;
    }else{
      radio1.checked = false;
      radio2.checked = true;
    }

    radio1.disabled = true;
    radio2.disabled = true;

    //Images of room_______________________________________________________________________________________________
    for(let img of this.object_roomSelected.imgArr){
      this.arr_image_tempo.push(img[0]);
    }
    
  }


  //Change the "Edit room" to "Add new room"___________________________________________________________________________
  change_addRoom(): void{
    this.countNumb_deleteAndBlob = 0;
    this.countShownumb_images = 0;
    this.countNumb_images = 0;
    this.changingRoom_condition = false;
    this.deleteRoom_condition = false;
    this.object_roomSelected = null;
    this.clickedRadio_TypeRoom = false;
    this.arr_image_tempo = new Array<string>();
    this.arr_image_blob = new Array<Blob>();
    this.arr_deletedImage = new Array<string>();
    this.arr_imgArrFinalChanging = new Array<Array<string>>();

    let radio1 = <HTMLInputElement>document.querySelector('#flexRadioDefault1');
    let radio2 = <HTMLInputElement>document.querySelector('#flexRadioDefault2');
    radio1.checked = true;
    radio2.checked = false;

    radio1.disabled = false;
    radio2.disabled = false;

    this.header_txt = new Array<string>("Add new Room", "In this section you can now add rooms any time you wanted. By hitting the submit button it will automatically posted in your room section");

    //Information of room_________________________________________________________________________
    this.formGroup = this.formBuilder.group({
      nameRoom: [''],
      addInfo: [''],
      defaultPrice: [''],
      goodPersons: [''],
      pricePersons: ['']
    });
  }

  //Change bttn______________________________________________________________________________________
  async changeDetails(){
    this.deleteRoom_condition = true;
    let condition = await this.validationInput();
    if(condition){
      this.arr_imgArrFinalChanging = this.object_roomSelected.imgArr;
      if(this.arr_deletedImage.length > 0){
        let cal = Math.floor((this.arr_imgArrFinalChanging.length-this.arr_deletedImage.length)+(this.arr_image_blob.length));
  
        if(cal >= 5){
          this.deleteImageCloudinary();
        }else{
          alert('You must to upload more than 5 images.');
        }
      }else{
        if(this.arr_image_blob.length > 0){
          this.uploadImages();
        }else{
          this.changeInformation();
        }
      }
    }
  }

  //delete image from cloudinary____________________________________________________________________
  deleteImageCloudinary(): void{

    if(this.countNumb_deleteAndBlob < (this.arr_image_blob.length+this.arr_deletedImage.length)){
      this.service.emitCall(new Array<any>("progress", 
      (Math.floor((this.countNumb_deleteAndBlob * 90) / (this.arr_image_blob.length+this.arr_deletedImage.length))), 'Successfully changing details.'));
    }

    this.subs = this.service.deleteImageCloudinary(this.arr_deletedImage[this.countNumb_images]).subscribe((result) => {
      this.subs.unsubscribe();

      this.arr_imgArrFinalChanging = this.arr_imgArrFinalChanging.filter((data:any) => data[1] !== this.arr_deletedImage[this.countNumb_images]);

      this.countNumb_images++;
      this.countNumb_deleteAndBlob++;

      if(this.countNumb_images != this.arr_deletedImage.length){
        this.deleteImageCloudinary();
      }else{
        if(this.arr_image_blob.length > 0){
          this.countNumb_images = 0;

          if(this.deleteRoom_condition){
            this.service.emitCall(new Array<any>("progress", 
            (Math.floor((this.countNumb_deleteAndBlob * 90) / (this.arr_image_blob.length+this.arr_deletedImage.length))), 'Successfully changing details.'));
          
            this.uploadImages();
          }else{
            this.service.emitCall(new Array<any>("progress", 99, 'Successfully deleting room'));
            this.deleteFinallyRoom();
          }
        }else{
          if(this.deleteRoom_condition){
            this.service.emitCall(new Array<any>("progress", 99, 'Successfully changing details.'));
            this.changeInformation();
          }else{
            this.service.emitCall(new Array<any>("progress", 99, 'Successfully deleting room'));
            this.deleteFinallyRoom();
          }
        }
      }
    }, (err) => {
      this.subs.unsubscribe();
      location.reload();
    });
  }

  //Change information room___________________________________________________________________________________________
  changeInformation(): void{
    this.subs = this.service.change_detail_room(this.object_roomSelected._id, this.formGroup, this.arr_imgArrFinalChanging).subscribe((res) => {

      this.subs.unsubscribe();
      this.service.emitCall(new Array<any>("progress", 100, 'Successfully changing details.'));

      this.object_roomSelected = res.data;
      this.countShownumb_images = this.object_roomSelected.imgArr.length;
      this.editRoom_Change();

      let letable = this.getRooms;
      let count = 0;
      for(let data of letable){
        if(data._id === this.object_roomSelected._id){
          this.getRooms[count] = this.object_roomSelected;
        }
        count++;
      }

    }, (err) => {
      this.subs.unsubscribe();
      location.reload();
    });
  }

  //Delete room bttn______________________________________________________________________________________________
  async deleteRoom(){
    this.arr_deletedImage = new Array<string>();
    for await(let img of this.object_roomSelected.imgArr){
      this.arr_deletedImage.push(img[1]);
    }

    for await(let imgs of this.object_roomSelected.image_transaction){
      this.arr_deletedImage.push(imgs[1]);
    }
    
    this.deleteImageCloudinary();
  }

  //Deleting finally room______________________________________________________________________________________
  deleteFinallyRoom(): void{
    this.subs = this.service.deleteRoom(this.object_roomSelected._id).subscribe((res) => {
      this.subs.unsubscribe();
      this.service.emitCall(new Array<any>("progress", 100, 'Successfully deleting room.'));
      this.change_addRoom();
      this.getAllRooms();
    }, (err) => {
      this.subs.unsubscribe();
      location.reload();
    });
  }
}