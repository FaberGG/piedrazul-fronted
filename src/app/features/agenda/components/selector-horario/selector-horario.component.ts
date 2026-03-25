import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of, tap } from 'rxjs';

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

interface SlotUI extends AgendaDinamicaSlot {
  uid: string;
  hora24: string;
  isOpenedGap?: boolean;
  sourceHoraReferencia?: string;
}

interface BloqueUI extends AgendaDinamicaBloque {
  slots: SlotUI[];
  expanded: boolean;
}

interface OpenSpaceReference {
  bloqueIndex: number;
  slotIndex: number;
  slot: SlotUI;
}

@Component({
  selector: 'app-selector-horario',
  imports: [CommonModule, ReactiveFormsModule, ModalConfirmacionComponent],
  templateUrl: './selector-horario.component.html',
  styleUrl: './selector-horario.component.css'
})
export class SelectorHorarioComponent implements OnInit, OnChanges {
  private static readonly PRIORITY_OPEN_GAP_MINUTES = 15;

  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly agendaService = inject(AgendaManualService);
  private readonly medicosService = inject(MedicosAgendaService);

  @Input() paciente: PacienteFormulario | null = null;
  @Input() pacienteValido = false;
  @Input() resetKey = 0;

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
  readonly disponibilidadAutoPendiente = signal<DisponibilidadGlobal | null>(null);
  readonly slotSeleccionado = signal<{ uid: string; hora: string; isOpenedGap: boolean; horaReferencia?: string } | null>(null);
  readonly selectableSlotUids = signal<Set<string>>(new Set<string>());
  readonly slotReferenciaPrioridad = signal<OpenSpaceReference | null>(null);

  readonly mostrarModalAbrirEspacio = signal(false);
  readonly mostrarModalAuto = signal(false);
  readonly mostrarModalAgendar = signal(false);
  readonly mostrarModalCancelar = signal(false);

  readonly mensajeOperacion = signal('');
  readonly ultimaFechaCargada = signal('');
  readonly hoveredSlotUid = signal<string | null>(null);
  readonly resumenModalLineas = signal<string[]>([]);

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

  readonly fechaCitaFormateada = computed(() => this.formatearFechaLarga(this.form.controls.fecha.value));

  readonly navegacionBloqueada = computed(() => this.slotSeleccionado() !== null);

  readonly autoDetalleLineas = computed(() => {
    const auto = this.disponibilidadAutoPendiente();
    if (!auto) {
      return [] as string[];
    }

    const hora = this.toHora12(auto.hora);
    return [
      `Medico: ${auto.medicoNombre ?? 'No disponible'}`,
      `Fecha: ${this.formatearFechaLarga(auto.fecha)}`,
      `Hora sugerida: ${hora}`
    ];
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resetKey'] && !changes['resetKey'].firstChange) {
      this.restablecerEstadoInicial(false);
    }
  }

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

        if (this.navegacionBloqueada() && this.ultimaFechaCargada() && fecha !== this.ultimaFechaCargada()) {
          this.form.controls.fecha.setValue(this.ultimaFechaCargada(), { emitEvent: false });
          this.mensajeOperacion.set('No puedes cambiar la fecha mientras haya un horario seleccionado.');
          return;
        }

        this.ultimaFechaCargada.set(fecha);

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

  onSeleccionarSlot(slot: SlotUI): void {
    const hora = slot.hora24;
    const actual = this.slotSeleccionado();

    if (actual?.uid === slot.uid) {
      this.slotSeleccionado.set(null);
      this.form.controls.hora.setValue('');
      return;
    }

    this.slotSeleccionado.set({
      uid: slot.uid,
      hora,
      isOpenedGap: !!slot.isOpenedGap,
      horaReferencia: slot.sourceHoraReferencia
    });
    this.form.controls.hora.setValue(hora);
  }

  onSolicitarAbrirEspacio(bloqueIndex: number, slotIndex: number, slot: SlotUI): void {
    if (!this.puedeMostrarAbrirEspacioEnBloque(slot, bloqueIndex)) {
      return;
    }

    if (this.tieneHuecoAbiertoDespues(slot, bloqueIndex)) {
      return;
    }

    this.slotReferenciaPrioridad.set({ bloqueIndex, slotIndex, slot });
    this.mostrarModalAbrirEspacio.set(true);
  }

