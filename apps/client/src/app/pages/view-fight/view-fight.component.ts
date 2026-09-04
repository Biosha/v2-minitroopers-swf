import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Fight, PartialUserExtended } from '@minitroopers/shared';
import { take } from 'rxjs';
import { GetArmyNamePipe } from 'src/app/pipes/getArmyName.pipe';
import { FightService } from 'src/app/services/fight.service';
import { ArmyStore } from 'src/app/stores/army.store';

@Component({
  selector: 'app-view-fight',
  imports: [GetArmyNamePipe],
  templateUrl: './view-fight.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './view-fight.component.scss',
})
export class ViewFightComponent implements AfterViewInit {
  @ViewChild('insert') element!: ElementRef<HTMLElement>;

  fight: Fight | undefined = undefined;
  loadingFight = true;
  fightType: 'war' | 'mission' | 'raid' = 'war';
  savedSwfData: string | null = null;
  raidLevel = '';

  userArmy: PartialUserExtended | undefined = undefined;
  userOpponent: PartialUserExtended | undefined = undefined;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private armyStore = inject(ArmyStore);
  private fightService = inject(FightService);

  ngAfterViewInit(): void {
    const state = this.router.currentNavigation()?.extras.state;

    if (state?.['swfData']) {
      this.fightType = 'raid';
      this.raidLevel = state['raidLevel'] ?? '';
      this.renderSwf(state['swfData'] as string);
      return;
    }

    const fightId = this.route.snapshot.params['warId'];
    const path = this.route.routeConfig?.path;

    if (!fightId) {
      this.loadingFight = false;
      return;
    }

    if (path === 'war/:warId') {
      this.fightType = 'war';
      this.fightService
        .getFightDetails(fightId)
        .pipe(take(1))
        .subscribe((response) => {
          this.userArmy = response.left as PartialUserExtended;
          this.userOpponent = response.right as PartialUserExtended;
          this.renderSwf(response.data);
        });
    } else if (path === 'mission/:warId') {
      this.fightType = 'mission';
      this.fightService
        .getMissionDetails(fightId)
        .pipe(take(1))
        .subscribe((response) => {
          this.userArmy = response.left as PartialUserExtended;
          this.userOpponent = response.right as PartialUserExtended;
          this.renderSwf(response.data);
        });
    } else {
      this.loadingFight = false;
    }
  }

  private renderSwf(data: string) {
    this.fightService.renderFight(this.element.nativeElement, data);
    setTimeout(() => this.updateScale(), 300);
    this.loadingFight = false;
  }

  updateScale() {
    if (!this.element?.nativeElement?.firstElementChild) {
      return;
    }

    const containerWidth = this.element.nativeElement.offsetWidth;
    const scale = containerWidth / 720;
    const content = this.element.nativeElement.firstElementChild as HTMLElement;

    content.style.transform = `scale(${scale})`;
    content.style.transformOrigin = 'top left';
  }

  onReturn(event: MouseEvent) {
    event.stopPropagation();

    if (this.armyStore.army()) {
      this.router.navigate(['/' + this.armyStore.army()!.armyName]);
    } else {
      this.router.navigate(['/']);
    }
  }
}
