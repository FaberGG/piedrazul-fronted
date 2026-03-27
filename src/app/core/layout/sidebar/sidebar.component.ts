import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../auth/auth.service';
import { ROLES } from '../../../shared/constants/roles';

interface MenuItem {
  label: string;
  path: string;
  iconClass: string;
  allowedRoles: string[];
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);

  private readonly items: MenuItem[] = [
    {
      label: 'Agendar cita',
      path: '/agenda',
      iconClass: 'fa-regular fa-calendar-plus',
      allowedRoles: [ROLES.ADMIN, ROLES.AGENDADOR, ROLES.MEDICO]
    },
    {
      label: 'Configuracion',
      path: '/configuracion',
      iconClass: 'fa-solid fa-sliders',
      allowedRoles: [ROLES.ADMIN]
    }
  ];

  readonly utilityItems = [
    {
    label: 'Ajustes',
    iconClass: 'fa-solid fa-gear',
    path: '/admin/configuracion'
  },
  {
    label: 'Ayuda y soporte',
    iconClass: 'fa-solid fa-circle-question',
    path: '/soporte' // o la ruta que quieras
  }
  ];

  readonly visibleItems = computed(() => {
    const role = this.authService.getCurrentRole();
    if (!role) {
      return [] as MenuItem[];
    }

    return this.items.filter((item) => item.allowedRoles.includes(role));
  });


  logout(): void {
    this.authService.logout();
  }
}

