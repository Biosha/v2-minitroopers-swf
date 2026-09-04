import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerReferralComponent } from './container-referral.component';

describe('ContainerReferralComponent', () => {
  let component: ContainerReferralComponent;
  let fixture: ComponentFixture<ContainerReferralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContainerReferralComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContainerReferralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
