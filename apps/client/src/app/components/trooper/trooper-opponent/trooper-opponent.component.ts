import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { PartialUserExtended } from '@minitroopers/shared';
import { GetArmyNamePipe } from 'src/app/pipes/getArmyName.pipe';
import { TroopersGridComponent } from '../troopers-grid/troopers-grid.component';

@Component({
  selector: 'app-trooper-opponent',
  imports: [TroopersGridComponent, GetArmyNamePipe],
  templateUrl: './trooper-opponent.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './trooper-opponent.component.scss',
})
export class TrooperOpponentComponent {
  @Input() opponent!: PartialUserExtended;
  @Input() lock = false;
  @Output() opponentSelected = new EventEmitter<string>();

  onClick(event: MouseEvent, opponentName: string) {
    event.stopPropagation();

    if (!this.lock) {
      this.opponentSelected.emit(opponentName);
    }
  }
}
