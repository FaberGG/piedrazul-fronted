import { Routes } from '@angular/router';

import { roleGuard } from '../../core/guards/role.guard';
import { ROLES } from '../../shared/constants/roles';
import { ConfiguracionGlobalPageComponent } from './pages/configuracion-global-page/configuracion-global-page.component';
import { ConfiguracionMedicoPageComponent } from './pages/configuracion-medico-page/configuracion-medico-page.component';

export const configuracionRoutes: Routes = [
{
    path: '',
    pathMatch: 'full',
    redirectTo: 'medicos'
  },
  {
    path: 'medicos',
    component: ConfiguracionMedicoPageComponent,
    canActivate: [roleGuard],
    data: {
      roles: [ROLES.ADMIN],
      sectionTitle: 'Configuracion de medicos',
      sectionDescription: 'Ajusta parametros de atencion y horarios por medico.'
    }
  },
  {
    path: 'global',
    component: ConfiguracionGlobalPageComponent,
    canActivate: [roleGuard],
    data: {
      roles: [ROLES.ADMIN],
      sectionTitle: 'Configuracion global',
      sectionDescription: 'Administra reglas generales del sistema de agendamiento.'
    }
  }
];

