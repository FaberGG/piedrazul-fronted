import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Output, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, filter, of, switchMap, tap } from 'rxjs';

import { InputCompartidoComponent } from '../../../../shared/components/input-compartido/input-compartido.component';
import { PacienteFormulario } from '../../models/cita-manual.model';
import { GeneroPaciente, PacienteDetalle } from '../../models/paciente-detalle.model';
import { PacienteBusqueda } from '../../models/paciente-busqueda.model';
import { PacientesAgendaService } from '../../services/pacientes-agenda.service';

@Component({
  selector: 'app-formulario-paciente',
  imports: [CommonModule, ReactiveFormsModule, InputCompartidoComponent],
  templateUrl: './formulario-paciente.component.html',
  styleUrl: './formulario-paciente.component.css'
})
export class FormularioPacienteComponent {
      @Output() readonly pacienteChange = new EventEmitter<{ paciente: PacienteFormulario; valido: boolean }>();

  private readonly fb = inject(FormBuilder);
  private readonly pacientesService = inject(PacientesAgendaService);
  private readonly destroyRef = inject(DestroyRef);

  readonly generos: GeneroPaciente[] = ['MASCULINO', 'FEMENINO', 'OTRO'];

  readonly form = this.fb.group({
    documento: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
    nombres: this.fb.nonNullable.control('', Validators.required),
    apellidos: this.fb.nonNullable.control('', Validators.required),
    celular: this.fb.nonNullable.control('', Validators.required),
    genero: this.fb.nonNullable.control<GeneroPaciente | ''>('', Validators.required),
    fechaNacimiento: this.fb.control<string | null>(null),
    correo: this.fb.control<string | null>(null, Validators.email)
  });

  readonly sugerencias = signal<PacienteBusqueda[]>([]);
  readonly cargandoSugerencias = signal(false);
  readonly mostrarSugerencias = signal(false);
  readonly indiceActivo = signal(0);
  readonly pacienteAutocompletado = signal(false);

  readonly haySugerencias = computed(() => this.sugerencias().length > 0);

  private documentoAutocompletado: string | null = null;

  constructor() {
    this.escucharDocumento();

    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.emitirEstadoPaciente();
    });

    this.form.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.emitirEstadoPaciente();
    });

    this.emitirEstadoPaciente();
  }

  seleccionarSugerencia(sugerencia: PacienteBusqueda): void {
    this.pacientesService
      .obtenerPorId(sugerencia.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((paciente) => {
        this.aplicarPacienteExistente(paciente);
      });
  }

  onDocumentoKeyDown(event: KeyboardEvent): void {
    if (!this.haySugerencias()) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.indiceActivo.update((index) => Math.min(index + 1, this.sugerencias().length - 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.indiceActivo.update((index) => Math.max(index - 1, 0));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const sugerencia = this.sugerencias()[this.indiceActivo()];
      if (sugerencia) {
        this.seleccionarSugerencia(sugerencia);
      }
      return;
    }

    if (event.key === 'Tab') {
      const sugerencia = this.sugerencias()[this.indiceActivo()] ?? this.sugerencias()[0];
      if (sugerencia) {
        event.preventDefault();
        this.seleccionarSugerencia(sugerencia);
      }
      return;
    }

    if (event.key === 'Escape') {
      this.ocultarSugerencias();
    }
  }

  onDocumentoBlur(): void {
    window.setTimeout(() => this.ocultarSugerencias(), 100);
  }

  onDocumentoFocus(): void {
    if (this.haySugerencias()) {
      this.mostrarSugerencias.set(true);
    }
  }

  onHoverSugerencia(index: number): void {
    this.indiceActivo.set(index);
  }

  obtenerNombreCompleto(): string {
    const nombres = this.form.controls.nombres.value ?? '';
    const apellidos = this.form.controls.apellidos.value ?? '';
    return `${nombres} ${apellidos}`.trim();
  }

  private escucharDocumento(): void {
    this.form.controls.documento.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((documento) => this.onDocumentoMutado(documento ?? '')),
        debounceTime(220),
        distinctUntilChanged(),
        filter(() => !this.pacienteAutocompletado()),
        switchMap((documento) => {
          const documentoLimpio = (documento ?? '').trim();

          if (documentoLimpio.length < 2) {
            this.sugerencias.set([]);
            this.mostrarSugerencias.set(false);
            this.cargandoSugerencias.set(false);
            return of([] as PacienteBusqueda[]);
          }

          this.cargandoSugerencias.set(true);

          return this.pacientesService.buscarPorDocumento(documentoLimpio).pipe(
            tap({
              next: () => this.cargandoSugerencias.set(false),
              error: () => this.cargandoSugerencias.set(false)
            }),
            catchError(() => of([] as PacienteBusqueda[]))
          );
        })
      )
      .subscribe((resultado) => {
        this.sugerencias.set(resultado);
        this.indiceActivo.set(0);
        this.mostrarSugerencias.set(resultado.length > 0);
      });
  }

  private onDocumentoMutado(documento: string): void {
    if (this.documentoAutocompletado && documento !== this.documentoAutocompletado) {
      this.limpiarCamposPaciente();
      this.habilitarCamposPaciente();
      this.pacienteAutocompletado.set(false);
      this.documentoAutocompletado = null;
      this.emitirEstadoPaciente();
    }
  }

  private aplicarPacienteExistente(paciente: PacienteDetalle): void {
    this.documentoAutocompletado = paciente.documento;
    this.pacienteAutocompletado.set(true);

    this.form.patchValue({
      documento: paciente.documento,
      nombres: paciente.nombres,
      apellidos: paciente.apellidos,
      celular: paciente.celular,
      genero: paciente.genero,
      fechaNacimiento: paciente.fechaNacimiento ?? null,
      correo: paciente.correo ?? null
    });

    this.form.controls.nombres.disable();
    this.form.controls.apellidos.disable();
    this.form.controls.celular.disable();
    this.form.controls.genero.disable();
    this.form.controls.fechaNacimiento.disable();
    this.form.controls.correo.disable();

    this.ocultarSugerencias();
    this.emitirEstadoPaciente();
  }

  private limpiarCamposPaciente(): void {
    this.form.patchValue({
      nombres: '',
      apellidos: '',
      celular: '',
      genero: '',
      fechaNacimiento: null,
      correo: null
    });
  }

  private habilitarCamposPaciente(): void {
    this.form.controls.nombres.enable();
    this.form.controls.apellidos.enable();
    this.form.controls.celular.enable();
    this.form.controls.genero.enable();
    this.form.controls.fechaNacimiento.enable();
    this.form.controls.correo.enable();
  }

  private ocultarSugerencias(): void {
    this.mostrarSugerencias.set(false);
    this.sugerencias.set([]);
  }

  private emitirEstadoPaciente(): void {
    const raw = this.form.getRawValue();

    this.pacienteChange.emit({
      paciente: {
        documento: raw.documento ?? '',
        nombres: raw.nombres ?? '',
        apellidos: raw.apellidos ?? '',
        celular: raw.celular ?? '',
        genero: raw.genero ?? '',
        fechaNacimiento: raw.fechaNacimiento,
        correo: raw.correo
      },
      valido: this.form.valid
    });
  }
}

