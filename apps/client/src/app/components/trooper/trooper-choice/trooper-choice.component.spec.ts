import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrooperChoiceComponent } from './trooper-choice.component';

describe('TrooperChoiceComponent', () => {
  let component: TrooperChoiceComponent;
  let fixture: ComponentFixture<TrooperChoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrooperChoiceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TrooperChoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
