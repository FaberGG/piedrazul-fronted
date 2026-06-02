import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitaResponse } from '../../../agenda/models/agenda.models';
import { EstadoCita, ESTADO_CITA_LABELS } from '../../../agenda/models/estado-cita.enum';
import { TipoCita, TIPO_CITA_LABELS } from '../../../agenda/models/tipo-cita.enum';
import { PacientePortalService } from '../../services/paciente-portal.service';

@Component({
  selector: 'app-mis-citas-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-citas-page.component.html',
  styleUrl: './mis-citas-page.component.css'
})
export class MisCitasPageComponent implements OnInit {
  private readonly portalService = inject(PacientePortalService);

  citas = signal<CitaResponse[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  readonly EstadoCita = EstadoCita;
  readonly ESTADO_CITA_LABELS = ESTADO_CITA_LABELS;
  readonly TIPO_CITA_LABELS = TIPO_CITA_LABELS;

  readonly citaPendiente = computed(() => {
    const hoy = new Date().toISOString().split('T')[0];
    return this.citas().find(
      c => c.estado === EstadoCita.PROGRAMADA && c.fecha >= hoy
    ) ?? null;
  });

  readonly historial = computed(() => {
    const pendiente = this.citaPendiente();
    return this.citas().filter(c => c !== pendiente);
  });

  ngOnInit(): void {
    this.portalService.getMisCitas().subscribe({
      next: (data) => {
        this.citas.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el historial de citas.');
        this.cargando.set(false);
      }
    });
  }

  estadoLabel(estado: string): string {
    return ESTADO_CITA_LABELS[estado as EstadoCita] ?? estado;
  }

  tipoLabel(tipo: string | undefined): string {
    if (!tipo) return '';
    return TIPO_CITA_LABELS[tipo as TipoCita] ?? tipo;
  }
}
