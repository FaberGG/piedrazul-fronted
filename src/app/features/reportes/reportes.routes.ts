import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';
import { ROLES } from '../../shared/constants/roles';

export const reportesRoutes: Routes = [
  {
    path: 'historial-paciente',
    loadComponent: () =>
      import('./pages/historial-paciente/historial-paciente-page.component')
        .then(m => m.HistorialPacientePageComponent),
    canActivate: [roleGuard],
    data: {
      roles: [ROLES.ADMIN, ROLES.MEDICO, ROLES.TERAPISTA],
      sectionTitle: 'Historial de Paciente'
    }
  },
  {
    path: 'listado-de-citas',
    loadComponent: () =>
      import('./pages/listado-de-citas/listado-de-citas-page.component')
        .then(m => m.ListadoDeCitasPageComponent),
    canActivate: [roleGuard],
    data: {
      roles: [ROLES.ADMIN, ROLES.MEDICO, ROLES.AGENDADOR, ROLES.TERAPISTA],
      sectionTitle: 'Exportar Agenda Diaria'
    }
  }
];
