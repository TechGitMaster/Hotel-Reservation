import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './main_compo/home/home.component';
import { ContactsComponent } from './main_compo/contacts/contacts.component';
import { RoomsComponent } from './main_compo/rooms/rooms.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'contact-us', component: ContactsComponent },
  { path: 'rooms', component: RoomsComponent },

  { path: '', loadChildren: () => import('./a_users/au-route/au-route.module').then(module => module.AuRouteModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
