import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountComponent } from '../ad-compo/account/account.component';
import { InboxMainComponent } from '../ad-compo/inbox-noti/inbox-main/inbox-main.component';
import { ReservationComponent } from '../ad-compo/reservation/reservation.component';
import { RoomsComponent } from '../ad-compo/rooms/rooms.component';
import { SchedulesComponent } from '../ad-compo/schedules/schedules.component';
import { AdminComponent } from '../admin/admin.component';
import { AppointmentComponent } from '../ad-compo/appointment/appointment.component';

const routes: Routes = [
  { path: '', redirectTo: '/ad/admin/inbox-mail', pathMatch: 'full' },
  { path: 'admin', component: AdminComponent, children: [
    { path: '', redirectTo: 'inbox-mail', pathMatch: 'full' },
    { path: 'inbox-mail', component: InboxMainComponent },
    { path: 'schedules', component: SchedulesComponent },
    { path: 'rooms', component: RoomsComponent },
    { path: 'reservations', component: ReservationComponent}, 
    { path: 'appointments', component: AppointmentComponent },
    { path: 'account', component: AccountComponent }
  ] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdRouteRoutingModule { }
