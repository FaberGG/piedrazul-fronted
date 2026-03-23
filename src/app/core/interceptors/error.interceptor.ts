import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../auth/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          authService.logout();
        }

        if (error.status === 403) {
          console.warn('Acceso denegado para el recurso solicitado.');
          void router.navigateByUrl('/');
        }

        if (error.status === 0) {
          console.error('No se pudo conectar con el backend.');
        }
      }

      return throwError(() => error);
    })
  );
};

