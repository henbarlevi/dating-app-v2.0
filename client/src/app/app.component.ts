import { Component ,OnInit,ViewChild} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'app';
  @ViewChild('myModal') private myModal: any;
  openModal(){
    this.myModal.openModal();
  }
  ngOnInit(){

  }
}
