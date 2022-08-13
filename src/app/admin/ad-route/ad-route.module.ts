import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdRouteRoutingModule } from './ad-route-routing.module';
import { AdminComponent } from '../admin/admin.component';
import { AdServiceService } from '../ad-service.service';


@NgModule({
  declarations: [
    AdminComponent
  ],
  imports: [
    CommonModule,
    AdRouteRoutingModule
  ],
  providers: [ AdServiceService ]
})
export class AdRouteModule { }
