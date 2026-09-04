import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Trooper } from '@minitroopers/shared';
import {
  BodyLoc,
  ClientMode,
  getLeftOver,
  MoveSystem,
  objectObfuscator,
  ReloadSystem,
  Serializer,
  SkillEnum,
  TargetSystem,
  TargetType,
  TrooperConfig,
  TrooperSkill,
  TrooperType,
  UserExtended,
  WeaponEnum,
} from '@minitroopers/shared';
import { take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ArmyStore } from '../stores/army.store';

@Injectable({
  providedIn: 'root',
})
export class TrooperService {
  private http = inject(HttpClient);
  private armyStore = inject(ArmyStore);

  upgradeTrooper(trooperId: string) {
    return this.http
      .post<UserExtended>(environment.apiUrl + '/api/trooper/upgrade', {
        trooperId: trooperId,
      })
      .pipe(
        tap((response) => {
          if (response?.troopers?.length) {
            this.armyStore.updateArmy(response);
          }
        }),
      );
  }

  updateConfigTrooper(trooperId: string, config: TrooperConfig) {
    return this.http
      .post<boolean>(environment.apiUrl + '/api/trooper/updateConfig', {
        trooperId: trooperId,
        config: config,
      })
      .pipe(take(1));
  }

  chooseSkill(trooperId: string, skillIndex: number) {
    return this.http
      .post<UserExtended>(environment.apiUrl + '/api/trooper/chooseSkill', {
        trooperId: trooperId,
        skillIndex: skillIndex,
      })
      .pipe(
        tap((response) => {
          if (response?.troopers?.length) {
            this.armyStore.updateArmy(response);
          }
        }),
      );
  }

  addTrooper(trooperId: string) {
    return this.http
      .post<UserExtended>(environment.apiUrl + '/api/trooper/add', {
        trooper: trooperId,
      })
      .pipe(
        tap((response) => {
          if (response?.troopers?.length) {
            this.armyStore.updateArmy(response);
          }
        }),
      );
  }

  renderTrooper(
    container: HTMLElement,
    seed: number,
    groupColor: number,
    name: string,
    pref: Partial<TrooperConfig>,
    choices: number[],
    leftOver: number[],
  ) {
    container.innerHTML = '';

    const ruffle = (window as any).RufflePlayer.newest();
    const player = ruffle.createPlayer();

    player.style.height = '71px';
    player.style.width = '72px';

    player.config = {
      allowScriptAccess: true,
      scale: 'noscale',
      wmode: 'transparent',
    };

    container.appendChild(player);

    player.load({
      url: '/assets/swf/client_fr_edit.swf',
      parameters: this.embededUrlTrooper(
        seed,
        groupColor,
        name,
        pref,
        choices,
        leftOver,
      ),
    });
  }

  renderArmy(
    container: HTMLElement,
    groupColor: number,
    troopers: Trooper[],
    col: number,
  ) {
    container.innerHTML = '';

    const ruffle = (window as any).RufflePlayer.newest();
    const player = ruffle.createPlayer();

    const ymax = Math.ceil((troopers.length + 1) / col);

    player.style.height = ymax * 72 + 'px'; // cutsom regarding troopers length
    player.style.width = 70 * col + 4 + 'px';

    player.config = {
      allowScriptAccess: true,
      scale: 'noscale',
      wmode: 'transparent',
    };

    container.appendChild(player);

    player.load({
      url: '/assets/swf/client_fr_edit.swf',
      parameters: this.embededUrlArmy(groupColor, troopers, ymax, col),
    });
  }

  getSkills(seed: number, choices: number[] = []): number[] {
    return new TrooperSkill(seed, choices).getSkills();
  }

