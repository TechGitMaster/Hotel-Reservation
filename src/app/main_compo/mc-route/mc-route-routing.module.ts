import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { McGuardGuard } from 'src/app/guard/mcG/mc-guard.guard';
import { AboutComponent } from '../about/about.component';
import { UserComponent } from '../account/user/user.component';
import { ContactsComponent } from '../contacts/contacts.component';
import { FacilitiesComponent } from '../facilities/facilities.component';
import { HomeComponent } from '../home/home.component';
import { PaymentDetailsComponent } from '../payment-details/payment-details.component';
import { PaymentComponent } from '../payment/payment.component';
import { RoomsComponent } from '../rooms/rooms.component';

const routes: Routes = [
  { path: '', redirectTo: '/mc/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'contact-us', component: ContactsComponent },
  { path: 'rooms', component: RoomsComponent },
  { path: 'about', component: AboutComponent },
  { path: 'facilities', component: FacilitiesComponent },
  { path: 'user-account', component: UserComponent, data: { condition: 'account' }, canActivate: [McGuardGuard] },
  { path: 'payment/:_pT', component: PaymentComponent },
  { path: 'paymentDetails/:_pT', component: PaymentDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class McRouteRoutingModule { }
