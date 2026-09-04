import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Trooper } from '@minitroopers/shared';
import {
  getUpgradeCost,
  Skills,
  TrooperSkill,
  Weapons,
} from '@minitroopers/shared';
import { take } from 'rxjs';
import { TooltipDirective } from 'src/app/directives/tooltip.directive';
import { NotificationService } from 'src/app/services/notification.service';
import { TrooperService } from 'src/app/services/trooper.service';
import { ArmyStore } from 'src/app/stores/army.store';
import { environment } from 'src/environments/environment';
import { CommandButtonComponent } from '../../buttons/command-button/command-button.component';
import {
  InputSelectComponent,
  SelectOption,
} from '../../buttons/input-select/input-select.component';
import { TrooperCellComponent } from '../trooper-cell/trooper-cell.component';

const TROOPER_STATS_SKILL_ORDER = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 56, 57, 59,
  63, 65, 82, 86, 89, 91, 116, 122, 136, 45, 48, 51, 52, 64, 67, 71, 73, 93, 94,
  101, 108, 115, 132, 43, 44, 53, 54, 62, 66, 79, 96, 97, 99, 102, 104, 105,
  106, 112, 114, 117, 119, 124, 126, 127, 129, 130, 131, 137, 138, 46, 50, 69,
  78, 107, 109, 110, 111, 113, 125, 134, 139, 58, 60, 68, 83, 84, 87, 88, 133,
  47, 49, 55, 61, 70, 72, 74, 75, 76, 77, 80, 81, 85, 92, 95, 98, 100, 103, 118,
  120, 121, 123, 128, 135, 38, 39, 40, 41, 42, 90,
];

@Component({
  selector: 'app-trooper-skills',
  imports: [
    TrooperCellComponent,
    CommandButtonComponent,
    ReactiveFormsModule,
    TooltipDirective,
    InputSelectComponent,
  ],
  templateUrl: './trooper-skills.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './trooper-skills.component.scss',
})
export class TrooperSkillsComponent implements OnChanges {
  @Input() selectedTrooper!: Trooper;
  @Input() isEditable = false;
  @Output() switchButton = new EventEmitter<boolean>();
  @Output() updatedTrooper = new EventEmitter<Trooper>();

  public displayedSkills = TROOPER_STATS_SKILL_ORDER;
  public unlockedSkills: Record<number, boolean> = {};

  public selectableItems: SelectOption[] = [];
  public selectedItems: SelectOption[] = [];

  public updateForm: FormGroup = new FormGroup({
    CWeapon: new FormControl(null),
    CBody: new FormControl(null),
    targetSystem: new FormControl(0, Validators.required),
    targetType: new FormControl(0),
    moveSystem: new FormControl(1, Validators.required),
    name: new FormControl('', { validators: Validators.required }), //check allowed
    selectedItems: new FormControl(null),
  });

  public updateAttributes: {
    value: string;
    label: string;
    options: { name: string; value: number }[];
    defaultValue?: any;
  }[] = [
    {
      value: 'CWeapon',
      label: 'Prefered Weapon',
      options: [],
    },
    {
      value: 'CBody',
      label: 'Prefered Aim',
      options: [
        { name: 'HEAD', value: 0 },
        { name: 'TORSO_LEFT', value: 0 },
        { name: 'TORSO_RIGHT', value: 0 },
        { name: 'STOMACH', value: 0 },
        { name: 'ARM_LEFT', value: 0 },
        { name: 'ARM_RIGHT', value: 0 },
        { name: 'LEG_LEFT', value: 0 },
        { name: 'LEG_RIGHT', value: 0 },
      ],
    },
    {
      value: 'targetSystem',
      label: 'Prefered Target',
      options: [
        { name: 'CLOSEST', value: 0 },
        { name: 'EASIEST', value: 1 },
        { name: 'WEAKEST', value: 2 },
        { name: 'STRONGEST', value: 3 },
      ],
      defaultValue: 0,
    },
    {
      value: 'moveSystem',
      label: 'Prefered Behavior',
      options: [
        { name: 'HUNTER', value: 0 },
        { name: 'STANDARD', value: 1 },
        { name: 'DEFENDER', value: 2 },
      ],
      defaultValue: 1,
    },
  ];

  public upgradeCost = 0;
  public lock = false;

