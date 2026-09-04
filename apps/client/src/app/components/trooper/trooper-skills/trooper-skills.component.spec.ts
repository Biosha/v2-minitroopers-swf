import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrooperSkillsComponent } from './trooper-skills.component';

describe('TrooperSkillsComponent', () => {
  let component: TrooperSkillsComponent;
  let fixture: ComponentFixture<TrooperSkillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrooperSkillsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TrooperSkillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
