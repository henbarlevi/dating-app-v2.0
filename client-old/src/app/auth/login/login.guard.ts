/*route Guard that filters user that are not loggedin to the server */
import { Injectable } from '@angular/core';
import {
  CanActivate, Router,
  ActivatedRouteSnapshot, RouterStateSnapshot
} from '@angular/router';
import { AuthService } from '../auth.service';
const TAG = 'LoggedInGuard';
@Injectable()
export class LoggedInGuard implements CanActivate { //CanActivate - called when trying to reach the route: 'albums/:albumId' (look in app.routing.ts)

  constructor(private router: Router,
              private AuthService: AuthService) { }
    //TODO : to-implement-authguard-waiting-a-connection-in-angualr-2
    //http://stackoverflow.com/questions/38120673/how-to-implement-authguard-waiting-a-connection-in-angualr-2
  //return bool if the route can be activate + navigate to the /login if it cant:
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    //if the user not loggedIn && and user details doesnt exist in localStorage 
    if (!this.AuthService.isLoggedIn()) { 
        console.log(`${TAG} - user is not logged in`);
        console.log(`${TAG} - **navigating to login page**`);
        
      this.router.navigate(['/login']); //navigate the app to /login path (login form)    
      return false;
    }

    return true;
  }

}