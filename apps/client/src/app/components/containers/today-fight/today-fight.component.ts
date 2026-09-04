import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  Input,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ArmyStore } from 'src/app/stores/army.store';
import { FightComponent } from '../../buttons/fight/fight.component';
import { MissionsComponent } from '../../buttons/missions/missions.component';
import { RaidComponent } from '../../buttons/raid/raid.component';

@Component({
  selector: 'app-today-fight',
  imports: [CommonModule, FightComponent, MissionsComponent, RaidComponent],
  templateUrl: './today-fight.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './today-fight.component.scss',
})
export class TodayFightComponent implements OnInit {
  @Input() type: 'fight' | 'exterminate' | 'infiltrate' | 'raid' | 'epic' =
    'fight';
  title = '';
  image = '';

  public armyStore = inject(ArmyStore);

  ngOnInit(): void {
    switch (this.type) {
      case 'fight':
        this.title = 'Bataille';
        this.image = '/assets/images/mode/garden.webp';
        break;
      case 'exterminate':
        this.title = 'Extermination';
        this.image = '/assets/images/mode/attic.webp';
        break;
      case 'infiltrate':
        this.title = 'Infiltration';
        this.image = '/assets/images/mode/sewer.webp';
        break;
      case 'epic':
        this.title = 'Mission : EPIC';
        this.image = '/assets/images/mode/road.webp';
        break;
      case 'raid':
        this.title = 'Raid';
        this.image = '/assets/images/mode/wood.webp';
        break;
    }
  }

  setRaidTitle(number: number) {
    this.title = 'Raid ' + number;
  }
}
