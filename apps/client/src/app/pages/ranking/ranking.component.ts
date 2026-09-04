import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { UserRanking } from '@minitroopers/shared';
import { catchError, of } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { ArmyStore } from 'src/app/stores/army.store';

@Component({
  selector: 'app-ranking',
  imports: [],
  templateUrl: './ranking.component.html',
  styleUrl: './ranking.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RankingComponent implements OnInit {
  users = signal<UserRanking[]>([]);

  public availableColors: string[] = [
    '#E87D5F',
    '#FFAA27',
    '#FFDB7F',
    '#96B732',
    '#9EADEF',
    '#A55DC6',
  ];

  private backendService = inject(BackendService);
  private armyStore = inject(ArmyStore);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadRanking();
  }

  loadRanking() {
    this.backendService
      .getRanking(this.armyStore.currentArmyName())
      .pipe(catchError(() => of([])))
      .subscribe((users) => {
        this.users.set(users);
      });
  }

  goToArmy(armyName: string) {
    this.router.navigate([armyName]);
  }
}
