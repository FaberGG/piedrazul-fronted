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
  template: `
    <aside class="sidebar">
      <h2 class="sidebar__title">Piedrazul</h2>
      <nav class="sidebar__nav">
        @for (item of visibleItems(); track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="sidebar__link--active"
            class="sidebar__link"
          >
            {{ item.label }}
          </a>
        }
      </nav>
    </aside>
  `,
  styles: [
    `
      .sidebar {
        padding: 1rem;
      }

      .sidebar__title {
        margin: 0 0 1rem;
        font-size: 1.1rem;
      }

      .sidebar__nav {
        display: grid;
        gap: 0.5rem;
      }

      .sidebar__link {
        color: #111827;
        text-decoration: none;
        padding: 0.4rem 0.5rem;
        border-radius: 0.375rem;
      }

      .sidebar__link--active {
        background: #e5e7eb;
      }
    `
  ]
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

