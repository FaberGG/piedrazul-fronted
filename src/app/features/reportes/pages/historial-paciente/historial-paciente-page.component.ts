import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';

import { PacientesAgendaService } from '../../../agenda/services/pacientes-agenda.service';
import { PacienteBusqueda } from '../../../agenda/models/paciente-busqueda.model';
import { EstadoCita, ESTADO_CITA_LABELS } from '../../../agenda/models/estado-cita.enum';
import { TipoCita, TIPO_CITA_LABELS } from '../../../agenda/models/tipo-cita.enum';
import { ReporteService, HistorialPaciente } from '../../services/report.service';
import { DownloadService } from '../../../../shared/services/download.service';

@Component({
  selector: 'app-historial-paciente-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-paciente-page.component.html',
  styleUrl: './historial-paciente-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistorialPacientePageComponent {
  private readonly pacientesService = inject(PacientesAgendaService);
  private readonly reporteService = inject(ReporteService);
  private readonly downloadService = inject(DownloadService);

  readonly EstadoCita = EstadoCita;

  readonly busquedaInput = signal('');
  readonly sugerencias = signal<PacienteBusqueda[]>([]);
  readonly mostrarSugerencias = signal(false);
  readonly buscando = signal(false);

  readonly pacienteSeleccionado = signal<PacienteBusqueda | null>(null);
  readonly historial = signal<HistorialPaciente | null>(null);
  readonly cargandoHistorial = signal(false);
  readonly descargando = signal(false);
  readonly errorHistorial = signal('');

  private readonly busqueda$ = new Subject<string>();

  constructor() {
    this.busqueda$.pipe(
      debounceTime(220),
      distinctUntilChanged(),
      switchMap(texto => {
        if (texto.length < 2) {
          this.sugerencias.set([]);
          this.mostrarSugerencias.set(false);
          this.buscando.set(false);
          return [];
        }
        this.buscando.set(true);
        return this.pacientesService.buscarPorDocumento(texto, 8);
      })
    ).subscribe({
      next: (resultados) => {
        this.sugerencias.set(resultados);
        this.mostrarSugerencias.set(resultados.length > 0);
        this.buscando.set(false);
      },
      error: () => {
        this.sugerencias.set([]);
        this.buscando.set(false);
      }
    });
  }

  onInputChange(valor: string): void {
    this.busquedaInput.set(valor);
    if (!valor) {
      this.limpiar();
      return;
    }
    this.busqueda$.next(valor);
  }

  seleccionar(paciente: PacienteBusqueda): void {
    this.pacienteSeleccionado.set(paciente);
    this.busquedaInput.set(paciente.documento + ' — ' + paciente.nombresCompletos);
    this.mostrarSugerencias.set(false);
    this.sugerencias.set([]);
    this.cargarHistorial(paciente.id);
  }

  cargarHistorial(pacienteId: number): void {
    this.cargandoHistorial.set(true);
    this.errorHistorial.set('');
    this.historial.set(null);

    this.reporteService.getHistorialPaciente(pacienteId).subscribe({
      next: (data) => {
        this.historial.set(data);
        this.cargandoHistorial.set(false);
      },
      error: () => {
        this.errorHistorial.set('No se pudo cargar el historial del paciente.');
        this.cargandoHistorial.set(false);
      }
    });
  }

  descargarPdf(): void {
    const paciente = this.pacienteSeleccionado();
    if (!paciente) return;

    this.descargando.set(true);
    this.reporteService.exportarHistorialPaciente(paciente.id).subscribe({
      next: (blob) => {
        this.downloadService.download(blob, `historial-paciente-${paciente.documento}.pdf`);
        this.descargando.set(false);
      },
      error: () => this.descargando.set(false)
    });
  }

  limpiar(): void {
    this.pacienteSeleccionado.set(null);
    this.historial.set(null);
    this.sugerencias.set([]);
    this.mostrarSugerencias.set(false);
    this.errorHistorial.set('');
    this.busquedaInput.set('');
  }

  cerrarSugerencias(): void {
    setTimeout(() => this.mostrarSugerencias.set(false), 150);
  }

  estadoLabel(estado: string): string {
    return ESTADO_CITA_LABELS[estado as EstadoCita] ?? estado;
  }

  tipoLabel(tipo: string | undefined): string {
    if (!tipo) return '—';
    return TIPO_CITA_LABELS[tipo as TipoCita] ?? tipo;
  }

  estadoClass(estado: string): string {
    const map: Record<string, string> = {
      [EstadoCita.PROGRAMADA]: 'badge--programada',
      [EstadoCita.ATENDIDA]:   'badge--atendida',
      [EstadoCita.CANCELADA]:  'badge--cancelada',
    };
    return map[estado] ?? 'badge--default';
  }
}
