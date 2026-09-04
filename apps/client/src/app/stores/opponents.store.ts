import { inject } from '@angular/core';
import { PartialUserExtended } from '@minitroopers/shared';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { FightService } from '../services/fight.service';
import { AuthStore } from './auth.store';

interface OpponentsState {
  opponents: PartialUserExtended[];
  loading: boolean;
  error: string | null;
}

const initialState: OpponentsState = {
  opponents: [],
  loading: false,
  error: null,
};

export const OpponentsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store,
      fightService = inject(FightService),
      authStore = inject(AuthStore),
    ) => ({
      async loadOpponents() {
        if (store.loading()) {
          return;
        }
        patchState(store, (state) => ({ loading: true, error: null }));
        try {
          if (authStore.isAuthenticated()) {
            const opponents = await firstValueFrom(fightService.getOpponents());
            if (opponents) {
              patchState(store, (state) => ({
                opponents: opponents.sort(
                  (a, b) => a.troopers.length - b.troopers.length,
                ),
                loading: false,
                error: null,
              }));
            }
          } else {
            patchState(store, (state) => ({
              error: 'not logged',
              loading: false,
            }));
          }
        } catch (err) {
          patchState(store, (state) => ({
            error: 'get opponents failed',
            loading: false,
          }));
        }
      },
    }),
  ),
);
