import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-patient-shell',
  imports: [RouterOutlet],
  templateUrl: './patient-shell.component.html',
  styleUrl: './patient-shell.component.css'
})
export class PatientShellComponent {
  private readonly authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}