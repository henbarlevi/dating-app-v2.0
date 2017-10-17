import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { ActivatedRoute,Router } from '@angular/router';
const TAG = 'LoginComponent';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private AuthService: AuthService, 
              private route: ActivatedRoute,
              private router:Router) { }

  ngOnInit() {
    console.log('======login query params :');
    console.log(this.route.snapshot.queryParams);
    console.log(this.route.snapshot.queryParams['code']);
    const codeparam = this.route.snapshot.queryParams['code'];
    if (codeparam) {
      this.AuthService.sendFacebookCode(codeparam)
        .subscribe({
          next: (data) => {
            console.log(TAG,'the login response:')
            console.log(TAG,data);
            localStorage.setItem('token', data.token);
            // localStorage.setItem('userId', data.userId);
            this.router.navigateByUrl('/');
          },

        })
    }
  }
  loginWithFacebook() {
    console.log('aaaa');
    this.AuthService.loginWithFacebook();
  }
}
