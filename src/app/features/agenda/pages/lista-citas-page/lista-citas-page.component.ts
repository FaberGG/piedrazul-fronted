import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AgendaService } from '../../services/agenda.service';
import { MedicosService, AgendaDiaDtoFrontend } from '../../services/medicos.service';
import { ReporteService } from '../../../../shared/services/reporte.service';
import { DownloadService } from '../../../../shared/services/download.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { AgendaModel, CitaModel } from '../../models/cita.model';
import { MedicoModel } from '../../models/medico.model';
import { DetalleCitaPanelComponent } from '../../components/detalle-cita-panel/detalle-cita-panel.component';
import { ROLES } from '../../../../shared/constants/roles';

const SENTINEL_TODOS = 'todos';

@Component({
  selector: 'app-lista-citas-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DetalleCitaPanelComponent],
  templateUrl: './lista-citas-page.component.html',
  styleUrl: './lista-citas-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListaCitasPageComponent implements OnInit {

  private readonly agendaService = inject(AgendaService);
  private readonly medicosService = inject(MedicosService);
  private readonly reporteService = inject(ReporteService);
  private readonly downloadService = inject(DownloadService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly SENTINEL_TODOS = SENTINEL_TODOS;

  medicos = signal<MedicoModel[]>([]);
  agenda = signal<AgendaModel | null>(null);
  agendaCompleta = signal<AgendaDiaDtoFrontend[] | null>(null);
  cargando = signal(false);
  descargando = signal(false);
  errorMensaje = signal('');
  agendaCargada = signal(false);
  modoTodos = signal(false);

  // 'todos' sentinel or a numeric id stored as string to unify the select binding
  medicoSeleccionadoValor = signal<string>('');
  medicoSeleccionadoId = signal<number | null>(null);
  fechaSeleccionada = signal<string>('');
  formatosDisponibles = signal<string[]>([]);
  formatoSeleccionado = signal<string>('');
  citaSeleccionadaId = signal<number | null>(null);

  rol = computed(() => this.authService.getCurrentRole());
  puedeVerDetalle = computed(() => this.rol() === ROLES.ADMIN || this.rol() === ROLES.MEDICO);

  puedesBuscar = computed(() =>
    (!!this.medicoSeleccionadoId() || this.modoTodos()) &&
    !!this.fechaSeleccionada() &&
    !this.cargando()
  );

  ngOnInit(): void {
    this.fechaSeleccionada.set(new Date().toISOString().split('T')[0]);
    this.cargarMedicos();
    this.cargarFormatos();
  }

  cargarMedicos(): void {
    this.medicosService.listarActivos().subscribe({
      next: (data) => {
        this.medicos.set(data);
        this.autoSeleccionarMedicoActual();
      },
      error: () => this.errorMensaje.set('No se pudo cargar la lista de médicos.')
    });
  }

  private autoSeleccionarMedicoActual(): void {
    const role = this.rol();
    if (role === ROLES.ADMIN || role === ROLES.AGENDADOR) {
      this.medicoSeleccionadoValor.set(SENTINEL_TODOS);
      this.modoTodos.set(true);
      return;
    }
    if (role !== ROLES.MEDICO && role !== ROLES.TERAPISTA) return;

    this.medicosService.getMedicoActual().subscribe({
      next: (medico) => {
        this.medicoSeleccionadoId.set(medico.id);
        this.medicoSeleccionadoValor.set(String(medico.id));
        this.modoTodos.set(false);
      },
      error: () => { /* no-op: user can select manually */ }
    });
  }

  cargarFormatos(): void {
    this.reporteService.getExportFormatos().subscribe({
      next: (data) => this.formatosDisponibles.set(data),
      error: () => this.errorMensaje.set('No se pudo cargar la lista de formatos.')
    });
  }

  buscarCitas(): void {
    const fecha = this.fechaSeleccionada();
    this.errorMensaje.set('');
    this.agendaCargada.set(false);
    this.agenda.set(null);
    this.agendaCompleta.set(null);

    if (this.modoTodos()) {
      this.cargando.set(true);
      this.medicosService.getAgendaCompleta(fecha).subscribe({
        next: (data) => {
          this.agendaCompleta.set(data);
          this.agendaCargada.set(true);
          this.cargando.set(false);
        },
        error: () => {
          this.cargando.set(false);
          this.errorMensaje.set('Error al consultar la agenda del día.');
        }
      });
      return;
    }

    const medicoId = this.medicoSeleccionadoId();
    if (!medicoId || !fecha) {
      this.errorMensaje.set('Selecciona un médico y una fecha.');
      return;
    }
    this.cargando.set(true);
    this.agendaService.listarAgendaMedico(medicoId, fecha).subscribe({
      next: (data) => {
        this.agenda.set(data);
        this.agendaCargada.set(true);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        if (err.status === 401 || err.status === 403) {
          this.errorMensaje.set('Sin permisos o sesión expirada.');
        } else if (err.status === 404) {
          this.errorMensaje.set('No se encontró información para ese médico y fecha.');
        } else {
          this.errorMensaje.set('Error al consultar las citas. Intenta de nuevo.');
        }
      }
    });
  }

  onMedicoChange(valor: string): void {
    this.agendaCargada.set(false);
    this.agenda.set(null);
    this.agendaCompleta.set(null);
    this.errorMensaje.set('');
    this.medicoSeleccionadoValor.set(valor);

    if (valor === SENTINEL_TODOS) {
      this.modoTodos.set(true);
      this.medicoSeleccionadoId.set(null);
    } else {
      this.modoTodos.set(false);
      this.medicoSeleccionadoId.set(valor ? Number(valor) : null);
    }
  }

  getEstadoClass(estado: string): string {
    const map: Record<string, string> = {
      PROGRAMADA: 'estado--programada',
      ATENDIDA: 'estado--atendida',
      CANCELADA: 'estado--cancelada',
      INASISTENCIA: 'estado--inasistencia'
    };
    return map[estado] ?? 'estado--default';
  }

  formatHora(hora: string): string {
    return hora?.slice(0, 5) ?? '';
  }

  getRangoHora(hora: string, intervalo: number): string {
    const [h, m] = hora.split(':').map(Number);
    const totalMin = h * 60 + m + intervalo;
    const hFin = Math.floor(totalMin / 60);
    const mFin = (totalMin % 60).toString().padStart(2, '0');
    const hIni12 = h > 12 ? h - 12 : h;
    const hFin12 = hFin > 12 ? hFin - 12 : hFin;
    const sufijo = h < 12 ? 'AM' : 'PM';
    return `${hIni12}:${m.toString().padStart(2, '0')} - ${hFin12}:${mFin} ${sufijo}`;
  }

  exportFormat(): void {
    const medicoId = this.medicoSeleccionadoId();
    const fecha = this.fechaSeleccionada();
    const formatoSelec = this.formatoSeleccionado();

    if (!medicoId || !fecha) {
      this.errorMensaje.set('Selecciona un médico específico y una fecha para exportar.');
      return;
    }
    if (!formatoSelec) {
      this.errorMensaje.set('Selecciona un formato de descarga.');
      return;
    }
    this.descargando.set(true);
    this.errorMensaje.set('');

    this.reporteService.exportarAgendaDiaria(medicoId, fecha, formatoSelec).subscribe({
      next: (blob) => {
        this.downloadService.download(blob, `agenda_${fecha}_medico_${medicoId}.${formatoSelec.toLowerCase()}`);
        this.descargando.set(false);
      },
      error: () => {
        this.descargando.set(false);
        this.errorMensaje.set('Error al descargar el archivo. Intenta de nuevo.');
      }
    });
  }

  verDetalle(citaId: number): void {
    this.citaSeleccionadaId.set(citaId);
  }

  onCitaActualizada(): void {
    this.citaSeleccionadaId.set(null);
    this.buscarCitas();
  }

  reagendarCita(citaId: number): void {
    this.router.navigate(['/agenda/reagendar', citaId]);
  }

  trackByCita(_: number, cita: CitaModel): number { return cita.id; }
  trackByMedico(_: number, medico: MedicoModel): number { return medico.id; }
}
