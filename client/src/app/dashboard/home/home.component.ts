import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  btnAnimationClasses: string
  constructor() { }

  ngOnInit() {
  }
  startGame() {
    console.log('start game');

  }
  gameBtnAnimation($event) {
    this.btnAnimationClasses = $event.type == 'mouseover' ? 'animated infinite bounce' : '';
  }

}
