import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrooperOpponentComponent } from './trooper-opponent.component';

describe('TrooperOpponentComponent', () => {
  let component: TrooperOpponentComponent;
  let fixture: ComponentFixture<TrooperOpponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrooperOpponentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TrooperOpponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
