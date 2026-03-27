import { Routes } from '@angular/router';

import { roleGuard } from '../../core/guards/role.guard';
import { ROLES } from '../../shared/constants/roles';
import { AgendarAutonomoPageComponent } from './pages/agendar-autonomo-page/agendar-autonomo-page.component';
import { ListaCitasPageComponent } from './pages/lista-citas-page/lista-citas-page.component';

export const agendaStaffRoutes: Routes = [
  {
    path: '',
    component: ListaCitasPageComponent,
    canActivate: [roleGuard],
    data: {
      roles: [ROLES.ADMIN, ROLES.AGENDADOR, ROLES.MEDICO],
      sectionTitle: 'Agenda medica',
      sectionDescription: 'Administra las citas por medico, fecha y disponibilidad.'
    }
  }
];

export const agendaPatientRoutes: Routes = [
  {
    path: '',
    component: AgendarAutonomoPageComponent,
    //canActivate: [roleGuard],
    data: {
      roles: [ROLES.PACIENTE],
      sectionTitle: 'Agendamiento autonomo',
      sectionDescription: 'Programa tu cita en linea segun la disponibilidad de especialistas.'
    }
  }
];

