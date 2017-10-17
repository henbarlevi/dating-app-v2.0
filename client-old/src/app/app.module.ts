import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
// OLD HTTP- import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http'; 
/*https://medium.com/codingthesmartway-com-blog/angular-4-3-httpclient-accessing-rest-web-services-with-angular-2305b8fd654b
https://medium.com/@amcdnl/the-new-http-client-in-angular-4-3-754bd3ff83a8
*/
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
    //HttpModule, - OLD
    HttpClientModule,
    //routing order matters:
    AuthModule,
    routing
  ],
  providers: [/*AuthService,LoggedInGuard*/HomeService],
  bootstrap: [AppComponent]
})
export class AppModule { }
