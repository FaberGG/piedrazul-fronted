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
      label: 'Ver Agenda',
      path: '/agenda/listar',
      iconClass: 'fa-solid fa-list-check',
      allowedRoles: [ROLES.ADMIN, ROLES.AGENDADOR, ROLES.MEDICO]
    },
    {
      label: 'Nueva Cita',
      path: '/agenda/nueva-cita',
      iconClass: 'fa-solid fa-circle-plus',
      allowedRoles: [ROLES.ADMIN, ROLES.AGENDADOR, ROLES.MEDICO] // Quizá el médico solo deba ver, no agendar? Depende de tu regla de negocio
    },
     {
      label: 'Configuracion global medicos',
      path: '/configuracion/medicos',
      iconClass: 'fa-solid fa-user-doctor',
      allowedRoles: [ROLES.ADMIN, ROLES.AGENDADOR, ROLES.MEDICO] // Quizá el médico solo deba ver, no agendar? Depende de tu regla de negocio
    },
  
      {
      label: 'Registrar administrador',
      path: '/admin/registrar',
      iconClass: 'fa-solid fa-user-tie',
      allowedRoles: [ROLES.ADMIN, ROLES.AGENDADOR, ROLES.MEDICO] // Quizá el médico solo deba ver, no agendar? Depende de tu regla de negocio
    },

    {
      label: 'Registrar medico',
      path: '/medico/registrar',
      iconClass: 'fa-solid fa-user-doctor',
      allowedRoles: [ROLES.ADMIN, ROLES.AGENDADOR, ROLES.MEDICO] // Quizá el médico solo deba ver, no agendar? Depende de tu regla de negocio
    },

  ];

  readonly utilityItems = [
    /*
    {
      label: 'Configuración', // Centralizamos aquí la configuración de Admin
      iconClass: 'fa-solid fa-gear',
      path: '/admin/configuracion' // RUTA CORREGIDA
    },
    */
    {
      label: 'Ayuda y soporte',
      iconClass: 'fa-solid fa-circle-info',
      path: '/soporte'
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

