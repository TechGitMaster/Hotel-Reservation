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
import { NotificationComponent } from '../account/notification/notification.component';
import { AppointmentComponent } from '../account/appointment/appointment.component';
import { ReservationComponent } from '../account/reservation/reservation.component';
import { ArchiveComponent } from '../account/archive/archive.component';
import { DetailsComponent } from '../account/details/details.component';
import { PaymentComponent } from '../payment/payment.component';
import { CarouselModule } from 'ngx-owl-carousel-o';


import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { PaymentDetailsComponent } from '../payment-details/payment-details.component';

@NgModule({
  declarations: [
    HomeComponent,
    FacilitiesComponent,
    RoomsComponent,
    AboutComponent,
    ContactsComponent,
    UserComponent,
    NotificationComponent,
    AppointmentComponent,
    ReservationComponent,
    ArchiveComponent,
    DetailsComponent,
    PaymentComponent,
    PaymentDetailsComponent
  ],
  imports: [ 
    CommonModule,
    McRouteRoutingModule,
    ReactiveFormsModule,
    CarouselModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule
  ],
  providers: [ McGuardGuard ]
})
export class McRouteModule { }
