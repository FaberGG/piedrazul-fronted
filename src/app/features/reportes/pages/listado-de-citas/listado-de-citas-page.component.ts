import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MedicosAgendaService } from '../../../agenda/services/medicos-agenda.service';
import { MedicosService } from '../../../agenda/services/medicos.service';
import { MedicoAgenda } from '../../../agenda/models/medico-agenda.model';
import { ReporteService } from '../../services/report.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ROLES } from '../../../../shared/constants/roles';

@Component({
  selector: 'app-listado-de-citas-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listado-de-citas-page.component.html',
  styleUrl: './listado-de-citas-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListadoDeCitasPageComponent implements OnInit {
  private readonly medicosService = inject(MedicosAgendaService);
  private readonly medicosServiceMe = inject(MedicosService);
  private readonly reporteService = inject(ReporteService);
  private readonly authService = inject(AuthService);

  readonly hoy = new Date().toISOString().split('T')[0];

  // Shared doctor selector (for "por fecha" section only)
  readonly medicos = signal<MedicoAgenda[]>([]);
  readonly medicoIdSeleccionado = signal<number | null>(null);
  readonly cargandoMedicos = signal(false);

  // "Por fecha" section
  readonly fechaSeleccionada = signal(this.hoy);
  readonly formatoSeleccionado = signal('PDF');
  readonly formatos = ['PDF', 'CSV'];
  readonly descargando = signal(false);

  // "Agenda de hoy" section — all doctors, no medicoId
  readonly descargandoHoy = signal(false);

  readonly error = signal('');

  ngOnInit(): void {
    this.cargandoMedicos.set(true);
    this.medicosService.obtenerMedicos().subscribe({
      next: (lista) => {
        const activos = lista.filter(m => m.activo);
        this.medicos.set(activos);
        this.cargandoMedicos.set(false);
        this.autoSeleccionarMedicoActual(activos.length > 0 ? activos[0].id : null);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de médicos.');
        this.cargandoMedicos.set(false);
      }
    });
  }

  private autoSeleccionarMedicoActual(fallbackId: number | null): void {
    const role = this.authService.getCurrentRole();
    if (role === ROLES.MEDICO || role === ROLES.TERAPISTA) {
      this.medicosServiceMe.getMedicoActual().subscribe({
        next: (m) => this.medicoIdSeleccionado.set(m.id),
        error: () => { if (fallbackId) this.medicoIdSeleccionado.set(fallbackId); }
      });
    } else if (fallbackId) {
      this.medicoIdSeleccionado.set(fallbackId);
    }
  }

  descargarHoy(): void {
    this.descargandoHoy.set(true);
    this.error.set('');
    this.reporteService.exportarAgendaDiaCompleta(this.hoy).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `agenda-completa-${this.hoy}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.descargandoHoy.set(false);
      },
      error: () => {
        this.error.set('Error al descargar la agenda de hoy.');
        this.descargandoHoy.set(false);
      }
    });
  }

  descargar(): void {
    const medicoId = this.medicoIdSeleccionado();
    const fecha = this.fechaSeleccionada();
    const formato = this.formatoSeleccionado();

    if (!medicoId || !fecha) {
      this.error.set('Selecciona un médico y una fecha.');
      return;
    }

    this.descargando.set(true);
    this.error.set('');

    this.reporteService.exportarAgendaDiaria(medicoId, fecha, formato).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `agenda_${fecha}_medico_${medicoId}.${formato.toLowerCase()}`;
        a.click();
        URL.revokeObjectURL(url);
        this.descargando.set(false);
      },
      error: () => {
        this.error.set('Error al descargar el archivo. Intenta de nuevo.');
        this.descargando.set(false);
      }
    });
  }

  onMedicoChange(valor: string): void {
    this.medicoIdSeleccionado.set(valor ? Number(valor) : null);
  }
}
