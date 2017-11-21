import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { iQuestion } from '../questions.model';
const TAG:string ='QuestionList |'
@Component({
  selector: 'app-question-list',
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.scss']
})
export class QuestionListComponent implements OnInit {
  @Input() questions: iQuestion[] = [];
  @Output() selected =new EventEmitter<iQuestion>();
  constructor() { }

  ngOnInit() {
    
  }
  onSelected(question:iQuestion){
   this.selected.emit(question);
  }

}
