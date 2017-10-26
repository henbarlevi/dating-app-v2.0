/**
 * for understand how to do routing module for a feature module:
 * https://angular.io/guide/router#hero-feature-routing-requirements
 */
import { RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';

 const authRouting = RouterModule.forChild([
    //Currently 'login' route also exist in app.routing
    {
        path: 'login',
        component: LoginComponent
    }
])

@NgModule({
    imports: [
        authRouting
    ],
    exports: [RouterModule],
    providers: [
     // AuthGuard
    ]
  })
  export class AuthRoutingModule {}