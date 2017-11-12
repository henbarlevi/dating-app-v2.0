import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth.service';

@Injectable()
export class IfLoggedInGuard implements CanActivate {
  constructor(private router: Router,
    private authService: AuthService) { }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    if (this.authService.isLoggedIn()) {
      console.log('user is logegdin');
      return true;
    }
    this.router.navigate(['/login']); //navigate the app to /login path  
    console.log('user is NOT loggedIng');
    return false;
  }
}
