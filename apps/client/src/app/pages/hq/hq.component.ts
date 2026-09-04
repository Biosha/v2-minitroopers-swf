import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ContainerAdComponent } from 'src/app/components/containers/container-ad/container-ad.component';
import { ContainerReferralComponent } from 'src/app/components/containers/container-referral/container-referral.component';
import { TodayFightComponent } from 'src/app/components/containers/today-fight/today-fight.component';
import { ArmyStore } from 'src/app/stores/army.store';

@Component({
  selector: 'app-hq',
  imports: [
    TodayFightComponent,
    ContainerAdComponent,
    ContainerReferralComponent,
  ],
  templateUrl: './hq.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './hq.component.scss',
})
export class HqComponent {
  armyStore = inject(ArmyStore);

  // tmp
  ad1: { image: string; link: string } = {
    image: '/assets/images/ads/mush_2.webp',
    link: 'https://google.fr',
  };
  ad2: { image: string; link: string } = {
    image: '/assets/images/ads/hordes.webp',
    link: 'https://google.fr',
  };
}
