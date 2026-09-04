import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-container',
  imports: [RouterModule],
  templateUrl: './container.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './container.component.scss',
})
export class ContainerComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private mediaQuery: MediaQueryList | null = null;
  private mediaListener: ((event: MediaQueryListEvent) => void) | null = null;

  ads: Ad[] = [];
  currentYear = new Date().getFullYear();

  private readonly mobileAds: Ad[] = [
    {
      description: "Devenez gérant d'un hôtel... particuliers",
      image: '/assets/images/ads/croquemotel.jpg',
      link: 'https://www.google.fr',
      title: 'Croquemotel',
    },
    {
      description: 'Elevez et faîtes combattre vos Dinoz',
      image: '/assets/images/ads/dinorpg.jpg',
      link: 'https://www.google.fr',
      title: 'Dinorpg',
    },
  ];

  private readonly desktopAds: Ad[] = [
    ...this.mobileAds,
    {
      description: '16 membres, 2 traites détruisez ou survivez.',
      image: '/assets/images/ads/mush.jpg',
      link: 'https://www.google.fr',
      title: 'Mush',
    },
    {
      description: 'Le premier jeu de zombie gratuit !',
      image: '/assets/images/ads/hordes.jpg',
      link: 'https://www.google.fr',
      title: 'Hordes',
    },
  ];

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.ads = this.desktopAds;
      return;
    }

    this.mediaQuery = window.matchMedia('(max-width: 973px)');
    this.updateAds(this.mediaQuery.matches);
    this.mediaListener = (event) => this.updateAds(event.matches);
    this.mediaQuery.addEventListener('change', this.mediaListener);
  }

  ngOnDestroy(): void {
    if (this.mediaQuery && this.mediaListener) {
      this.mediaQuery.removeEventListener('change', this.mediaListener);
    }
  }

  private updateAds(isMobile: boolean) {
    this.ads = isMobile ? this.mobileAds : this.desktopAds;
  }
}

export interface Ad {
  image: string;
  title: string;
  description: string;
  link: string;
}
