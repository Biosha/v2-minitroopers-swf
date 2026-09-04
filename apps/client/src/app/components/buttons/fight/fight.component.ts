import { DecimalPipe } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  ButtonState,
  PartialUserExtended,
  getFightState,
} from '@minitroopers/shared';
import { Subject, interval, takeUntil } from 'rxjs';
import { NotificationService } from 'src/app/services/notification.service';
import { ArmyStore } from 'src/app/stores/army.store';
import { GoComponent } from '../go/go.component';

@Component({
  selector: 'app-fight',
  imports: [GoComponent],
  providers: [DecimalPipe],
  templateUrl: './fight.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './fight.component.scss',
})
export class FightComponent implements OnChanges, OnDestroy {
  @Input() user!: PartialUserExtended;
  @Input() smallIcon = false;

  states: ButtonState[] = [];
  isLocked = false;

  pendingLeft: number = this.states.length;
  timeLeft = '';
  tryLeft = '';

  private decimalPipe = inject(DecimalPipe);
  protected router = inject(Router);
  protected armyStore = inject(ArmyStore);
  protected notificationService = inject(NotificationService);
  private destroyed$ = new Subject<void>();

  ngOnChanges(): void {
    if (this.user) {
      this.states = this.getButtonState();

      if (!this.states.includes('unlock')) {
        this.isLocked = false;
        this.pendingLeft = this.states.filter((x) => x == 'pending').length;

        if (this.pendingLeft == 0) {
          this.buildTimeLeft();
          interval(60000)
            .pipe(takeUntil(this.destroyed$))
            .subscribe(() => {
              this.buildTimeLeft();
            });
        } else {
          this.getTryLeft();
        }
      } else {
        this.isLocked = true;
      }
    }
  }

  getButtonState() {
    return getFightState(this.user.fights);
  }

  getTryLeft() {
    this.tryLeft =
      'Il te reste ' + this.pendingLeft + " batailles aujourd'hui !";
  }

  buildTimeLeft() {
    const diff = new Date().setHours(23, 59, 59, 0) - Date.now();

    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);

    this.timeLeft =
      this.decimalPipe.transform(hours, '2.0-0') +
      'h ' +
      this.decimalPipe.transform(minutes, '2.0-0') +
      'm';
  }

  onClick(event: MouseEvent, state: ButtonState, index: number) {
    event.stopPropagation();

    switch (state) {
      case 'win':
      case 'lose':
        if (this.armyStore.army()?.fights?.length && this.user?.fights) {
          const fight = [...this.user.fights].reverse()[index];
          this.router.navigate(['/war', fight.id], {
            state: { fight: fight },
          });
        }
        break;
      case 'pending':
        if (this.armyStore.isOwner()) {
          this.router.navigate(['/' + this.user.armyName, 'war']);
        }
        break;
      // case 'unlock':
      //   if (this.armyStore.isOwner()) {
      //     if (this.armyStore.army()!.gold >= 5) {
      //       this.armyStore.unlockMission((this as any).type);
      //     } else {
      //       this.notificationService.notify(
      //         'error',
      //         "Pas assez d'argent pour débloquer la mission",
      //       );
      //     }
      //   }
      //   break;
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
