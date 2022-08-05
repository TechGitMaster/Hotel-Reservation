import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from '../admin/admin.component';
import { NormalUsersComponent } from '../normal-users/normal-users.component';

const routes: Routes = [
  { path: 'admin', component: AdminComponent },
  { path: 'user', component: NormalUsersComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuRouteRoutingModule { }
