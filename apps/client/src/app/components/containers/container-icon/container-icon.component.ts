import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-container-icon',
  imports: [],
  templateUrl: './container-icon.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './container-icon.component.scss',
})
export class IconContainerComponent {
  @Input() icon = '';
  @Input() value = 0;
}
