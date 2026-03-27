import { Routes } from '@angular/router';

import { roleGuard } from '../../core/guards/role.guard';
import { ROLES } from '../../shared/constants/roles';
import { AgendarAutonomoPageComponent } from './pages/agendar-autonomo-page/agendar-autonomo-page.component';
import { ListaCitasPageComponent } from './pages/lista-citas-page/lista-citas-page.component';
import { NuevaCitaPageComponent } from './pages/nueva-cita-page/nueva-cita-page.component'; // Importar de Right

export const agendaStaffRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'listar' // Decisión de UX: La lista suele ser la vista principal
  },
  {
    path: 'listar',
    component: ListaCitasPageComponent,
    canActivate: [roleGuard],
    data: {
      roles: [ROLES.ADMIN, ROLES.AGENDADOR, ROLES.MEDICO],
      sectionTitle: 'Agenda Médica',
      sectionDescription: 'Administra las citas por médico, fecha y disponibilidad.'
    }
  },
  {
    path: 'nueva-cita',
    component: NuevaCitaPageComponent,
    canActivate: [roleGuard],
    data: {
      roles: [ROLES.ADMIN, ROLES.AGENDADOR, ROLES.MEDICO],
      sectionTitle: 'Agendar Cita',
      sectionDescription: 'Registra una nueva cita con datos del paciente y horario disponible.'
    }
  }
];

export const agendaPatientRoutes: Routes = [
  {
    path: '',
    component: AgendarAutonomoPageComponent,
    canActivate: [roleGuard],
    data: {
      roles: [ROLES.PACIENTE],
      sectionTitle: 'Agendamiento Autónomo',
      sectionDescription: 'Programa tu cita en línea según la disponibilidad de especialistas.'
    }
  }
];
