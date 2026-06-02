import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-patient-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './patient-shell.component.html',
  styleUrl: './patient-shell.component.css'
})
export class PatientShellComponent {
  readonly authService = inject(AuthService);
}