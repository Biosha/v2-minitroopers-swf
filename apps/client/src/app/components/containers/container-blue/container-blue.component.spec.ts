import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerBlueComponent } from './container-blue.component';

describe('ContainerBlueComponent', () => {
  let component: ContainerBlueComponent;
  let fixture: ComponentFixture<ContainerBlueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContainerBlueComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContainerBlueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
