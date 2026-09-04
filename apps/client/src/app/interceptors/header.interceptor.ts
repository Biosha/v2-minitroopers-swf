import { HttpInterceptorFn } from '@angular/common/http';

export const headerInterceptor: HttpInterceptorFn = (request, next) => {
  const userId = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  const expires = localStorage.getItem('expires');

  if (userId && token && expires && Number(expires) > Date.now()) {
    return next(
      request.clone({
        setHeaders: {
          Authorization: `Basic ${btoa(`${userId}:${token}`)}`,
        },
      }),
    );
  }

  return next(request);
};
