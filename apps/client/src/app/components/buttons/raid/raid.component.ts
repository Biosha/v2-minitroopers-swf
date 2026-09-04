import { DecimalPipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import { PartialUserExtended } from '@minitroopers/shared';
import { interval, Subject, takeUntil } from 'rxjs';
import { FightService } from 'src/app/services/fight.service';
import { GoComponent } from '../go/go.component';

@Component({
  selector: 'app-raid',
  imports: [GoComponent],
  providers: [DecimalPipe],
  templateUrl: './raid.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './raid.component.scss',
})
export class RaidComponent implements OnChanges, OnDestroy {
  @Input() user!: PartialUserExtended;
  @Output() setTitle = new EventEmitter<number>();

  timeLeft = '';
  tryLeft = '';

  noRecruits = false;

  raidTroopers = 0;
  raidLevel = 0;

  private fightService = inject(FightService);

  private decimalPipe = inject(DecimalPipe);
  private router = inject(Router);
  private destroyed$ = new Subject<void>();

  ngOnChanges(): void {
    this.loadAvailableTroopers();
  }

  loadAvailableTroopers() {
    this.fightService.getTroopersRaid().subscribe((raid) => {
      this.noRecruits = false;
      this.raidTroopers = raid.troopers.length;
      this.raidLevel = raid.level;
      this.setTitle.emit(this.raidLevel);
      this.applyLogic();
    });
  }

  applyLogic() {
    if (this.raidTroopers == 1 && this.user.raids?.length == 0) {
      this.noRecruits = true;
      this.raidTroopers = 0;
    }
    if (this.raidTroopers == 0 || this.user.raids?.length >= 20) {
      this.buildTimeLeft();
      interval(60000)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(() => {
          this.buildTimeLeft();
        });
    } else {
      this.getTryLeft();
    }
  }

  getTryLeft() {
    this.tryLeft =
      'Encore ' + this.raidTroopers + ' recrues disponibles pour le raid !';
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

  onClick(event: MouseEvent) {
    event.stopPropagation();
    if (this.user) {
      this.fightService.createRaid().subscribe((result) => {
        // console.log(result);
        if (result.raidId) {
          this.router.navigate(['raid', result.raidId], {
            state: {
              swfData: result.swfData,
              raidLevel: this.raidLevel,
            },
          });
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
