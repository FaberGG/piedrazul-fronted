import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { AuthService } from '../auth/auth.service';
import { Role } from '../../shared/constants/roles';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = (route.data?.['roles'] as Role[] | undefined) ?? [];
  if (allowedRoles.length === 0) {
    return true;
  }

  const currentRole = authService.getCurrentRole();
  if (currentRole && allowedRoles.includes(currentRole)) {
    return true;
  }

  const fallback = authService.getHomeRouteForRole(currentRole);
  return router.createUrlTree([fallback]);
};

