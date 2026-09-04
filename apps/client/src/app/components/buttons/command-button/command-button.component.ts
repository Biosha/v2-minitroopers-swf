import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-command-button',
  imports: [RouterModule],
  templateUrl: './command-button.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './command-button.component.scss',
})
export class CommandButtonComponent {
  @Input() type: 'blue' | 'orange' | 'green' = 'blue';
  @Input() text = '';
  @Input() icon = '';
  @Input() disabled = false;
  @Output() clicked = new EventEmitter<boolean>();

  onClicked(e: MouseEvent) {
    e.stopPropagation();
    if (!this.disabled) {
      this.clicked.emit(true);
    }
  }
}
