import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MedicoService,
  MedicoListadoResponse,
  ConfiguracionAgendaMedicoResponse,
  DayOfWeek,
  DIAS_SEMANA,
  INTERVALOS
} from '../../services/Medico.service';

@Component({
  selector: 'app-configuracion-medico-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './configuracion-medico-page.component.html',
  styleUrls: ['./configuracion-medico-page.component.css']
})
export class ConfiguracionMedicoPageComponent implements OnInit {

  // Datos
  medicos = signal<MedicoListadoResponse[]>([]);
  medicoSeleccionado = signal<ConfiguracionAgendaMedicoResponse | null>(null);

  // Estado
  isLoadingMedicos = signal(false);
  isLoadingConfig  = signal(false);
  isGuardando      = signal(false);
  error            = signal('');
  success          = signal('');

  // Opciones estáticas
  readonly diasSemana  = DIAS_SEMANA;
  readonly intervalos  = INTERVALOS;

  // Form
  form!: FormGroup;
  diasSeleccionados = signal<DayOfWeek[]>([]);

  constructor(
    private fb: FormBuilder,
    private medicoService: MedicoService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      horaInicio:       ['', Validators.required],
      horaFin:          ['', Validators.required],
      intervaloMinutos: [null, Validators.required]
    });

    this.cargarMedicos();
  }

 cargarMedicos(): void {
  this.isLoadingMedicos.set(true);
  this.medicoService.listarMedicos().subscribe({
    next: (lista) => {
      console.log('Médicos:', lista); // ← ver qué devuelve
      this.medicos.set(lista);
      this.isLoadingMedicos.set(false);
    },
    error: (err) => {
      console.error('Error al cargar médicos:', err); // ← ver el error
      this.isLoadingMedicos.set(false);
    }
  });
}

  seleccionarMedico(medico: MedicoListadoResponse): void {
    this.error.set('');
    this.success.set('');
    this.isLoadingConfig.set(true);
    this.medicoSeleccionado.set(null);

    this.medicoService.obtenerConfiguracion(medico.id).subscribe({
      next: (config) => {
        this.medicoSeleccionado.set(config);
        this.diasSeleccionados.set(config.diasAtencion ?? []);
        this.form.patchValue({
          horaInicio:       config.horaInicio?.substring(0, 5) ?? '',
          horaFin:          config.horaFin?.substring(0, 5) ?? '',
          intervaloMinutos: config.intervaloMinutos ?? null
        });
        this.isLoadingConfig.set(false);
      },
      error: () => {
        // Sin configuración previa — form vacío
        this.diasSeleccionados.set([]);
        this.form.reset();
        this.isLoadingConfig.set(false);
      }
    });
  }

  toggleDia(dia: DayOfWeek): void {
    const actuales = this.diasSeleccionados();
    if (actuales.includes(dia)) {
      this.diasSeleccionados.set(actuales.filter(d => d !== dia));
    } else {
      this.diasSeleccionados.set([...actuales, dia]);
    }
  }

  isDiaSeleccionado(dia: DayOfWeek): boolean {
    return this.diasSeleccionados().includes(dia);
  }

  guardar(): void {
    const medico = this.medicoSeleccionado();
    if (!medico) return;

    if (this.form.invalid || this.diasSeleccionados().length === 0) {
      this.form.markAllAsTouched();
      if (this.diasSeleccionados().length === 0) {
        this.error.set('Seleccione al menos un día de atención.');
      }
      return;
    }

    const horaInicio: string = this.form.value.horaInicio;
    const horaFin: string    = this.form.value.horaFin;
    if (horaInicio >= horaFin) {
      this.error.set('La hora de inicio debe ser anterior a la hora de fin.');
      return;
    }

    this.isGuardando.set(true);
    this.error.set('');
    this.success.set('');

    this.medicoService.configurarAgenda(medico.medicoId, {
      diasAtencion:     this.diasSeleccionados(),
      horaInicio:       horaInicio,
      horaFin:          horaFin,
      intervaloMinutos: this.form.value.intervaloMinutos
    }).subscribe({
      next: (updated) => {
        this.medicoSeleccionado.set(updated);
        this.success.set('Configuración guardada correctamente.');
        this.isGuardando.set(false);
      },
      error: () => {
        this.error.set('Error al guardar la configuración. Intente de nuevo.');
        this.isGuardando.set(false);
      }
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }
}