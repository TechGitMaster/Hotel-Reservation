import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { McRouteRoutingModule } from './mc-route-routing.module';
import { HomeComponent } from '../home/home.component';
import { FacilitiesComponent } from '../facilities/facilities.component';
import { RoomsComponent } from '../rooms/rooms.component';
import { AboutComponent } from '../about/about.component';
import { ContactsComponent } from '../contacts/contacts.component';
import { UserComponent } from '../account/user/user.component';

import { ReactiveFormsModule } from '@angular/forms';
import { McGuardGuard } from 'src/app/guard/mcG/mc-guard.guard';

@NgModule({
  declarations: [
    HomeComponent,
    FacilitiesComponent,
    RoomsComponent,
    AboutComponent,
    ContactsComponent,
    UserComponent
  ],
  imports: [
    CommonModule,
    McRouteRoutingModule,
    ReactiveFormsModule
  ],
  providers: [ McGuardGuard ]
})
export class McRouteModule { }
