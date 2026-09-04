import { Trooper } from "./domain-types";
import {
  BodyLoc,
  MoveSystem,
  ReloadSystem,
  TargetSystem,
  TargetType,
  WeaponEnum,
} from "./helperSerial/enum";
import { BasicWeapons, Skills } from "./skills.model";

export const getUpgradeCost = (level: number): number => {
  return Math.floor(Math.sqrt(Math.pow(level, 5)));
};

export const getAddCost = (trooperLength: number): number => {
  if (trooperLength > 11) {
    return 0;
  }
  return Math.floor(6 * Math.pow(trooperLength, 2)) + 2;
};

export class Rand {
  seed: bigint;

  constructor(param1 = 0) {
    this.seed = BigInt(param1 + 131);
  }

  initSeed(param1: bigint, param2: number = 5) {
    param1 = BigInt(param1);
    let _loc5_;
    for (let i = 0; i < param2; i++) {
      // Apply a series of bitwise operations to scramble the seed
      param1 ^= (param1 << 7n) & 727393536n;
      param1 ^= (param1 << 15n) & 462094336n;
      param1 ^= param1 >> 16n;
      param1 &= 1073741823n; // Limit to 30 bits
      // Perform additional scrambling with a hash-like function
      _loc5_ = 5381n;
      _loc5_ = (_loc5_ << 5n) + _loc5_ + (param1 & 255n);
      _loc5_ = (_loc5_ << 5n) + _loc5_ + ((param1 >> 8n) & 255n);
      _loc5_ = (_loc5_ << 5n) + _loc5_ + ((param1 >> 16n) & 255n);
      _loc5_ = (_loc5_ << 5n) + _loc5_ + (param1 >> 24n);
      param1 = _loc5_ & 1073741823n;
    }
    // Update the seed with the transformed value and offset by 131
    this.seed = (param1 & 536870911n) + 131n;
  }

  random(seed: number) {
    this.seed = (this.seed * 16807n) % 2147483647n;
    return Number((this.seed & 1073741823n) % BigInt(seed));
  }

  getOriginalSeed() {
    return Number(this.seed - 131n);
  }
}

export class TrooperSkill {
  originalSeed: number = 0;
  seed!: Rand;
  choices: number[] = [];
  level: number = -1;
  Skills: number[] = [];

  private iav: number[] = [];
  private ssum: number = 0;
  private lock: Array<{ id: number; lim: number }> = [];

  constructor(seed: number, choices: number[] = []) {
    this.originalSeed = seed;
    this.choices = choices;
    this.Skills = [];

    this.seed = new Rand(seed);

    this.initSkills();
    this.processChoices(this.choices);
  }

  private addSkill(skillId: number) {
    if (this.iav[skillId] > 0) return;
    this.iav[skillId] = Skills[skillId].weight;
    this.ssum += Skills[skillId].weight;
  }

  private lockSkill(skillId: number, minLevel: number) {
    const lockEntry = { id: skillId, lim: minLevel };
    const position = this.lock.findIndex((entry) => entry.lim >= minLevel);
    if (position === -1) {
      this.lock.push(lockEntry);
    } else {
      this.lock.splice(position, 0, lockEntry);
    }
  }

  private removeSkill(skillId: number) {
    if (this.iav[skillId] === 0) return;
    this.ssum -= this.iav[skillId];
    this.iav[skillId] = 0;
  }

  private updateSeed(seed: Rand) {
    seed.seed = (seed.seed * 16807n) % 2147483647n;
    return Number(seed.seed & 1073741823n);
  }

  private initSkills() {
    const skillCount = Skills.length;
    this.iav = new Array(skillCount).fill(0);
    this.ssum = 0;
    this.lock = [];
    const armyJobCategory = "ARMY_JOB";

    const updateSeedPhysical = (seed: Rand) => {
      this.updateSeed(seed);
      this.updateSeed(seed);
      this.updateSeed(seed);
      const skinColor = this.updateSeed(seed) % 4;

      if (skinColor === 0 || skinColor === 1) {
        this.updateSeed(seed);
      }

      return seed;
    };

    for (let i = 0; i < skillCount; i++) {
      const skill = Skills[i];
      if (skill.min === 0) {
        if (!skill.cat.some((category) => category[0] === armyJobCategory)) {
          this.addSkill(i);
        } else {
          // console.log('not adding skill' + skill.name);
        }
      } else {
        // Lock Skills with a minimum level
        this.lockSkill(i, skill.min);
      }
    }

    for (let i = 0; i < skillCount; i++) {
      const skill = Skills[i];
      if (skill.open) {
        skill.open.forEach((dependentSkill) => {
          const dependentSkillIndex = Skills.findIndex(
            (s) => s.id[1] === dependentSkill[1],
          );
          if (dependentSkillIndex !== -1) {
            this.removeSkill(dependentSkillIndex);
          }
        });
      }
    }

    updateSeedPhysical(this.seed);
    const weaponIndex = this.seed.random(BasicWeapons.length);
    const chosenWeapon = BasicWeapons[weaponIndex];

    this.Skills.push(chosenWeapon);

    BasicWeapons.forEach((weaponId) => {
      this.removeSkill(weaponId);
    });

    this.levelUp(0);
  }

