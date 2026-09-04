import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrooperCellComponent } from './trooper-cell.component';

describe('TrooperCellComponent', () => {
  let component: TrooperCellComponent;
  let fixture: ComponentFixture<TrooperCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrooperCellComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TrooperCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
