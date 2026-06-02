import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgendaService } from '../../services/agenda.service';
import { MedicoResumen, AgendarAutonomoRequest, CitaResponse } from '../../models/agenda.models';
import { TipoCita, TIPO_CITA_LABELS, TIPOS_ESPECIALIDAD, ESPECIALIDAD_CONSULTA_GENERAL, ESPECIALIDAD_POR_TIPO } from '../../models/tipo-cita.enum';
import { PacientePortalService } from '../../../paciente/services/paciente-portal.service';

@Component({
  selector: 'app-agendar-autonomo-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agendar-autonomo-page.component.html',
  styleUrl: './agendar-autonomo-page.component.css'
})
export class AgendarAutonomoPageComponent implements OnInit {
  private readonly agendaService = inject(AgendaService);
  private readonly portalService = inject(PacientePortalService);

  medicos = signal<MedicoResumen[]>([]);
  franjas = signal<string[]>([]);
  citaConfirmada = signal<CitaResponse | null>(null);

  puedeEspecialidad = signal<boolean>(false);

  readonly TipoCita = TipoCita;
  readonly TIPO_CITA_LABELS = TIPO_CITA_LABELS;

  readonly tiposCita = [
    { valor: TipoCita.CONSULTA_GENERAL, label: TIPO_CITA_LABELS[TipoCita.CONSULTA_GENERAL], esEspecialidad: false },
    { valor: TipoCita.TERAPIA_NEURAL,   label: TIPO_CITA_LABELS[TipoCita.TERAPIA_NEURAL],   esEspecialidad: true },
    { valor: TipoCita.QUIROPRAXIA,      label: TIPO_CITA_LABELS[TipoCita.QUIROPRAXIA],      esEspecialidad: true },
    { valor: TipoCita.FISIOTERAPIA,     label: TIPO_CITA_LABELS[TipoCita.FISIOTERAPIA],     esEspecialidad: true },
  ];

  private readonly LABEL_PROFESIONAL: Record<TipoCita, string> = {
    [TipoCita.CONSULTA_GENERAL]: 'Médico de Medicina General',
    [TipoCita.TERAPIA_NEURAL]:   'Terapeuta Neural',
    [TipoCita.QUIROPRAXIA]:      'Quiropráctico',
    [TipoCita.FISIOTERAPIA]:     'Fisioterapeuta',
    [TipoCita.ESTANDAR]:         'Profesional',
    [TipoCita.PRIORIDAD]:        'Profesional',
  };

  readonly labelProfesional = computed(() =>
    this.LABEL_PROFESIONAL[this.tipoCitaSeleccionada()] ?? 'Profesional'
  );

  readonly medicosFiltrados = computed(() => {
    if (!this.puedeEspecialidad()) {
      return this.medicos().filter(m => m.especialidad === ESPECIALIDAD_CONSULTA_GENERAL);
    }
    const espFiltro = ESPECIALIDAD_POR_TIPO[this.tipoCitaSeleccionada()];
    return espFiltro
      ? this.medicos().filter(m => m.especialidad === espFiltro)
      : this.medicos();
  });

  medicoSeleccionado = signal<number | null>(null);
  fechaSeleccionada = signal<string>('');
  horaSeleccionada = signal<string>('');
  tipoCitaSeleccionada = signal<TipoCita>(TipoCita.CONSULTA_GENERAL);
  observaciones = signal<string>('');

  cargandoMedicos = signal(false);
  cargandoFranjas = signal(false);
  enviando = signal(false);
  error = signal<string | null>(null);
  submitted = signal(false);

  ngOnInit(): void {
    this.cargarMedicos();
    this.portalService.puedeAgendarEspecialidad().subscribe({
      next: ({ puedeEspecialidad }) => {
        console.log('[Agendar] puedeEspecialidad:', puedeEspecialidad);
        this.puedeEspecialidad.set(puedeEspecialidad);
      },
      error: (err) => {
        console.error('[Agendar] puedeEspecialidad error:', err?.status, err?.error);
        this.puedeEspecialidad.set(false);
      }
    });
  }

  cargarMedicos(): void {
    this.cargandoMedicos.set(true);
    this.agendaService.listarMedicosActivos().subscribe({
      next: (data) => {
        this.medicos.set(data);
        this.cargandoMedicos.set(false);
      },
      error: () => {
        this.error.set('Error al cargar médicos');
        this.cargandoMedicos.set(false);
      }
    });
  }

  seleccionarTipo(tipo: TipoCita): void {
    if (TIPOS_ESPECIALIDAD.includes(tipo) && !this.puedeEspecialidad()) return;
    this.tipoCitaSeleccionada.set(tipo);
    this.medicoSeleccionado.set(null);
    this.franjas.set([]);
    this.horaSeleccionada.set('');
  }

  onMedicoOFechaChange(): void {
    const medicoId = this.medicoSeleccionado();
    const fecha = this.fechaSeleccionada();
    if (!medicoId || !fecha) return;

    this.cargandoFranjas.set(true);
    this.horaSeleccionada.set('');
    this.agendaService.obtenerFranjasDisponibles(medicoId, fecha).subscribe({
      next: (data) => {
        this.franjas.set(data);
        this.cargandoFranjas.set(false);
      },
      error: () => {
        this.error.set('Error al cargar franjas');
        this.cargandoFranjas.set(false);
      }
    });
  }

  tipoLabel(tipo: string | undefined): string {
    if (!tipo) return TIPO_CITA_LABELS[TipoCita.CONSULTA_GENERAL];
    return TIPO_CITA_LABELS[tipo as TipoCita] ?? tipo;
  }

  formatHora(hora: string): string {
    const [h, m] = hora.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0);
    return d.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  agendar(): void {
    this.submitted.set(true);

    const medicoId = this.medicoSeleccionado();
    const fecha = this.fechaSeleccionada();
    const hora = this.horaSeleccionada();

    if (!medicoId || !fecha || !hora) return;

    this.enviando.set(true);
    this.error.set(null);

    const request: AgendarAutonomoRequest = {
      medicoId,
      fecha,
      hora,
      observaciones: this.observaciones()
    };

    this.agendaService.agendarCita(request).subscribe({
      next: (cita) => {
        this.citaConfirmada.set(cita);
        this.enviando.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Error al agendar la cita');
        this.enviando.set(false);
      }
    });
  }
}