  public armyStore = inject(ArmyStore);
  private trooperService = inject(TrooperService);
  private notificationService = inject(NotificationService);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedTrooper']?.currentValue != null) {
      const trooperSkill = new TrooperSkill(
        this.selectedTrooper.seed,
        this.selectedTrooper.choices,
      );

      this.buildAvailableWeapons(trooperSkill);

      this.unlockedSkills = {};

      for (const skill of trooperSkill.getSkills()) {
        this.unlockedSkills[skill] = true;
      }
      this.upgradeCost = getUpgradeCost(
        this.selectedTrooper.choices.length + 1,
      );
      this.updateForm.reset();
      this.buildForm();
    }
    if (changes['isEditable']?.currentValue != null) {
      if (this.isEditable) {
        this.updateForm.enable();
      } else {
        this.updateForm.disable();
      }
    }
  }

  buildAvailableWeapons(trooperSkill: TrooperSkill) {
    const idx = this.updateAttributes.findIndex(
      (attribute) => attribute.value === 'CWeapon',
    );

    if (idx !== -1) {
      this.updateAttributes[idx].options = trooperSkill
        .getAvailableWeapons()
        .map((skillId) => {
          return {
            name: Skills[skillId].name,
            value: Weapons[2 + skillId - 9].id[1] as number,
          };
        });
    }
  }

  buildForm() {
    this.updateForm.get('name')?.setValue(this.selectedTrooper.name);

    for (const elementUpdate of this.updateAttributes) {
      this.updateForm
        .get(elementUpdate.value)
        ?.setValue(
          this.selectedTrooper[elementUpdate.value as keyof Trooper] ??
            elementUpdate.defaultValue,
        );
    }

    if (
      this.updateForm.get('CWeapon')?.value == null &&
      this.updateAttributes[0].options.length
    ) {
      this.updateForm
        .get('CWeapon')
        ?.setValue(this.updateAttributes[0].options[0].value);
    }

    this.selectableItems = Object.entries(this.unlockedSkills).reduce(
      (acc: SelectOption[], [key]) => {
        const skill = Skills[parseInt(key)];
        if (
          skill &&
          skill.cat.some((cat) => cat[0] === 'EQUIPMENT' && cat[1] === 11)
        ) {
          acc.push({ value: parseInt(key), label: skill.name });
        }
        return acc;
      },
      [],
    );

    const selectedItems = this.selectedTrooper.selectedItems;
    this.selectedItems = [];

    if (selectedItems && selectedItems.length > 0) {
      this.updateForm
        .get('selectedItems')
        ?.setValue(this.selectedTrooper.selectedItems);
    }

    if (this.selectableItems.length > 3) {
      this.selectedItems = this.selectableItems
        .filter((item) => selectedItems.includes(item.value))
        .map((item) => item.value);
    }
  }

  onSelectableItemsChange(items: any[]) {
    this.updateForm.get('selectedItems')?.setValue(items);
    this.updateForm.markAsDirty();
    // this.selectedItems = items;
  }

  payUpgrade() {
    if (
      (this.armyStore.army() && this,
      this.armyStore.isOwner() &&
        this.armyStore.army()!.gold >= this.upgradeCost &&
        !this.lock)
    ) {
      this.switchButton.emit(true);
    }
  }

  share() {
    const url =
      environment.inviteUrl +
      this.armyStore.currentArmyName() +
      '/' +
      this.selectedTrooper.id;
    navigator.clipboard.writeText(url);
    this.notificationService.notify(
      'success',
      'Lien copié dans le presse papier',
    );
  }

  submitForm() {
    if (!this.lock && this.updateForm.valid) {
      this.lock = true;
      this.updateForm.disable();

      const values = this.updateForm.getRawValue();
      for (const updateAttribute of this.updateAttributes) {
        if (
          values[updateAttribute.value] != null &&
          typeof values[updateAttribute.value] != 'number'
        ) {
          values[updateAttribute.value] = parseInt(
            values[updateAttribute.value],
          );
        }
      }

      this.trooperService
        .updateConfigTrooper(this.selectedTrooper.id, values)
        .pipe(take(1))
        .subscribe((response) => {
          if (response) {
            this.lock = false;
            this.updateForm.enable();
            this.updateForm.markAsPristine();
            this.notificationService.notify('success', 'Saved');
            this.selectedTrooper = { ...this.selectedTrooper, ...values };
            this.armyStore.updateTrooper(this.selectedTrooper);
          }
        });
    }
  }
}
