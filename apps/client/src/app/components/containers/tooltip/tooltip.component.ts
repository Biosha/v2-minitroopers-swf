import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { SkillContent, Skills, Weapons } from '@minitroopers/shared';
import { GetSkillAttributePipe } from 'src/app/pipes/getSkillAttribute.pipe';

@Component({
  selector: 'app-tooltip',
  imports: [GetSkillAttributePipe],
  templateUrl: './tooltip.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './tooltip.component.scss',
})
export class TooltipComponent implements OnInit {
  @Input() skillId: number | undefined = undefined;
  @Input() trooperName: string | undefined = undefined;

  tooltipSkill: SkillContent | undefined = undefined;
  weaponFormat: any = {};

  weaponAttributes: string[] = [
    'damage',
    'range',
    'critical',
    'aim',
    'bursts',
    'recovery',
    'skills',
  ];

  ngOnInit(): void {
    if (this.skillId != null) {
      this.tooltipSkill = Skills[this.skillId];
      if (this.tooltipSkill.type && this.tooltipSkill.type[0] === 'WEAPON') {
        this.weaponFormat = this.getWeaponFormat(this.skillId);
      }
    }
  }

  getWeaponFormat(weaponId: number): any {
    const weapon = Weapons[2 + weaponId - 9];

    // Format damage range
    let damage = weapon.dmin.toString();
    if (weapon.dmax > weapon.dmin) {
      damage += '-' + weapon.dmax.toString();
    }

    // Format range
    let range = '';
    if (weapon.rmin !== null) {
      range += weapon.rmin + '-';
    }

    range += weapon.rmax !== null ? weapon.rmax : 'max';

    const abilities: string[] | null = weapon.habilities?.length
      ? (weapon.habilities.map((x) => x[0]) as string[])
      : null;

    return {
      bursts: weapon.shots.toString(),
      damage: damage,
      range: range,
      critical: 'x' + weapon.crit,
      aim: weapon.hit + '%',
      recovery: weapon.recovery.toString(),
      skills: abilities?.join(', '),
    };
  }
}
