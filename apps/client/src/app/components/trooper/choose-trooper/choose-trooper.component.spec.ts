import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseTrooperComponent } from './choose-trooper.component';

describe('ChooseTrooperComponent', () => {
  let component: ChooseTrooperComponent;
  let fixture: ComponentFixture<ChooseTrooperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseTrooperComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChooseTrooperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
