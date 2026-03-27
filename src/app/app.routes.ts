import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { PatientShellComponent } from './core/layout/patient-shell/patient-shell.component';
import { ShellComponent } from './core/layout/shell/shell.component';
import { ROLES } from './shared/constants/roles';
import { LoginPageComponent } from './features/auth/pages/login-page/login-page.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginPageComponent,
    canActivate: [noAuthGuard]
  },
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
        loadChildren: () => import('./features/agenda/agenda.routes').then((m) => m.agendaStaffRoutes)
      },
      {
        path: 'configuracion',
        canActivate: [roleGuard],
        data: { roles: [ROLES.ADMIN] },
        loadChildren: () =>
          import('./features/configuracion/configuracion.routes').then((m) => m.configuracionRoutes)
      }
    ]
  },
  {
    path: 'paciente',
    component: PatientShellComponent,
    //canActivate: [authGuard, roleGuard],
    //data: { roles: [ROLES.PACIENTE] },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'agendar'
      },
      {
        path: 'agendar',
        loadChildren: () => import('./features/agenda/agenda.routes').then((m) => m.agendaPatientRoutes)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
