import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserComponent } from '../account/user/user.component';
import { ContactsComponent } from '../contacts/contacts.component';
import { HomeComponent } from '../home/home.component';
import { RoomsComponent } from '../rooms/rooms.component';

const routes: Routes = [
  { path: '', redirectTo: '/mc/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'contact-us', component: ContactsComponent },
  { path: 'rooms', component: RoomsComponent },
  { path: 'user-account', component: UserComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class McRouteRoutingModule { }
