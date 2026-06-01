import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';
import { ROLES } from '../../shared/constants/roles';
import { AuditoriaPageComponent } from './pages/auditoria-page/auditoria-page.component';

export const auditoriaRoutes: Routes = [
  {
    path: '',
    component: AuditoriaPageComponent,
    canActivate: [roleGuard],
    data: {
      roles: [ROLES.ADMIN],
      sectionTitle: 'Auditoría',
      sectionDescription: 'Historial de operaciones críticas registradas en el sistema.'
    }
  }
];
