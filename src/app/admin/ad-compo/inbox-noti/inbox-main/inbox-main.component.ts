import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-inbox-main',
  templateUrl: './inbox-main.component.html',
  styleUrls: ['./inbox-main.component.css']
})
export class InboxMainComponent implements OnInit {

  constructor() { }

  num_selectionCondition!: number;
  arr_named!: Array<string>;

  ngOnInit(): void {
    this.num_selectionCondition = 0;
    this.arr_named = new Array<string>('Inbox', 'Favorites', 'Accepted', 'Declined', 'Trash');
  }

  funcSelected(number: number): void{
    this.num_selectionCondition = number;
  }

}
