import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdRouteRoutingModule } from './ad-route-routing.module';
import { AdminComponent } from '../admin/admin.component';
import { AdServiceService } from '../ad-service.service';
import { AccountComponent } from '../ad-compo/account/account.component';
import { FavoritesComponent } from '../ad-compo/inbox-noti/favorites/favorites.component';
import { InboxComponent } from '../ad-compo/inbox-noti/inbox/inbox.component';
import { RoomsComponent } from '../ad-compo/rooms/rooms.component';
import { SchedulesComponent } from '../ad-compo/schedules/schedules.component';
import { TrashComponent } from '../ad-compo/inbox-noti/trash/trash.component';
import { InboxMainComponent } from '../ad-compo/inbox-noti/inbox-main/inbox-main.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Interceptor } from 'src/app/INTERCEPTOR/Interceptor';
import { ReactiveFormsModule } from '@angular/forms';


import { ScheduleAllModule, View } from '@syncfusion/ej2-angular-schedule';
import { DayService, WeekService, WorkWeekService, MonthService, MonthAgendaService} from '@syncfusion/ej2-angular-schedule';
import { ReservationComponent } from '../ad-compo/reservation/reservation.component';
import { AppointmentComponent } from '../ad-compo/appointment/appointment.component';

@NgModule({
  declarations: [
    AdminComponent,
    SchedulesComponent,
    RoomsComponent,
    AccountComponent,
    InboxComponent,
    FavoritesComponent,
    TrashComponent,
    InboxMainComponent,
    ReservationComponent,
    AppointmentComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AdRouteRoutingModule,
    ScheduleAllModule
  ],
  providers: [DayService, WeekService, WorkWeekService, MonthService, MonthAgendaService,
    AdServiceService,  { provide: HTTP_INTERCEPTORS, useClass: Interceptor, multi: true} ]
})
export class AdRouteModule { }
