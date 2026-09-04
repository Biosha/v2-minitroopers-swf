import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { MissionType } from '@minitroopers/shared';
import {
  FightDetail,
  PartialUserExtended,
  UserExtended,
} from '@minitroopers/shared';
import { map, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ArmyStore } from '../stores/army.store';

@Injectable({
  providedIn: 'root',
})
export class FightService {
  private http = inject(HttpClient);
  private armyStore = inject(ArmyStore);

  getOpponents() {
    return this.http
      .get<{
        opponents: PartialUserExtended[];
      }>(environment.apiUrl + '/api/fight/getOpponents')
      .pipe(
        map((response) =>
          response?.opponents?.length ? response.opponents : [],
        ),
      );
  }

  getTroopersRaid() {
    return this.http
      .get<{
        troopers: string[];
        level: number;
      }>(environment.apiUrl + '/api/fight/getTroopersRaid')
      .pipe(
        map((response) => {
          return {
            troopers: response?.troopers?.length ? response.troopers : [],
            level: response?.level,
          };
        }),
      );
  }

  createFight(opponentName: string) {
    return this.http
      .post<{ user: UserExtended; fightId: string }>(
        environment.apiUrl + '/api/fight/createFight',
        {
          opponentName: opponentName,
        },
      )
      .pipe(
        tap((response) => {
          if (response?.user) {
            this.armyStore.updateArmy(response.user);
          }
        }),
      );
  }

  createMission(type: MissionType) {
    return this.http
      .post<{ user: UserExtended; fightId: string }>(
        environment.apiUrl + '/api/mission/createMission',
        {
          missionType: type,
        },
      )
      .pipe(
        tap((response) => {
          if (response?.user) {
            this.armyStore.updateArmy(response.user);
          }
        }),
      );
  }

  createRaid() {
    return this.http
      .post<{
        user: UserExtended;
        raidId: string;
        swfData: string;
      }>(environment.apiUrl + '/api/raid/createRaid', {})
      .pipe(
        tap((response) => {
          if (response?.user) {
            this.armyStore.updateArmy(response.user);
          }
        }),
      );
  }

  getFightDetails(fightId: string) {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('fightId', fightId);

    return this.http.get<FightDetail>(
      environment.apiUrl + '/api/fight/getFight',
      {
        params: queryParams,
      },
    );
  }

  getMissionDetails(fightId: string) {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('missionId', fightId);

    return this.http.get<FightDetail>(
      environment.apiUrl + '/api/mission/getMission',
      {
        params: queryParams,
      },
    );
  }

  renderFight(container: HTMLElement, data: string) {
    container.innerHTML = '';

    const ruffle = (window as any).RufflePlayer.newest();
    const player = ruffle.createPlayer();

    player.style.width = 720 + 'px';
    player.style.height = 440 + 'px';

    player.config = {
      allowScriptAccess: true,
      scale: 'noscale',
      wmode: 'transparent',
    };

    container.appendChild(player);

    player.load({
      url: '/assets/swf/client_fr_edit.swf',
      parameters: data,
    });
  }
}
