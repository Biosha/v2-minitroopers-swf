import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Trooper } from '@minitroopers/shared';
import { Skills, TrooperSkill } from '@minitroopers/shared';
import { take } from 'rxjs';
import { TooltipDirective } from 'src/app/directives/tooltip.directive';
import { TrooperService } from 'src/app/services/trooper.service';
import { TrooperCellComponent } from '../trooper-cell/trooper-cell.component';

@Component({
  selector: 'app-trooper-choice',
  imports: [TrooperCellComponent, CommonModule, TooltipDirective],
  templateUrl: './trooper-choice.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './trooper-choice.component.scss',
})
export class TrooperChoiceComponent implements OnInit {
  @Input() selectedTrooper!: Trooper;
  @Output() returnChoice = new EventEmitter<boolean>();
  @Output() updatedTrooper = new EventEmitter<Trooper>();

  public has3Choices = false;
  public skills: number[] = [];
  public allSkills = Skills;
  private trooperSkill: TrooperSkill | undefined = undefined;

  private trooperService = inject(TrooperService);

  lock = false;

  ngOnInit(): void {
    this.trooperSkill = new TrooperSkill(
      this.selectedTrooper.seed,
      this.selectedTrooper.choices,
    );
    this.skills = this.trooperSkill.generateSkillChoices();
    this.has3Choices = this.trooperSkill.Skills.includes(64);
  }

  chooseSkill(index: number) {
    if (!this.lock && this.selectedTrooper) {
      this.lock = true;

      if (confirm('Voulez-vous vraiment choisir cette compétence ?')) {
        this.trooperService
          .chooseSkill(this.selectedTrooper.id, index)
          .pipe(take(1))
          .subscribe((response) => {
            if (response.troopers?.length) {
              const trooperUpdated = response.troopers.find(
                (x) => x.id == this.selectedTrooper.id,
              );
              if (trooperUpdated) {
                this.updatedTrooper.emit(trooperUpdated);
                this.returnChoice.emit(true);
              }
            }
          });
      } else {
        this.lock = false;
      }
    }
  }
}
