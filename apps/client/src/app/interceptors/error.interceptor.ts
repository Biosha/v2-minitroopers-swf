import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { AuthStore } from '../stores/auth.store';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const notificationService = inject(NotificationService);
  const authStore = inject(AuthStore);

  return next(request).pipe(
    tap((event) => {
      if (
        event &&
        typeof event === 'object' &&
        'body' in event &&
        event.body &&
        typeof event.body === 'object' &&
        'status' in event.body &&
        (event.body as { status: string }).status === 'error'
      ) {
        const body = event.body as { reason?: string };
        notificationService.notify(
          'error',
          'error',
          body.reason ?? 'Request failed',
        );
      }
    }),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authStore.logout();
        notificationService.notify('error', 'Session expired');
      } else if (error.status >= 400) {
        const reason =
          (error.error as { reason?: string })?.reason ??
          error.message ??
          'Request failed';
        notificationService.notify('error', reason);
      }
      return throwError(() => error);
    }),
  );
};
