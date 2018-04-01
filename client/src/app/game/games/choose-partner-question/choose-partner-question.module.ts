import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChoosePartnerQuestionComponent } from './choose-partner-question.component';
import { QuestionListComponent } from './question-list/question-list.component';
import { AnswerListComponent } from './answer-list/answer-list.component';
import { SharedModule } from '../../../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [
    QuestionListComponent,
    AnswerListComponent,
    ChoosePartnerQuestionComponent
  ],
  exports: [
    ChoosePartnerQuestionComponent
  ]
})
export class ChoosePartnerQuestionModule { }
