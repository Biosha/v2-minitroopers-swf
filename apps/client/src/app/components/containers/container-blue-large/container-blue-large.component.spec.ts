import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerBlueLargeComponent } from './container-blue-large.component';

describe('ContainerBlueComponent', () => {
  let component: ContainerBlueLargeComponent;
  let fixture: ComponentFixture<ContainerBlueLargeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContainerBlueLargeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContainerBlueLargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
