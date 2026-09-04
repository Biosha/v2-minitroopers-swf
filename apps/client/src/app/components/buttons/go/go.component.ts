import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ButtonState } from '@minitroopers/shared';

@Component({
  selector: 'app-go',
  imports: [],
  templateUrl: './go.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './go.component.scss',
})
export class GoComponent implements OnChanges {
  @Input() state: ButtonState = 'pending';
  @Input() smallIcon = false;
  @Output() eventClick = new EventEmitter<MouseEvent>();

  image = '';

  ngOnInit(): void {
    this.applyState(this.state);
  }

  ngOnChanges() {
    this.applyState(this.state);
  }

  applyState(state: ButtonState) {
    switch (state) {
      case 'lose':
        this.image = '/assets/images/bdefeat.webp';
        break;
      case 'pending':
        this.image = this.smallIcon
          ? '/assets/images/bgo3.gif'
          : '/assets/images/bgo.gif';
        break;
      case 'win':
        this.image = '/assets/images/bwin.webp';
        break;
    }
  }

  onClick(event: MouseEvent) {
    this.eventClick.emit(event);
  }
}
