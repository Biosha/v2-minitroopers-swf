import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TroopersBlockComponent } from './troopers-block.component';

describe('TroopersBlockComponent', () => {
  let component: TroopersBlockComponent;
  let fixture: ComponentFixture<TroopersBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TroopersBlockComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TroopersBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
