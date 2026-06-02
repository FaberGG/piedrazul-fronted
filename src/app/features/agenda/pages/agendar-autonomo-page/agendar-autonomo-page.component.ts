import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgendaService } from '../../services/agenda.service';
import { MedicoResumen, AgendarAutonomoRequest, CitaResponse } from '../../models/agenda.models';
import { TipoCita, TIPO_CITA_LABELS, TIPOS_ESPECIALIDAD } from '../../models/tipo-cita.enum';
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

  filtroEspecialidad = signal<string>('');
  puedeEspecialidad = signal<boolean>(false);

  readonly TipoCita = TipoCita;
  readonly TIPO_CITA_LABELS = TIPO_CITA_LABELS;

  readonly tiposCita = [
    { valor: TipoCita.CONSULTA_GENERAL, label: TIPO_CITA_LABELS[TipoCita.CONSULTA_GENERAL], esEspecialidad: false },
    { valor: TipoCita.TERAPIA_NEURAL,   label: TIPO_CITA_LABELS[TipoCita.TERAPIA_NEURAL],   esEspecialidad: true },
    { valor: TipoCita.QUIROPRAXIA,      label: TIPO_CITA_LABELS[TipoCita.QUIROPRAXIA],      esEspecialidad: true },
    { valor: TipoCita.FISIOTERAPIA,     label: TIPO_CITA_LABELS[TipoCita.FISIOTERAPIA],     esEspecialidad: true },
  ];

  readonly especialidades = computed(() =>
    [...new Set(this.medicos().map(m => m.especialidad).filter(Boolean))].sort()
  );

  readonly medicosFiltrados = computed(() => {
    const filtro = this.filtroEspecialidad().trim().toLowerCase();
    if (!filtro) return this.medicos();
    return this.medicos().filter(m => m.especialidad.toLowerCase().includes(filtro));
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
      next: ({ puedeEspecialidad }) => this.puedeEspecialidad.set(puedeEspecialidad),
      error: () => this.puedeEspecialidad.set(false)
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
    const esEspecialidad = TIPOS_ESPECIALIDAD.includes(tipo);
    if (esEspecialidad && !this.puedeEspecialidad()) return;
    this.tipoCitaSeleccionada.set(tipo);
  }

  onFiltroEspecialidadChange(): void {
    const seleccionado = this.medicoSeleccionado();
    if (seleccionado !== null) {
      const sigueVisible = this.medicosFiltrados().some(m => m.id === seleccionado);
      if (!sigueVisible) {
        this.medicoSeleccionado.set(null);
        this.franjas.set([]);
        this.horaSeleccionada.set('');
      }
    }
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
      tipoCita: this.tipoCitaSeleccionada(),
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
