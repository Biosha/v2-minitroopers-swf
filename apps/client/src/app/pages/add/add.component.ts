import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TrooperDay } from '@minitroopers/shared';
import { getAddCost } from '@minitroopers/shared';
import { take } from 'rxjs';
import { CommandButtonComponent } from 'src/app/components/buttons/command-button/command-button.component';
import { ChooseTrooperComponent } from 'src/app/components/trooper/choose-trooper/choose-trooper.component';
import { BackendService } from 'src/app/services/backend.service';
import { NotificationService } from 'src/app/services/notification.service';
import { TrooperService } from 'src/app/services/trooper.service';
import { ArmyStore } from 'src/app/stores/army.store';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
  selector: 'app-add',
  imports: [ChooseTrooperComponent, CommandButtonComponent],
  templateUrl: './add.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './add.component.scss',
})
export class AddComponent implements OnInit {
  public displayedTroopers: TrooperDay[] = [];

  public addForm: FormGroup = new FormGroup({
    trooper: new FormControl('', Validators.required),
  });

  private backendService = inject(BackendService);
  private trooperService = inject(TrooperService);
  private router = inject(Router);
  public authStore = inject(AuthStore);
  public armyStore = inject(ArmyStore);
  private notificationService = inject(NotificationService);

  addCost = 0;
  lock = false;

  ngOnInit(): void {
    this.backendService
      .getTodayTroopers()
      .pipe(take(1))
      .subscribe((troopers: TrooperDay[]) => {
        this.displayedTroopers = troopers;
      });

    if (this.armyStore.isOwner()) {
      this.addCost = getAddCost(this.armyStore.army()!.troopers.length);
    }
  }

  addNewTrooper() {
    if (
      !this.lock &&
      this.addForm.get('trooper')?.value &&
      this.armyStore.isOwner()
    ) {
      if (this.addCost <= 0) {
        this.notificationService.notify('error', 'Limit troopers');
      }
      if (this.addCost > 0 && this.armyStore.army()!.gold >= this.addCost) {
        this.lock = true;

        this.trooperService
          .addTrooper(this.addForm.get('trooper')?.value)
          .pipe(take(1))
          .subscribe(() => {
            if (this.authStore.isAuthenticated()) {
              this.router.navigate(['/' + this.authStore.armyName()]);
            }
          });
      } else if (this.addCost > 0) {
        this.notificationService.notify('error', 'Not enought gold');
      }
    }
  }
}
