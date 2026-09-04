import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserExtended } from '@minitroopers/shared';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { AuthService } from '../services/auth.service';

interface AuthState {
  armyName: string | null;
  hasTroopers: boolean;
  referralGold: number;
  loading: boolean;
  error: string | null;
  isUserLoggedIn: boolean;
  admin: boolean;
}

const initialState: AuthState = {
  armyName: null,
  hasTroopers: false,
  referralGold: 0,
  loading: false,
  error: null,
  isUserLoggedIn: false,
  admin: false,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    isAuthenticated: computed(() => !!store.armyName()),
    isAdmin: computed(() => store.admin()),
  })),
  withMethods(
    (store, authService = inject(AuthService), router = inject(Router)) => ({
      async login(redirect = false) {
        patchState(store, () => ({ loading: true, error: null }));
        try {
          const user = await authService.signIn();
          if (user) {
            patchState(store, () => ({
              armyName: user.armyName,
              hasTroopers: !!user.troopers?.length,
              referralGold: user.referralGold,
              loading: false,
              isUserLoggedIn: true,
              admin: !!user.admin,
            }));

            if (redirect && user.troopers?.length) {
              router.navigate(['/' + user.armyName]);
            }
          } else {
            patchState(store, () => ({
              error: 'Login failed',
              loading: false,
              isUserLoggedIn: false,
            }));
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          patchState(store, () => ({
            error: 'Login failed',
            loading: false,
            isUserLoggedIn: false,
          }));
        }
      },
      setUser(user: UserExtended) {
        patchState(store, () => ({
          armyName: user.armyName,
          hasTroopers: !!user.troopers?.length,
          referralGold: user.referralGold,
          loading: false,
          error: null,
          isUserLoggedIn: true,
          admin: !!user.admin,
        }));
      },
      logout() {
        patchState(store, () => ({ ...initialState }));
        authService.disconnect();
      },
    }),
  ),
);
