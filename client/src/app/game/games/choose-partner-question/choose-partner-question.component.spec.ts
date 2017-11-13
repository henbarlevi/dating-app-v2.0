import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoosePartnerQuestionComponent } from './choose-partner-question.component';

describe('ChoosePartnerQuestionComponent', () => {
  let component: ChoosePartnerQuestionComponent;
  let fixture: ComponentFixture<ChoosePartnerQuestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChoosePartnerQuestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChoosePartnerQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
