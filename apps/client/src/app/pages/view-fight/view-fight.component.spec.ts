import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFightComponent } from './view-fight.component';

describe('ViewFightComponent', () => {
  let component: ViewFightComponent;
  let fixture: ComponentFixture<ViewFightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewFightComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewFightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
