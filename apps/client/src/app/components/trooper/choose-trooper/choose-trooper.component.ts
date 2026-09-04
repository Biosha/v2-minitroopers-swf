import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TrooperDay } from '@minitroopers/shared';
import { TrooperCellComponent } from '../trooper-cell/trooper-cell.component';

@Component({
  selector: 'app-choose-trooper',
  imports: [TrooperCellComponent],
  templateUrl: './choose-trooper.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './choose-trooper.component.scss',
})
export class ChooseTrooperComponent {
  @Input() troopers: TrooperDay[] = [];
  @Input() formGroup!: FormGroup<string>;
  @Input() groupColor: number | undefined = undefined;

  selectedTrooper: string | undefined = undefined;

  onSelect(trooperId: string) {
    if (this.formGroup.enabled) {
      this.selectedTrooper = trooperId;
      this.formGroup.get('trooper')?.setValue(trooperId);
    }
  }
}
