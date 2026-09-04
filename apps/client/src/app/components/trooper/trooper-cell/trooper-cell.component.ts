import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Trooper, TrooperDay } from '@minitroopers/shared';
import { getLeftOver } from '@minitroopers/shared';
import { TrooperService } from 'src/app/services/trooper.service';
import { SkillsComponent } from '../skills/skills.component';

@Component({
  selector: 'app-trooper-cell',
  imports: [SkillsComponent],
  templateUrl: './trooper-cell.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './trooper-cell.component.scss',
})
export class TrooperCellComponent implements AfterViewInit, OnChanges {
  @ViewChild('insert') element!: ElementRef;

  @Input() trooper: TrooperDay | Trooper | undefined = undefined;
  @Input() withSkills = false;
  @Input() selected = false;
  @Input() disabledForm = false;
  @Input() groupColor: number | undefined = undefined;

  private timeout: NodeJS.Timeout | undefined = undefined;

  public firstSkill: number | undefined = undefined;
  public secondSkill: number | undefined = undefined;

  private trooperService = inject(TrooperService);

  allSkills: string[] = [];

  ngAfterViewInit(): void {
    this.buildTrooper();
    if (this.trooper) {
      const allSkills = this.trooperService.getSkills(
        this.trooper.seed,
        this.trooper.choices,
      );

      this.firstSkill = allSkills[0];
      this.secondSkill = allSkills[1];
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['groupColor'] || changes['trooper']) {
      this.buildTrooper();
    }
  }

  buildTrooper() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      if (this.trooper && this.element) {
        this.trooperService.renderTrooper(
          this.element.nativeElement,
          this.trooper.seed,
          this.groupColor ?? (this.trooper as Trooper).group,
          this.trooper.name,
          {
            CWeapon: (this.trooper as Trooper).CWeapon,
            CBody: (this.trooper as Trooper).CBody,
            targetSystem: (this.trooper as Trooper).targetSystem,
            targetType: (this.trooper as Trooper).targetType,
            moveSystem: (this.trooper as Trooper).moveSystem,
            selectedItems: (this.trooper as Trooper).selectedItems,
          },
          this.trooper.choices,
          getLeftOver(this.trooper as Trooper),
        );
      }
    }, 400);
  }
}
