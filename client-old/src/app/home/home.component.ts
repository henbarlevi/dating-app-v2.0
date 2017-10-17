import { Component, OnInit } from '@angular/core';
import { HomeService } from './home.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private HomeService: HomeService) { }

  ngOnInit() {
    const observer = {
      next: (data) => console.log(data),
      error: (e) => console.error(e)
    };
    // this.HomeService.AnalyzeUser()
    //   .subscribe(observer);
    setTimeout(function () {

      location.reload();
    }, 5000);
  }

}
