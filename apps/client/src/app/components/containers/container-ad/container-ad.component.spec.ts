import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerAdComponent } from './container-ad.component';

describe('ContainerAdComponent', () => {
  let component: ContainerAdComponent;
  let fixture: ComponentFixture<ContainerAdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContainerAdComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContainerAdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
