import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MissionType, TrooperDay } from '@minitroopers/shared';
import {
  PartialUserExtended,
  UserExtended,
  UserRanking,
  checkNameValide,
  statusAvailability,
} from '@minitroopers/shared';
import { Observable, catchError, map, of, take, tap, timeout } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  private http = inject(HttpClient);
  private router = inject(Router);

  isServerUp = false;

  checkServerUp() {
    return this.http.get<boolean>(environment.apiUrl + '/api/is-ready').pipe(
      timeout(8000),
      catchError(() => {
        return of(false);
      }),
      tap((res) => {
        this.isServerUp = res;
      }),
    );
  }

  checkAvailability(armyName: string) {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('name', armyName);
    return this.http
      .get<{ status: statusAvailability }>(
        environment.apiUrl + '/api/util/checkNameAvailability',
        {
          params: queryParams,
        },
      )
      .pipe(
        map((res: { status: statusAvailability }) => res.status),
        catchError(() => of('error' as statusAvailability)),
      );
  }

  checkArmyExist(armyName: string) {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('name', armyName);
    return this.http
      .get<{ status: boolean }>(
        environment.apiUrl + '/api/util/checkArmyExist',
        {
          params: queryParams,
        },
      )
      .pipe(
        map((res: { status: boolean }) => res.status),
        catchError(() => of(false)),
      );
  }

  getTodayTroopers(): Observable<TrooperDay[]> {
    return this.http.get<TrooperDay[]>(
      environment.apiUrl + '/api/util/getTodayTroopers',
      {},
    );
  }

  createUser(formgroup: {
    army: string;
    prefix: number;
    color: number;
    trooper: string;
    userId: string;
  }): Observable<UserExtended> {
    return this.http.post<UserExtended>(
      environment.apiUrl + '/api/user/create',
      {
        ...formgroup,
      },
    );
  }

  getArmy(armyName: string, full = false) {
    if (!checkNameValide(armyName)) {
      this.router.navigate(['/']);
    }

    let queryParams = new HttpParams();
    queryParams = queryParams.append('army', armyName);
    queryParams = queryParams.append('full', full);

    return this.http
      .get<PartialUserExtended>(environment.apiUrl + '/api/user/get', {
        params: queryParams,
      })
      .pipe(take(1));
  }

  getRanking(armyName: string | null = null) {
    let queryParams = new HttpParams();
    if (armyName) {
      queryParams = queryParams.append('name', armyName);
    }

    return this.http
      .get<UserRanking[]>(environment.apiUrl + '/api/util/getRanking', {
        params: queryParams,
      })
      .pipe(take(1));
  }

  unlockMission(missionType: MissionType) {
    return this.http.post<UserExtended>(
      environment.apiUrl + '/api/user/unlockMission',
      {
        missionType: missionType,
      },
    );
  }
}
