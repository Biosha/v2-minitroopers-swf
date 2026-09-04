import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { checkNameValide } from '@minitroopers/shared';
import { map, take } from 'rxjs';
import { BackendService } from '../services/backend.service';
import { ArmyStore } from '../stores/army.store';
import { AuthStore } from '../stores/auth.store';

export const armyExistGuard: CanActivateFn = (route, state) => {
  const backendService = inject(BackendService);
  const router = inject(Router);
  const authStore = inject(AuthStore);
  const armyStore = inject(ArmyStore);

  if (route.params['army']) {
    if (
      route.params['army'] == authStore.armyName() ||
      route.params['army'] == armyStore.currentArmyName()
    ) {
      return true;
    }

    if (!checkNameValide(route.params['army'])) {
      return router.parseUrl('/');
    }

    return backendService.checkArmyExist(route.params['army']).pipe(
      take(1),
      map((status) => {
        if (status) {
          return true;
        }
        return router.parseUrl('/');
      }),
    );
  } else {
    return router.parseUrl('/');
  }
};