  confirmarAbrirEspacio(): void {
    this.mostrarModalAbrirEspacio.set(false);

    const referencia = this.slotReferenciaPrioridad();
    if (!referencia) {
      return;
    }

    this.bloques.update((bloques) => {
      const objetivo = bloques[referencia.bloqueIndex];
      if (!objetivo) {
        return bloques;
      }

      const yaExisteHueco = objetivo.slots.some(
        (item) => item.isOpenedGap && item.sourceHoraReferencia === referencia.slot.hora24
      );
      if (yaExisteHueco) {
        return bloques;
      }

      const nuevosSlots = [...objetivo.slots];
      // Backend creates priority slots relative to the reference appointment time.
      const horaNueva = this.sumarMinutos(referencia.slot.hora24, SelectorHorarioComponent.PRIORITY_OPEN_GAP_MINUTES);
      const nuevoSlot: SlotUI = {
        uid: `gap-${referencia.slot.uid}-${Date.now()}`,
        hora: this.toHora12(horaNueva),
        hora24: horaNueva,
        estado: 'DISPONIBLE',
        isOpenedGap: true,
        sourceHoraReferencia: referencia.slot.hora24,
        permiteAbrirPrioridadPosterior: false
      };

      nuevosSlots.splice(referencia.slotIndex + 1, 0, nuevoSlot);

      return bloques.map((bloque, index) => (index === referencia.bloqueIndex ? { ...bloque, slots: nuevosSlots } : bloque));
    });

    this.mensajeOperacion.set('Se agrego un nuevo espacio disponible. Seleccionalo si deseas usarlo.');
    this.slotReferenciaPrioridad.set(null);
  }

  onNavegarDia(offset: -1 | 1): void {
    if (this.navegacionBloqueada()) {
      this.mensajeOperacion.set('Primero elimina el horario seleccionado para cambiar de dia.');
      return;
    }

    const actual = this.form.controls.fecha.value;
    if (!actual) {
      return;
    }

    const siguiente = this.getFechaDisponible(actual, offset);
    this.form.controls.fecha.setValue(siguiente);
  }

  onSolicitarAutoAsignacion(): void {
    this.agendaService
      .obtenerPrimeraDisponibilidadGlobal()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((disponibilidad) => {
        this.disponibilidadAutoPendiente.set(disponibilidad);
        this.mostrarModalAuto.set(true);
      });
  }

  confirmarAutoAsignacion(): void {
    const disponibilidad = this.disponibilidadAutoPendiente();
    if (!disponibilidad) {
      return;
    }

    this.disponibilidadGlobal.set(disponibilidad);
    this.mostrarModalAuto.set(false);
    this.disponibilidadAutoPendiente.set(null);
    this.form.patchValue({
      medicoId: disponibilidad.medicoId,
      fecha: disponibilidad.fecha,
      hora: this.toHora24(disponibilidad.hora)
    });
  }

