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
import { AgendaService } from '../../services/agenda.service';
import { MedicosService } from '../../services/medicos.service';
import { AgendaModel, CitaModel, EstadoCita } from '../../models/cita.model';
import { MedicoModel } from '../../models/medico.model';

@Component({
  selector: 'app-lista-citas-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-citas-page.component.html',
  styleUrl: './lista-citas-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListaCitasPageComponent implements OnInit {

  private readonly agendaService  = inject(AgendaService);
  private readonly medicosService = inject(MedicosService);

  medicos              = signal<MedicoModel[]>([]);
  agenda               = signal<AgendaModel | null>(null);
  cargando             = signal(false);
  errorMensaje         = signal('');
  agendaCargada        = signal(false);
  medicoSeleccionadoId = signal<number | null>(null);
  fechaSeleccionada    = signal<string>('');

  puedesBuscar = computed(() =>
    !!this.medicoSeleccionadoId() && !!this.fechaSeleccionada() && !this.cargando()
  );

  ngOnInit(): void {
    this.fechaSeleccionada.set(new Date().toISOString().split('T')[0]);
    this.cargarMedicos();
  }

  cargarMedicos(): void {
    this.medicosService.listarActivos().subscribe({
      next:  (data) => this.medicos.set(data),
      error: ()     => this.errorMensaje.set('No se pudo cargar la lista de médicos.')
    });
  }

  buscarCitas(): void {
    const medicoId = this.medicoSeleccionadoId();
    const fecha    = this.fechaSeleccionada();
    if (!medicoId || !fecha) {
      this.errorMensaje.set('Selecciona un médico y una fecha.');
      return;
    }
    this.cargando.set(true);
    this.errorMensaje.set('');
    this.agendaCargada.set(false);
    this.agenda.set(null);

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

  onMedicoChange(id: string): void {
    this.medicoSeleccionadoId.set(id ? Number(id) : null);
    this.agendaCargada.set(false);
    this.agenda.set(null);
    this.errorMensaje.set('');
  }

  getEstadoClass(estado: EstadoCita): string {
    const map: Record<EstadoCita, string> = {
      PROGRAMADA: 'estado--programada',
      ATENDIDA:   'estado--atendida',
      CANCELADA:  'estado--cancelada',
      PENDIENTE:  'estado--pendiente'
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
    return `${hIni12}:${m.toString().padStart(2,'0')} - ${hFin12}:${mFin} ${sufijo}`;
  }

  trackByCita(_: number, cita: CitaModel): number { return cita.id; }
  trackByMedico(_: number, medico: MedicoModel): number { return medico.id; }
}
