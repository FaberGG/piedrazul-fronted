import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { TokenService } from '../auth/token.service';

const PUBLIC_ROUTES = ['/auth/login', '/auth/register'];

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const isPublic = PUBLIC_ROUTES.some((route) => req.url.includes(route));
  if (isPublic) {
    return next(req);
  }

  const tokenService = inject(TokenService);
  const token = tokenService.getToken();

  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  );
};

