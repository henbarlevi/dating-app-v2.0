import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { HomeService} from './home/home.service';

//Auth
// import {
//   LoginComponent,
//   LoggedInGuard
//   , AuthService
// } from './auth'
import { AuthModule } from './auth'
import { routing } from './app.routing';
import { NavBarComponent } from './nav-bar/nav-bar.component';
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    //LoginComponent,
    NavBarComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    //routing order matters:
    AuthModule,
    routing
  ],
  providers: [/*AuthService,LoggedInGuard*/HomeService],
  bootstrap: [AppComponent]
})
export class AppModule { }
