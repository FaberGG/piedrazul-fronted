import { Routes } from '@angular/router';

import { roleGuard } from '../../core/guards/role.guard';
import { ROLES } from '../../shared/constants/roles';
import { ConfiguracionGlobalPageComponent } from './pages/configuracion-global-page/configuracion-global-page.component';
import { ConfiguracionMedicoPageComponent } from './pages/configuracion-medico-page/configuracion-medico-page.component';

export const configuracionRoutes: Routes = [
  {
    path: '',
    component: ConfiguracionMedicoPageComponent,
    canActivate: [roleGuard],
    data: { roles: [ROLES.ADMIN] }
  },
  {
    path: 'global',
    component: ConfiguracionGlobalPageComponent,
    canActivate: [roleGuard],
    data: { roles: [ROLES.ADMIN] }
  }
];

