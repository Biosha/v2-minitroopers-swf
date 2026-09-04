import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TroopersGridComponent } from './troopers-grid.component';

describe('TroopersGridComponent', () => {
  let component: TroopersGridComponent;
  let fixture: ComponentFixture<TroopersGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TroopersGridComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TroopersGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
