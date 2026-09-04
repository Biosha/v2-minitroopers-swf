import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-container-ad',
  imports: [],
  templateUrl: './container-ad.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './container-ad.component.scss',
})
export class ContainerAdComponent {
  @Input() image = '';
  @Input() link = '';

  adClicked() {
    // stats
    // go to url
  }
}
