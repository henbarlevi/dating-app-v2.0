import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChoosePartnerQuestionComponent } from './choose-partner-question.component';
import { QuestionListComponent } from './question-list/question-list.component';
@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    QuestionListComponent,
    ChoosePartnerQuestionComponent
  ],
  exports: [
    ChoosePartnerQuestionComponent
  ]
})
export class ChoosePartnerQuestionModule { }
