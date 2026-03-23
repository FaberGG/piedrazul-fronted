import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../auth/auth.service';
import { ROLES } from '../../../shared/constants/roles';

interface MenuItem {
  label: string;
  path: string;
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
      label: 'Agenda',
      path: '/agenda',
      allowedRoles: [ROLES.ADMIN, ROLES.AGENDADOR, ROLES.MEDICO]
    },
    {
      label: 'Configuracion',
      path: '/configuracion',
      allowedRoles: [ROLES.ADMIN]
    }
  ];

  readonly visibleItems = computed(() => {
    const role = this.authService.getCurrentRole();
    if (!role) {
      return [] as MenuItem[];
    }

    return this.items.filter((item) => item.allowedRoles.includes(role));
  });
}

