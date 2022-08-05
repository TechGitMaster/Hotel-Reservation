import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuRouteRoutingModule } from './au-route-routing.module';
import { AdminComponent } from '../admin/admin.component';
import { NormalUsersComponent } from '../normal-users/normal-users.component';
import { AuServiceService } from '../au-service.service';


@NgModule({
  declarations: [
    AdminComponent,
    NormalUsersComponent
  ],
  imports: [
    CommonModule,
    AuRouteRoutingModule
  ],
  providers: [AuServiceService]
})
export class AuRouteModule { }
