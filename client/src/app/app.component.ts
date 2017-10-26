import { Component ,OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'app';
  ngOnInit(){
    // console.log('will refresh in 5 sec');
    // setTimeout(function() {
    //   location.reload();
    // }, 50000);
  }
}