  generateSkillChoices() {
    const choiceCount = 3;

    let skillWeights = [...this.iav];
    let totalWeight = this.ssum;

    // Special handling for lvl === 4
    if (this.level === 4) {
      skillWeights = Skills.map((skill) =>
        skill.cat.some((category) => category[0] === "ARMY_JOB")
          ? skill.weight
          : 0,
      );
      totalWeight = skillWeights.reduce((sum, weight) => sum + weight, 0);
    }

    const localChoices = [];

    for (let i = 0; i < choiceCount; i++) {
      if (totalWeight === 0) break;

      const randomValue = this.seed.random(totalWeight);

      let cumulativeWeight = 0;
      let selectedIndex = -1;

      for (let j = 0; j < skillWeights.length; j++) {
        cumulativeWeight += skillWeights[j];
        if (cumulativeWeight > randomValue) {
          selectedIndex = j;
          break;
        }
      }

      if (selectedIndex === -1 || skillWeights[selectedIndex] === 0) {
        throw new Error("Invalid skill selection");
      }

      localChoices.push(selectedIndex);

      totalWeight -= skillWeights[selectedIndex];
      skillWeights[selectedIndex] = 0;
    }

    return localChoices;
  }

  private unlockSkillsForLevel() {
    while (this.lock.length > 0 && this.level > this.lock[0].lim) {
      const { id } = this.lock.shift() as { id: number; lim: number };
      this.addSkill(id);
    }
  }

  private levelUp(choiceIndex: number): number {
    const choices = this.generateSkillChoices();
    const selectedSkill = choices[choiceIndex];
    this.Skills.push(selectedSkill);
    this.removeSkill(selectedSkill);
    this.level++;

    this.unlockSkillsForLevel();

    if (selectedSkill !== undefined) {
      const selectedSkillData = Skills[selectedSkill];
      if (selectedSkillData?.open) {
        selectedSkillData.open.forEach((openSkill) => {
          const openSkillIndex = Skills.findIndex(
            (s) => s.id[1] === openSkill[1],
          );
          if (openSkillIndex !== -1) {
            this.addSkill(openSkillIndex);
          }
        });
      }
    }

    return selectedSkill;
  }

  private processChoices(choices: number[]) {
    choices.forEach((choice) => this.levelUp(choice));
  }

  getSkills(): number[] {
    return this.Skills;
  }

  getAvailableWeapons(): number[] {
    return this.Skills.filter(
      (skillId) =>
        Skills[skillId].type &&
        Skills[skillId].type[0] === "WEAPON" &&
        Skills[skillId].type[1] === 2,
    );
  }

  getItems(): number[] {
    return this.Skills.filter((skillId) =>
      Skills[skillId].cat.some(
        (cat) => cat[0] === "EQUIPMENT" && cat[1] === 11,
      ),
    );
  }
}

export type TrooperConfig = {
  CWeapon: number | null;
  CBody: number | null;
  targetSystem: number;
  targetType: number;
  moveSystem: number;
  name: string;
  selectedItems?: number[];
};

export const getTrooperPref = (trooper: Trooper): TrooperConfig => {
  const pref: any = {
    leftOver: [],
  };

  const moveIndex = trooper.moveSystem ?? 0;
  pref.moveSystem = new MoveSystem(
    MoveSystem.__construct__[moveIndex],
    moveIndex,
  );

  const reloadIndex = trooper.reloadSystem ?? 2;
  pref.reloadSystem = new ReloadSystem(
    ReloadSystem.__construct__[reloadIndex],
    reloadIndex,
  );

  const bodyIndex = trooper.CBody;
  pref.__CBody =
    bodyIndex === null
      ? null
      : new BodyLoc(BodyLoc.__construct__[bodyIndex], bodyIndex);

  const weaponIndex = trooper.CWeapon;
  pref.__CWeapon =
    weaponIndex === null
      ? null
      : new WeaponEnum(WeaponEnum.__construct__[weaponIndex], weaponIndex);

  const targetIndex = trooper.targetSystem ?? 0;
  pref.targetSystem = new TargetSystem(
    TargetSystem.__construct__[targetIndex],
    targetIndex,
  );

  pref.targetType = TargetType.DEFAULT;
  // } else if (
  //   pref.targetType[0] === "SPECIFIC_CLASS" &&
  //   pref.targetType[2] !== undefined
  // ) {
  //   const skillToTarget = new Skill(
  //     Skill.__construct__[pref.targetType[2]],
  //     pref.targetType[2],
  //   );
  //   pref.targetType = TargetType.SPECIFIC_CLASS(skillToTarget);
  // }

  if (trooper.selectedItems) {
    pref.selectedItems = trooper.selectedItems;
  }

  return pref;
};

export const getLeftOver = (trooper: Trooper): number[] => {
  const trooperSkill = new TrooperSkill(trooper.seed, trooper.choices);

  const allItems = trooperSkill.getItems();

  let selectedItems = trooper.selectedItems ?? [];

  if (allItems.length > 3) {
    if (trooper.selectedItems?.length < 3) {
      const manquants = allItems.filter(
        (item) => !selectedItems.includes(item),
      );

      selectedItems = [
        ...selectedItems,
        ...manquants.slice(0, 3 - selectedItems.length),
      ];
    }

    return allItems.filter((item) => !selectedItems?.includes(item));
  }

  return [];
};
