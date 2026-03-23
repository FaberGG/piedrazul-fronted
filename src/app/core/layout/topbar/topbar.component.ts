import { Component, inject } from '@angular/core';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {
  readonly authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}