  private embededUrlTrooper(
    seed: number,
    group: number,
    name: string,
    pref: Partial<TrooperConfig & { leftOver: number[] }>,
    choices: number[] = [],
    leftOver: number[] = [],
  ) {
    const data = {
      mode: ClientMode.NEW_TROOPER(
        {
          name: name,
          seed: seed,
          type: TrooperType.HUMAN,
          id: 0,
          choices: choices || [],
          force: [],
          pref: {
            moveSystem: new MoveSystem(
              MoveSystem.__construct__[pref.moveSystem ?? 1],
              pref.moveSystem ?? 1,
            ),
            reloadSystem: ReloadSystem.DEFAULT,
            leftOver: leftOver?.length
              ? leftOver.map(
                  (skillId) =>
                    new SkillEnum(SkillEnum.__construct__[skillId], skillId),
                )
              : [],
            __CBody:
              pref.CBody == null
                ? null
                : new BodyLoc(
                    BodyLoc.__construct__[pref.CBody ?? 0],
                    pref.CBody ?? 0,
                  ),
            __CWeapon:
              pref.CWeapon == null
                ? null
                : new WeaponEnum(
                    WeaponEnum.__construct__[pref.CWeapon],
                    pref.CWeapon,
                  ),
            targetSystem: new TargetSystem(
              TargetSystem.__construct__[pref.targetSystem ?? 0],
              pref.targetSystem ?? 0,
            ),
            targetType:
              pref.targetType == 0 || pref.targetType == null
                ? TargetType.DEFAULT
                : TargetType.SPECIFIC_CLASS(pref.targetType),
          },
        },
        group,
      ),
      gfx: environment.assetsUrl + 'assets/swf/mini.swf',
    };

    // Obfuscate the data
    const obfuscatedData = objectObfuscator(data);

    // Serialize the data
    const serialized = Serializer.serialize(obfuscatedData);

    // URI encode the serialized data
    return 'data=' + encodeURIComponent(serialized);
  }

  private embededUrlArmy(
    group: number,
    troopers: Trooper[],
    ymax: number,
    col: number,
  ) {
    const isOpponent = col == 4;

    const data = {
      mode: ClientMode.BLOCKS({
        army: troopers.map((trooper, index) => ({
          name: trooper.name,
          seed: trooper.seed,
          type: TrooperType.HUMAN,
          id: index,
          choices: trooper.choices ?? [],
          force: [],
          pref: {
            moveSystem:
              trooper.moveSystem == null
                ? null
                : new MoveSystem(
                    MoveSystem.__construct__[trooper.moveSystem],
                    trooper.moveSystem,
                  ),
            reloadSystem: ReloadSystem.DEFAULT,
            leftOver: getLeftOver(trooper)?.map(
              (skillId) =>
                new SkillEnum(SkillEnum.__construct__[skillId], skillId),
            ),
            __CBody:
              trooper.CBody == null
                ? null
                : new BodyLoc(
                    BodyLoc.__construct__[trooper.CBody ?? 0],
                    trooper.CBody ?? 0,
                  ),
            __CWeapon:
              trooper.CWeapon == null
                ? null
                : new WeaponEnum(
                    WeaponEnum.__construct__[trooper.CWeapon],
                    trooper.CWeapon,
                  ),
            targetSystem: new TargetSystem(
              TargetSystem.__construct__[trooper.targetSystem ?? 0],
              trooper.targetSystem ?? 0,
            ),
            targetType:
              trooper.targetType == 0 || trooper.targetType == null
                ? TargetType.DEFAULT
                : TargetType.SPECIFIC_CLASS(trooper.targetType),
          },
        })),
        action: isOpponent ? null : 'on',
        add: isOpponent ? false : true,
        fac: group,
        space: -1,
        xmax: col,
        ymax,
      }),
      gfx: environment.assetsUrl + 'assets/swf/mini.swf',
    };

    // Obfuscate the data
    const obfuscatedData = objectObfuscator(data);

    // Serialize the data
    const serialized = Serializer.serialize(obfuscatedData);

    // URI encode the serialized data
    return 'data=' + encodeURIComponent(serialized);
  }
}
