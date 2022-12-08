import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MainServiceService } from './main_serivce/main-service.service';
import { Interceptor } from './INTERCEPTOR/Interceptor';
import { CookieService } from 'ngx-cookie-service';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { McRouteModule } from './main_compo/mc-route/mc-route.module';
import { AdRouteModule } from './admin/ad-route/ad-route.module';
import { AdGuardGuard } from './guard/adG/ad-guard.guard';
import { McGuardGuard } from './guard/mcG/mc-guard.guard';
import { NotFoundComponent } from './notFound/not-found.component';


import * as firebase from 'firebase/app';
firebase.initializeApp(environment.firebase);


@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    McRouteModule,
    AdRouteModule,
    provideAuth(() => getAuth())
  ],
  bootstrap: [AppComponent],
  providers: [MainServiceService, CookieService, AdGuardGuard, McGuardGuard,
    { provide: HTTP_INTERCEPTORS, useClass: Interceptor, multi: true}]
})
export class AppModule { }