  onSolicitarAgendar(): void {
    if (!this.puedeConfirmarAgendamiento()) {
      this.mensajeOperacion.set('Completa paciente y selecciona un horario antes de continuar.');
      return;
    }

    this.resumenModalLineas.set(this.construirResumenAgendamiento());
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

    const seleccion = this.slotSeleccionado();
    const esHuecoAbierto = !!seleccion?.isOpenedGap;

    if (esHuecoAbierto && seleccion?.horaReferencia) {
      const payloadPrioridad: CrearCitaPrioridadRequest = {
        ...this.paciente,
        genero: this.paciente.genero,
        medicoId,
        fecha,
        horaReferencia: seleccion.horaReferencia,
        observaciones: this.form.controls.observaciones.value || 'Sobrecupo autorizado'
      };

      this.agendaService
        .abrirEspacioPrioritario(payloadPrioridad)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((respuesta) => {
          this.mensajeOperacion.set('Cita agendada correctamente.');
          this.restablecerEstadoInicial();
          this.citaCreada.emit(respuesta);
        }, () => {
          this.mensajeOperacion.set('No fue posible agendar la cita en ese hueco. Intenta otro horario.');
        });
      return;
    }

    this.agendaService
      .crearCitaManual(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((respuesta) => {
        this.mensajeOperacion.set('Cita agendada correctamente.');
        this.restablecerEstadoInicial();
        this.citaCreada.emit(respuesta);
      }, () => {
        this.mensajeOperacion.set('No se pudo agendar la cita. Verifica el horario seleccionado.');
      });
  }

  onSolicitarCancelar(): void {
    this.mostrarModalCancelar.set(true);
  }

  confirmarCancelar(): void {
    this.mostrarModalCancelar.set(false);
    this.restablecerEstadoInicial();
    this.cancelado.emit();
  }

  esSlotEspecial(slot: SlotUI): boolean {
    if (slot.isOpenedGap) {
      return true;
    }

    return this.selectableSlotUids().has(slot.uid);
  }

  esSlotSeleccionado(slot: SlotUI): boolean {
    return this.slotSeleccionado()?.uid === slot.uid;
  }

  puedeMostrarAbrirEspacio(slot: SlotUI): boolean {
    return !!slot.permiteAbrirPrioridadPosterior && !slot.isOpenedGap;
  }

  puedeMostrarAbrirEspacioEnBloque(slot: SlotUI, bloqueIndex: number): boolean {
    return this.puedeMostrarAbrirEspacio(slot)
      && !this.estaAntesDelPrimerLibre(slot)
      && !this.tieneHuecoAbiertoDespues(slot, bloqueIndex);
  }

  onHoverSlot(slotUid: string | null): void {
    this.hoveredSlotUid.set(slotUid);
  }

  esGapVisible(slot: SlotUI, bloqueIndex: number): boolean {
    return this.hoveredSlotUid() === slot.uid && this.puedeMostrarAbrirEspacioEnBloque(slot, bloqueIndex);
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
        this.ultimaFechaCargada.set(fecha);
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
    const bloquesActualizados = agenda.bloques.map((bloque, bloqueIndex) => ({
      ...bloque,
      slots: bloque.slots.map((slot, slotIndex) => ({
        ...slot,
        uid: `slot-${bloqueIndex}-${slotIndex}-${this.toHora24(slot.hora)}`,
        hora24: this.toHora24(slot.hora)
      })),
      expanded: bloque.estaExpandido
    }));

    this.bloques.set(bloquesActualizados);
    this.selectableSlotUids.set(this.calcularSlotsSeleccionables(bloquesActualizados));

    const seleccionado = this.slotSeleccionado();
    if (seleccionado && !this.existeSlotSeleccionadoValido(bloquesActualizados, seleccionado.uid)) {
      this.slotSeleccionado.set(null);
      this.form.controls.hora.setValue('');
    }
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

  private toHora12(value: string): string {
    const normalized = this.toHora24(value);
    const parts = normalized.split(':');
    if (parts.length < 2) {
      return normalized;
    }

    const hours = Number(parts[0]);
    const minutes = parts[1];
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  }

  private sumarMinutos(hora24: string, minutos: number): string {
    const [hours, mins] = hora24.split(':').map((item) => Number(item));
    const baseDate = new Date();
    baseDate.setHours(hours || 0, mins || 0, 0, 0);
    baseDate.setMinutes(baseDate.getMinutes() + minutos);
    const nextHours = String(baseDate.getHours()).padStart(2, '0');
    const nextMinutes = String(baseDate.getMinutes()).padStart(2, '0');
    return `${nextHours}:${nextMinutes}:00`;
  }

  private formatearFechaLarga(fechaIso: string): string {
    if (!fechaIso) {
      return '-';
    }

    const fecha = new Date(`${fechaIso}T00:00:00`);
    if (Number.isNaN(fecha.getTime())) {
      return fechaIso;
    }

    return new Intl.DateTimeFormat('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(fecha);
  }

  private getNombrePaciente(): string {
    if (!this.paciente) {
      return '-';
    }

    return `${this.paciente.nombres} ${this.paciente.apellidos}`.trim();
  }


  private puedeConfirmarAgendamiento(): boolean {
    const medicoId = this.form.controls.medicoId.value;
    const fecha = this.form.controls.fecha.value;
    const hora = this.form.controls.hora.value;

    return !!medicoId && !!fecha && !!hora && !!this.slotSeleccionado() && this.pacienteValido && !!this.paciente?.genero;
  }

  private construirResumenAgendamiento(): string[] {
    const medicoId = this.form.controls.medicoId.value;
    const medico = this.medicos().find((item) => item.id === medicoId);

    return [
      `Paciente: ${this.getNombrePaciente()}`,
      `Documento: ${this.paciente?.documento || '-'}`,
      `Medico: ${medico?.nombresCompletos || '-'}`,
      `Fecha: ${this.formatearFechaLarga(this.form.controls.fecha.value)}`,
      `Hora: ${this.toHora12(this.form.controls.hora.value)}`
    ];
  }

  private restablecerEstadoInicial(clearMessage = true): void {
    this.form.reset({
      medicoId: null,
      fecha: '',
      hora: '',
      observaciones: ''
    });

    this.agenda.set(null);
    this.bloques.set([]);
    this.configuracionMedico.set(null);
    this.disponibilidadGlobal.set(null);
    this.disponibilidadAutoPendiente.set(null);
    this.selectableSlotUids.set(new Set<string>());
    this.slotSeleccionado.set(null);
    this.slotReferenciaPrioridad.set(null);
    this.hoveredSlotUid.set(null);
    this.resumenModalLineas.set([]);
    this.ultimaFechaCargada.set('');
    this.cargandoAgenda.set(false);
    this.mostrarModalAbrirEspacio.set(false);
    this.mostrarModalAuto.set(false);
    this.mostrarModalAgendar.set(false);
    this.mostrarModalCancelar.set(false);

    if (clearMessage) {
      this.mensajeOperacion.set('');
    }
  }

  private tieneHuecoAbiertoDespues(slot: SlotUI, bloqueIndex: number): boolean {
    const bloque = this.bloques()[bloqueIndex];
    if (!bloque) {
      return false;
    }

    return bloque.slots.some((item) => item.isOpenedGap && item.sourceHoraReferencia === slot.hora24);
  }

  private estaAntesDelPrimerLibre(slot: SlotUI): boolean {
    const primerLibre = this.primerSlotDisponibleNormalizado() ?? this.buscarPrimerLibreEnAgenda();
    if (!primerLibre) {
      return false;
    }

    return slot.hora24 < primerLibre;
  }

  private buscarPrimerLibreEnAgenda(): string | null {
    const slots = this.bloques().flatMap((bloque) => bloque.slots);
    const libre = slots.find((item) => this.esSlotLibre(item));
    return libre?.hora24 ?? null;
  }

  private calcularSlotsSeleccionables(bloques: BloqueUI[]): Set<string> {
    const seleccionables = new Set<string>();

    const primerSlot = this.primerSlotDisponibleNormalizado();
    if (primerSlot) {
      for (const bloque of bloques) {
        const candidato = bloque.slots.find((slot) => slot.hora24 === primerSlot && this.esSlotLibre(slot));
        if (candidato) {
          seleccionables.add(candidato.uid);
          break;
        }
      }
    }

    const slotsPlanos = bloques.flatMap((bloque) => bloque.slots);
    const ultimoIndiceOcupado = this.buscarUltimoIndiceOcupado(slotsPlanos);
    const primerLibreDespues = slotsPlanos
      .slice(ultimoIndiceOcupado + 1)
      .find((slot) => this.esSlotLibre(slot) && !slot.isOpenedGap);

    if (primerLibreDespues) {
      seleccionables.add(primerLibreDespues.uid);
    }

    return seleccionables;
  }

  private buscarUltimoIndiceOcupado(slots: SlotUI[]): number {
    for (let i = slots.length - 1; i >= 0; i -= 1) {
      if (!this.esSlotLibre(slots[i])) {
        return i;
      }
    }

    return -1;
  }

  private esSlotLibre(slot: SlotUI): boolean {
    const estado = String(slot.estado ?? '').toUpperCase();
    const tienePaciente = !!slot.pacienteNombres || !!slot.pacienteDocumento;

    if (slot.isOpenedGap) {
      return true;
    }

    if (estado.includes('OCUP')) {
      return false;
    }

    if (estado.includes('LIBRE') || estado.includes('DISPON')) {
      return true;
    }

    return !tienePaciente;
  }

  private existeSlotSeleccionadoValido(bloques: BloqueUI[], uid: string): boolean {
    for (const bloque of bloques) {
      for (const slot of bloque.slots) {
        if (slot.uid === uid) {
          return !!slot.isOpenedGap || this.selectableSlotUids().has(uid);
        }
      }
    }

    return false;
  }
}

