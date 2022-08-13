import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from '../admin/admin.component';

const routes: Routes = [
  { path: '', redirectTo: '/ad/admin', pathMatch: 'full' },
  { path: 'admin', component: AdminComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdRouteRoutingModule { }
