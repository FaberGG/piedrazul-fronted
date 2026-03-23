import { Component, inject } from '@angular/core';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-topbar',
  template: `
    <header class="topbar">
      <div>
        <strong>{{ authService.currentUser()?.nombreCompleto || 'Usuario' }}</strong>
        <span class="topbar__role">{{ authService.currentUser()?.rol || '' }}</span>
      </div>
      <button type="button" (click)="logout()">Cerrar sesion</button>
    </header>
  `,
  styles: [
    `
      .topbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .topbar__role {
        margin-left: 0.5rem;
        color: #6b7280;
      }
    `
  ]
})
export class TopbarComponent {
  readonly authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}

