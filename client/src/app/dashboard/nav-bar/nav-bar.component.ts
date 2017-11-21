import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

  constructor(private AuthService : AuthService,private router: Router) { }

  ngOnInit() {
  }
  logOut(){
    this.AuthService.logout();
    this.router.navigate(['/login']);
  }

}
