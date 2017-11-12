import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingGameComponent } from './loading-game.component';

describe('LoadingGameComponent', () => {
  let component: LoadingGameComponent;
  let fixture: ComponentFixture<LoadingGameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadingGameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
