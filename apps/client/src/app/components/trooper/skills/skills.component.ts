import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TooltipDirective } from 'src/app/directives/tooltip.directive';

@Component({
  selector: 'app-skills',
  imports: [TooltipDirective],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsComponent {
  @Input() skillId: number | undefined = undefined;
  @Input() trooperName: string | undefined = undefined;
}
