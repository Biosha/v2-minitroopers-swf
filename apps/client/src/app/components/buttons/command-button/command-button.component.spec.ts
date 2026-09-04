import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandButtonComponent } from './command-button.component';

describe('CommandButtonComponent', () => {
  let component: CommandButtonComponent;
  let fixture: ComponentFixture<CommandButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CommandButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
