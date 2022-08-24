import { Component, OnInit } from '@angular/core';
import { MainServiceService } from '../main_serivce/main-service.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit {

  constructor(private service: MainServiceService) { }

  ngOnInit(): void {
    this.service.emitsNotFound();
  }

}
