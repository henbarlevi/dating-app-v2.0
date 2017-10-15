import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';
@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

  constructor(
    private router : Router,
    private AuthService: AuthService) { }

  ngOnInit() {
  }
  logout() {
    this.AuthService.logout();
    this.router.navigateByUrl('/login');
  }
}
