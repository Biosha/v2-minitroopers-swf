import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthStore } from '../stores/auth.store';

export const adminGuard: CanActivateFn = () => {
  if (!environment.enableAdminRoute) {
    return inject(Router).parseUrl('/');
  }

  const authStore = inject(AuthStore);
  if (authStore.isAdmin()) {
    return true;
  }

  if (authStore.armyName()) {
    return inject(Router).parseUrl('/' + authStore.armyName());
  }

  return inject(Router).parseUrl('/');
};
