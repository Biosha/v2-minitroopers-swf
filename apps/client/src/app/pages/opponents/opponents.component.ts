import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { TrooperOpponentComponent } from 'src/app/components/trooper/trooper-opponent/trooper-opponent.component';
import { FightService } from 'src/app/services/fight.service';
import { ArmyStore } from 'src/app/stores/army.store';
import { OpponentsStore } from 'src/app/stores/opponents.store';

@Component({
  selector: 'app-opponents',
  imports: [TrooperOpponentComponent],
  templateUrl: './opponents.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './opponents.component.scss',
})
export class OpponentsComponent {
  lockOpponents = false;

  public armyStore = inject(ArmyStore);
  public opponentsStore = inject(OpponentsStore);
  private fightService = inject(FightService);
  private router = inject(Router);

  constructor() {
    this.opponentsStore.loadOpponents();
  }

  onOpponentSelected(opponent: string) {
    if (this.lockOpponents) {
      return;
    }

    this.lockOpponents = true;
    this.fightService
      .createFight(opponent)
      .pipe(take(1))
      .subscribe((reponse) => {
        if (reponse?.fightId && typeof reponse.fightId === 'string') {
          this.router.navigate(['/war', reponse.fightId]);
        }
      });
  }
}
