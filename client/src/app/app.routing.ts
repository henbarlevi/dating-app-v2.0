import { RouterModule } from '@angular/router'; //import router module

import { HomeComponent } from './home/home.component';
import { LoginComponent , LoggedInGuard} from './auth';
export const routing = RouterModule.forRoot([
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [LoggedInGuard]

  },
  // {
  //   path: 'login',
  //   component: LoginComponent
  // },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full' //match to this route if the full path is '' emptystring
  }

]);