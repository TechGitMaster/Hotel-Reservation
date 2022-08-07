import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HomeComponent } from './main_compo/home/home.component';
import { FacilitiesComponent } from './main_compo/facilities/facilities.component';
import { RoomsComponent } from './main_compo/rooms/rooms.component';
import { AboutComponent } from './main_compo/about/about.component';
import { ContactsComponent } from './main_compo/contacts/contacts.component';
import { MainServiceService } from './main_compo/main-service.service';
import { AuRouteModule } from './a_users/au-route/au-route.module';
import { Interceptor } from './INTERCEPTOR/Interceptor';
import { CookieService } from 'ngx-cookie-service';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';

import * as firebase from 'firebase/app';

firebase.initializeApp(environment.firebase);


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FacilitiesComponent,
    RoomsComponent,
    AboutComponent,
    ContactsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AuRouteModule,
    ReactiveFormsModule,
    provideAuth(() => getAuth())
  ],
  bootstrap: [AppComponent],
  providers: [MainServiceService, CookieService, { provide: HTTP_INTERCEPTORS, useClass: Interceptor, multi: true}]
})
export class AppModule { }
