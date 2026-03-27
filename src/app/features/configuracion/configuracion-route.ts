import { Routes } from '@angular/router';
import { ConfiguracionGlobalPageComponent } from './pages/configuracion-global-page/configuracion-global-page.component';
import { ConfiguracionMedicoPageComponent } from './pages/configuracion-medico-page/configuracion-medico-page.component';

export const configuracionRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'global'
  },
  {
    path: 'global',
    component: ConfiguracionGlobalPageComponent
  },
  {
    path: 'medico',
    component: ConfiguracionMedicoPageComponent
  }
];