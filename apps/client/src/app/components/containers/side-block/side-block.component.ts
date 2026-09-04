import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { ArmyStore } from 'src/app/stores/army.store';
import { AuthStore } from 'src/app/stores/auth.store';
import { TroopersBlockComponent } from '../../trooper/troopers-block/troopers-block.component';
import { ContainerHistoryComponent } from '../container-history/container-history.component';
import { IconContainerComponent } from '../container-icon/container-icon.component';

@Component({
  selector: 'app-side-block',
  imports: [
    RouterOutlet,
    IconContainerComponent,
    TroopersBlockComponent,
    ContainerHistoryComponent,
  ],
  templateUrl: './side-block.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './side-block.component.scss',
})
export class SideBlockComponent {
  inputArmyName = signal<string | null>(null);

  public armyStore = inject(ArmyStore);
  private route = inject(ActivatedRoute);
  private authStore = inject(AuthStore);

  constructor() {
    if (!this.authStore.isAuthenticated()) {
      this.authStore.login();
    }

    this.armyStore.loadByRoute(this.inputArmyName);

    this.route.params.pipe(takeUntilDestroyed()).subscribe((params) => {
      if (params['army']) {
        this.inputArmyName.set(params['army']);
      }
    });
  }
}
