import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewUpgradeComponent } from './view-upgrade.component';

describe('ViewUpgradeComponent', () => {
  let component: ViewUpgradeComponent;
  let fixture: ComponentFixture<ViewUpgradeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewUpgradeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewUpgradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
