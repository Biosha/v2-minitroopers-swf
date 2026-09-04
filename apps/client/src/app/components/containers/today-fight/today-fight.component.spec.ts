import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodayFightComponent } from './today-fight.component';

describe('TodayFightComponent', () => {
  let component: TodayFightComponent;
  let fixture: ComponentFixture<TodayFightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodayFightComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TodayFightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
