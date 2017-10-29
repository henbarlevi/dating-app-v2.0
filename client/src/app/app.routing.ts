import { NgModule } from '@angular/core';
import { RouterModule,PreloadAllModules } from '@angular/router'; //import router module

//import { HomeComponent } from './dashboard/home/home.component';
import { LoginComponent , LoggedInGuard} from './auth';
 const routing = RouterModule.forRoot([
  // {
  //   path: 'home',
  //   component: HomeComponent,
  //   canActivate: [LoggedInGuard]

  // },
  // {
  //   path: 'login',
  //   component: LoginComponent
  // },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full' //match to this route if the full path is '' emptystring
  },
  
  
 ]/*, {preloadingStrategy: PreloadAllModules} -uncomment this if you want preloadingStrategy*/);/**https://angular.io/guide/router#preloading-background-loading-of-feature-areas */

@NgModule({
  imports: [
    routing
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {

}