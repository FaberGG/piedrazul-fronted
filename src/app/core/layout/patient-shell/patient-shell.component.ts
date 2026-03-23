import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-patient-shell',
  imports: [RouterOutlet],
  template: `
    <div class="patient-shell">
      <header class="patient-shell__header">Piedrazul - Portal Paciente</header>
      <main class="patient-shell__content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      .patient-shell {
        min-height: 100vh;
        display: grid;
        grid-template-rows: auto 1fr;
      }

      .patient-shell__header {
        border-bottom: 1px solid #e5e7eb;
        padding: 0.75rem 1rem;
        font-weight: 600;
      }

      .patient-shell__content {
        max-width: 960px;
        width: 100%;
        margin: 0 auto;
        padding: 1rem;
      }
    `
  ]
})
export class PatientShellComponent {}

