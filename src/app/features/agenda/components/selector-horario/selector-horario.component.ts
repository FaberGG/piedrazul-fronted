import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Input, OnInit, Output, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of, switchMap, tap } from 'rxjs';

import { ModalConfirmacionComponent } from '../../../../shared/components/modal-confirmacion/modal-confirmacion.component';
import { AgendaDinamicaBloque, AgendaDinamicaResponse, AgendaDinamicaSlot } from '../../models/agenda-dinamica.model';
import {
  CitaManualResponse,
  CrearCitaManualRequest,
  CrearCitaPrioridadRequest,
  PacienteFormulario
} from '../../models/cita-manual.model';
import { DisponibilidadGlobal } from '../../models/disponibilidad.model';
import { MedicoAgenda } from '../../models/medico-agenda.model';
import { MedicoConfiguracion } from '../../models/medico-configuracion.model';
import { AgendaManualService } from '../../services/agenda-manual.service';
import { MedicosAgendaService } from '../../services/medicos-agenda.service';

interface BloqueUI extends AgendaDinamicaBloque {
  expanded: boolean;
}

@Component({
  selector: 'app-selector-horario',
  imports: [CommonModule, ReactiveFormsModule, ModalConfirmacionComponent],
  templateUrl: './selector-horario.component.html',
  styleUrl: './selector-horario.component.css'
})
export class SelectorHorarioComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly agendaService = inject(AgendaManualService);
  private readonly medicosService = inject(MedicosAgendaService);

  @Input() paciente: PacienteFormulario | null = null;
  @Input() pacienteValido = false;

  @Output() readonly citaCreada = new EventEmitter<CitaManualResponse>();
  @Output() readonly cancelado = new EventEmitter<void>();

  readonly form = this.fb.group({
    medicoId: this.fb.control<number | null>(null, Validators.required),
    fecha: this.fb.nonNullable.control('', Validators.required),
    hora: this.fb.nonNullable.control('', Validators.required),
    observaciones: this.fb.nonNullable.control('')
  });

  readonly medicos = signal<MedicoAgenda[]>([]);
  readonly configuracionMedico = signal<MedicoConfiguracion | null>(null);
  readonly bloques = signal<BloqueUI[]>([]);
  readonly agenda = signal<AgendaDinamicaResponse | null>(null);
  readonly cargandoAgenda = signal(false);
  readonly cargandoMedicos = signal(false);

  readonly disponibilidadGlobal = signal<DisponibilidadGlobal | null>(null);
  readonly slotSeleccionado = signal<{ hora: string; bloqueIndex: number; slotIndex: number } | null>(null);
  readonly slotReferenciaPrioridad = signal<AgendaDinamicaSlot | null>(null);

  readonly mostrarModalAbrirEspacio = signal(false);
  readonly mostrarModalAgendar = signal(false);
  readonly mostrarModalCancelar = signal(false);

  readonly mensajeOperacion = signal('');

  readonly diaAnteriorLabel = computed(() => this.getDiaLabel(-1));
  readonly diaSiguienteLabel = computed(() => this.getDiaLabel(1));
  readonly primerSlotDisponibleNormalizado = computed(() => {
    const agenda = this.agenda();
    if (!agenda?.primerSlotDisponible) {
      return null;
    }

    const time = agenda.primerSlotDisponible.includes('T')
      ? agenda.primerSlotDisponible.split('T')[1]
      : agenda.primerSlotDisponible;

    return this.toHora24(time);
  });

  ngOnInit(): void {
    this.cargarMedicos();

    this.form.controls.medicoId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((medicoId) => {
        this.slotSeleccionado.set(null);
        this.form.controls.hora.setValue('');
        this.mensajeOperacion.set('');

        if (!medicoId) {
          this.agenda.set(null);
          this.bloques.set([]);
          this.configuracionMedico.set(null);
          return;
        }

        this.onMedicoSeleccionado(medicoId);
      });

    this.form.controls.fecha.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((fecha) => {
        const medicoId = this.form.controls.medicoId.value;
        if (!medicoId || !fecha) {
          return;
        }

        this.cargarAgenda(medicoId, fecha);
      });
  }

  onToggleBloque(index: number): void {
    this.bloques.update((bloques) =>
      bloques.map((bloque, i) => {
        if (i !== index) {
          return bloque;
        }

        return { ...bloque, expanded: !bloque.expanded };
      })
    );
  }

  onSeleccionarSlot(slot: AgendaDinamicaSlot, bloqueIndex: number, slotIndex: number): void {
    const hora = this.toHora24(slot.hora);
    const actual = this.slotSeleccionado();

    if (actual?.hora === hora) {
      this.slotSeleccionado.set(null);
      this.form.controls.hora.setValue('');
      return;
    }

    this.slotSeleccionado.set({ hora, bloqueIndex, slotIndex });
    this.form.controls.hora.setValue(hora);
  }

  onSolicitarAbrirEspacio(slot: AgendaDinamicaSlot): void {
    this.slotReferenciaPrioridad.set(slot);
    this.mostrarModalAbrirEspacio.set(true);
  }

  confirmarAbrirEspacio(): void {
    this.mostrarModalAbrirEspacio.set(false);

    const medicoId = this.form.controls.medicoId.value;
    const fecha = this.form.controls.fecha.value;
    const slot = this.slotReferenciaPrioridad();

    if (!medicoId || !fecha || !slot || !this.pacienteValido || !this.paciente || !this.paciente.genero) {
      return;
    }

    const payload: CrearCitaPrioridadRequest = {
      ...this.paciente,
      genero: this.paciente.genero,
      medicoId,
      fecha,
      horaReferencia: this.toHora24(slot.hora),
      observaciones: this.form.controls.observaciones.value || 'Sobrecupo autorizado'
    };

    this.agendaService
      .abrirEspacioPrioritario(payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((respuesta) => {
          this.form.controls.hora.setValue(this.toHora24(respuesta.hora));
          this.slotSeleccionado.set({ hora: this.toHora24(respuesta.hora), bloqueIndex: -1, slotIndex: -1 });
          this.mensajeOperacion.set('Se abrio un espacio prioritario y se preselecciono el nuevo horario.');
        }),
        switchMap(() => this.agendaService.obtenerAgendaDinamica(medicoId, fecha)),
        catchError(() => {
          this.mensajeOperacion.set('No fue posible abrir espacio en este momento.');
          return of(null);
        })
      )
      .subscribe((agenda) => {
        if (!agenda) {
          return;
        }

        this.actualizarAgenda(agenda);
      });
  }

  onNavegarDia(offset: -1 | 1): void {
    const actual = this.form.controls.fecha.value;
    if (!actual) {
      return;
    }

    const siguiente = this.getFechaDisponible(actual, offset);
    this.form.controls.fecha.setValue(siguiente);
  }

  onAsignarGlobalRapido(): void {
    this.agendaService
      .obtenerPrimeraDisponibilidadGlobal()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((disponibilidad) => {
        this.disponibilidadGlobal.set(disponibilidad);
        this.form.patchValue({
          medicoId: disponibilidad.medicoId,
          fecha: disponibilidad.fecha,
          hora: this.toHora24(disponibilidad.hora)
        });
      });
  }

  onSolicitarAgendar(): void {
    this.mostrarModalAgendar.set(true);
  }

  confirmarAgendar(): void {
    this.mostrarModalAgendar.set(false);

    const medicoId = this.form.controls.medicoId.value;
    const fecha = this.form.controls.fecha.value;
    const hora = this.form.controls.hora.value;

    if (!medicoId || !fecha || !hora || !this.pacienteValido || !this.paciente || !this.paciente.genero) {
      this.mensajeOperacion.set('Completa paciente, medico, fecha y hora antes de agendar.');
      return;
    }

    const payload: CrearCitaManualRequest = {
      ...this.paciente,
      genero: this.paciente.genero,
      medicoId,
      fecha,
      hora,
      observaciones: this.form.controls.observaciones.value || undefined
    };

    this.agendaService
      .crearCitaManual(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((respuesta) => {
        this.mensajeOperacion.set('Cita agendada correctamente.');
        this.citaCreada.emit(respuesta);
      });
  }

  onSolicitarCancelar(): void {
    this.mostrarModalCancelar.set(true);
  }

  confirmarCancelar(): void {
    this.mostrarModalCancelar.set(false);
    this.form.patchValue({ hora: '', observaciones: '' });
    this.slotSeleccionado.set(null);
    this.cancelado.emit();
  }

  esSlotEspecial(slot: AgendaDinamicaSlot): boolean {
    const especial = this.primerSlotDisponibleNormalizado();
    if (!especial) {
      return false;
    }

    return this.toHora24(slot.hora) === especial;
  }

  esSlotSeleccionado(slot: AgendaDinamicaSlot): boolean {
    return this.slotSeleccionado()?.hora === this.toHora24(slot.hora);
  }

  puedeMostrarAbrirEspacio(slot: AgendaDinamicaSlot): boolean {
    return !!slot.permiteAbrirPrioridadPosterior;
  }

  private cargarMedicos(): void {
    this.cargandoMedicos.set(true);
    this.medicosService
      .obtenerMedicos()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of([] as MedicoAgenda[])),
        tap(() => this.cargandoMedicos.set(false))
      )
      .subscribe((medicos) => {
        this.medicos.set(medicos.filter((m) => m.activo));
      });
  }

  private onMedicoSeleccionado(medicoId: number): void {
    this.medicosService
      .obtenerConfiguracionMedico(medicoId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of(null))
      )
      .subscribe((config) => {
        this.configuracionMedico.set(config);
      });

    this.agendaService
      .obtenerPrimeraDisponibilidadMedico(medicoId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of(null))
      )
      .subscribe((disponibilidad) => {
        const fecha = disponibilidad?.fecha ?? this.fechaHoy();
        this.form.patchValue({
          fecha,
          hora: disponibilidad ? this.toHora24(disponibilidad.hora) : ''
        });
      });
  }

  private cargarAgenda(medicoId: number, fecha: string): void {
    this.cargandoAgenda.set(true);
    this.agendaService
      .obtenerAgendaDinamica(medicoId, fecha)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of(null)),
        tap(() => this.cargandoAgenda.set(false))
      )
      .subscribe((agenda) => {
        if (!agenda) {
          this.agenda.set(null);
          this.bloques.set([]);
          return;
        }

        this.actualizarAgenda(agenda);
      });
  }

  private actualizarAgenda(agenda: AgendaDinamicaResponse): void {
    this.agenda.set(agenda);
    this.bloques.set(agenda.bloques.map((bloque) => ({ ...bloque, expanded: bloque.estaExpandido })));
  }

  private getDiaLabel(offset: -1 | 1): string {
    const fecha = this.form.controls.fecha.value;
    if (!fecha) {
      return offset === -1 ? 'Dia anterior' : 'Dia siguiente';
    }

    const targetDate = this.getFechaDisponible(fecha, offset);
    const dayIndex = new Date(`${targetDate}T00:00:00`).getDay();
    const nombres = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

    return nombres[dayIndex] ?? (offset === -1 ? 'Dia anterior' : 'Dia siguiente');
  }

  private getFechaDisponible(baseFecha: string, offset: -1 | 1): string {
    const diasAtencion = this.configuracionMedico()?.diasAtencion ?? [];
    const allowed = diasAtencion.map((dia) => this.dayNameToIndex(dia));

    const date = new Date(`${baseFecha}T00:00:00`);

    for (let i = 0; i < 8; i += 1) {
      date.setDate(date.getDate() + offset);

      if (allowed.length === 0 || allowed.includes(date.getDay())) {
        return this.toIsoDate(date);
      }
    }

    return this.toIsoDate(date);
  }

  private dayNameToIndex(dayName: string): number {
    switch (dayName) {
      case 'MONDAY':
        return 1;
      case 'TUESDAY':
        return 2;
      case 'WEDNESDAY':
        return 3;
      case 'THURSDAY':
        return 4;
      case 'FRIDAY':
        return 5;
      case 'SATURDAY':
        return 6;
      case 'SUNDAY':
        return 0;
      default:
        return -1;
    }
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private fechaHoy(): string {
    return this.toIsoDate(new Date());
  }

  private toHora24(value: string): string {
    const raw = value.trim();

    if (/^\d{2}:\d{2}:\d{2}$/.test(raw)) {
      return raw;
    }

    if (/^\d{2}:\d{2}$/.test(raw)) {
      return `${raw}:00`;
    }

    const meridiemMatch = raw.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
    if (meridiemMatch) {
      const hour = Number(meridiemMatch[1]);
      const minutes = meridiemMatch[2];
      const period = meridiemMatch[3].toUpperCase();

      let converted = hour % 12;
      if (period === 'PM') {
        converted += 12;
      }

      return `${String(converted).padStart(2, '0')}:${minutes}:00`;
    }

    return raw;
  }
}

