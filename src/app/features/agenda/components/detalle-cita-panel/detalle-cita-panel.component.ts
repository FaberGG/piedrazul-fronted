import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  inject,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AgendaManualService } from '../../services/agenda-manual.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ModalConfirmacionComponent } from '../../../../shared/components/modal-confirmacion/modal-confirmacion.component';
import { CitaDetalleModel, ActualizarCitaRequest } from '../../models/cita.model';
import { CitaManualResponse } from '../../models/cita-manual.model';
import { HistorialCambiosCitaResponse } from '../../models/agenda.models';

@Component({
  selector: 'app-detalle-cita-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalConfirmacionComponent],
  templateUrl: './detalle-cita-panel.component.html',
  styleUrl: './detalle-cita-panel.component.css'
})
export class DetalleCitaPanelComponent implements OnChanges {
  @Input() citaId: number | null = null;
  @Output() cerrar = new EventEmitter<void>();
  @Output() actualizado = new EventEmitter<CitaManualResponse>();

  private readonly service = inject(AgendaManualService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  detalle = signal<CitaDetalleModel | null>(null);
  historial = signal<HistorialCambiosCitaResponse[]>([]);
  cargando = signal(false);
  guardando = signal(false);
  error = signal<string | null>(null);
  mostrarModal = signal(false);

  // Form fields (bound to [(ngModel)])
  nuevoEstado = signal('');
  nuevasObservaciones = signal('');
  pacienteNombres = signal('');
  pacienteApellidos = signal('');
  pacienteDocumento = signal('');
  pacienteCelular = signal('');
  pacienteCorreo = signal('');

  // Original patient values — used to detect actual changes before sending
  private originalNombres = '';
  private originalApellidos = '';
  private originalDocumento = '';
  private originalCelular = '';
  private originalCorreo = '';

  rol = computed(() => this.authService.getCurrentRole());

  // MEDICO and ADMIN can always update cita fields (estado, observaciones)
  puedeEditarCita = computed(() => {
    const r = this.rol();
    return r === 'ADMIN' || r === 'MEDICO';
  });

  // Only ADMIN or MEDICO on the patient's FIRST appointment can update patient data
  puedeEditarPaciente = computed(() => {
    const d = this.detalle();
    const r = this.rol();
    return r === 'ADMIN' || (r === 'MEDICO' && !!d?.esPrimeraCita);
  });

  estadosValidos = computed(() => {
    const estado = this.detalle()?.estado;
    if (estado === 'PROGRAMADA') {
      return ['ATENDIDA', 'CANCELADA'];
    }
    return [];
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['citaId'] && this.citaId !== null) {
      this.cargarDetalle();
    }
  }

  private cargarDetalle(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.historial.set([]);
    this.service.obtenerDetalleCita(this.citaId!).subscribe({
      next: (d) => {
        this.detalle.set(d);
        const [nombres, ...apellidosParts] = (d.pacienteNombre ?? '').split(' ');
        const nombres0 = nombres ?? '';
        const apellidos0 = apellidosParts.join(' ');
        this.pacienteNombres.set(nombres0);
        this.pacienteApellidos.set(apellidos0);
        this.pacienteDocumento.set(d.pacienteDocumento ?? '');
        this.pacienteCelular.set(d.pacienteCelular ?? '');
        this.pacienteCorreo.set(d.pacienteCorreo ?? '');
        // Snapshot originals for change detection
        this.originalNombres = nombres0;
        this.originalApellidos = apellidos0;
        this.originalDocumento = d.pacienteDocumento ?? '';
        this.originalCelular = d.pacienteCelular ?? '';
        this.originalCorreo = d.pacienteCorreo ?? '';
        this.nuevasObservaciones.set(d.observaciones ?? '');
        this.nuevoEstado.set('');
        this.cargando.set(false);
        // Load historial after detail (secondary, non-blocking)
        this.service.obtenerHistorialCita(this.citaId!).subscribe({
          next: (h) => this.historial.set(h),
          error: () => this.error.set('No se pudo cargar el historial.')
        });
      },
      error: () => {
        this.error.set('No se pudo cargar el detalle de la cita.');
        this.cargando.set(false);
      }
    });
  }

  abrirModal(): void {
    this.mostrarModal.set(true);
  }

  cancelarModal(): void {
    this.mostrarModal.set(false);
  }

  confirmarGuardar(): void {
    this.mostrarModal.set(false);
    this.guardar();
  }

  private guardar(): void {
    const d = this.detalle();
    if (!d) return;

    this.guardando.set(true);
    this.error.set(null);

    const request: ActualizarCitaRequest = {};

    if (this.nuevoEstado()) request.nuevoEstado = this.nuevoEstado();
    if (this.nuevasObservaciones() !== (d.observaciones ?? '')) request.nuevasObservaciones = this.nuevasObservaciones();

    // Patient fields are only sent when the user has permission AND the value actually changed
    if (this.puedeEditarPaciente()) {
      if (this.pacienteNombres() !== this.originalNombres) request.pacienteNombres = this.pacienteNombres();
      if (this.pacienteApellidos() !== this.originalApellidos) request.pacienteApellidos = this.pacienteApellidos();
      if (this.pacienteDocumento() !== this.originalDocumento) request.pacienteDocumento = this.pacienteDocumento();
      if (this.pacienteCelular() !== this.originalCelular) request.pacienteCelular = this.pacienteCelular();
      if (this.pacienteCorreo() !== this.originalCorreo) request.pacienteCorreo = this.pacienteCorreo();
    }

    this.service.actualizarCita(this.citaId!, request).subscribe({
      next: (updated) => {
        this.guardando.set(false);
        this.actualizado.emit(updated);
        this.cargarDetalle();
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Error al guardar los cambios.');
        this.guardando.set(false);
      }
    });
  }

  irAReagendar(): void {
    this.router.navigate(['/agenda/reagendar', this.citaId]);
    this.cerrar.emit();
  }

  formatFecha(fecha: string): string {
    return fecha ? new Date(fecha + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
  }

  formatHora(hora: string): string {
    return hora?.slice(0, 5) ?? '';
  }
}
