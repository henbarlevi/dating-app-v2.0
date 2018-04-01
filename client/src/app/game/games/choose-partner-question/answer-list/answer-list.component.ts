import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-answer-list',
  templateUrl: './answer-list.component.html',
  styleUrls: ['./answer-list.component.scss']
})
export class AnswerListComponent implements OnInit {
  @Input() answers: string[] = [];
  @Output() selected =new EventEmitter<number>();
  constructor() { }

  ngOnInit() {
    
  }
  onSelected(answerIndex:number){
   this.selected.emit(answerIndex);
  }


}
