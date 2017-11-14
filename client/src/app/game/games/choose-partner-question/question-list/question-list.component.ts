import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { iQuestion } from '../questions.model';

@Component({
  selector: 'app-question-list',
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.scss']
})
export class QuestionListComponent implements OnInit {
  @Input() questions: iQuestion[] = [];
  constructor() { }

  ngOnInit() {
    
  }

}
