import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { PatientShellComponent } from './core/layout/patient-shell/patient-shell.component';
import { ShellComponent } from './core/layout/shell/shell.component';
import { ROLES } from './shared/constants/roles';
import { LoginPageComponent } from './features/auth/pages/login-page/login-page.component';
import { RegisterPageComponent } from './features/auth/pages/register-page/register-page.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginPageComponent,
    canActivate: [noAuthGuard]
  },
  {
    path: 'register',
    component: RegisterPageComponent,
    canActivate: [noAuthGuard]
  },

  // 1. Ruta Principal (Staff: Médicos y Agendadores)
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'agenda'
      },
      {
        path: 'agenda',
        loadChildren: () =>
          import('./features/agenda/agenda.routes').then((m) => m.agendaStaffRoutes)
      },
          {
        path: 'configuracion',
        loadChildren: () =>
          import('./features/configuracion/configuracion.routes').then((m) => m.configuracionRoutes)
      },
      {
        path: 'medico/registrar',
        loadComponent: () =>
          import('./features/auth/pages/register-medico-page/register-medico-page.component')
            .then(m => m.RegistrarMedicoPageComponent)
      },
      {
        path: 'admin/registrar',
        loadComponent: () =>
          import('./features/auth/pages/register-admin-page/register-admin-page.component')
            .then(m => m.RegisterAdminPageComponent)
      }
    ]
  },

  // 2. Ruta de Paciente
  {
    path: 'paciente',
    component: PatientShellComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [ROLES.PACIENTE] },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'agendar'
      },
      {
        path: 'agendar',
        loadChildren: () =>
          import('./features/agenda/agenda.routes').then((m) => m.agendaPatientRoutes)
      }
    ]
  },

  // Fallback
  {
    path: '**',
    redirectTo: '/login'
  }
];
