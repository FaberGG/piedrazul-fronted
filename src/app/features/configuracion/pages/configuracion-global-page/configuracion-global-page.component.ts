import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  ConfiguracionAgendaService,
  DiaNoLaboralResponse,
  DiaNoLaboralRequest
} from '../../services/configuracion-agenda.service';

@Component({
  selector: 'app-configuracion-global-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './configuracion-global-page.component.html',
  styleUrls: ['./configuracion-global-page.component.css']
})
export class ConfiguracionGlobalPageComponent implements OnInit {

  formVentana!: FormGroup;
  formDia!: FormGroup;

  diasNoLaborales = signal<DiaNoLaboralResponse[]>([]);
  isLoadingVentana = signal(false);
  isLoadingDia = signal(false);
  isLoadingDias = signal(false);
  errorVentana = signal('');
  errorDia = signal('');
  successVentana = signal('');
  successDia = signal('');

  readonly semanas = [1,2,3,4,5,6,7,8,9,10,11,12];

  constructor(
    private fb: FormBuilder,
    private configuracionService: ConfiguracionAgendaService
  ) {}

  ngOnInit(): void {
    this.formVentana = this.fb.group({
      ventanaAgendamientoSemanas: [null, [Validators.required, Validators.min(1), Validators.max(12)]]
    });

    this.formDia = this.fb.group({
      fecha: ['', Validators.required],
      descripcion: ['']
    });

    this.cargarConfiguracion();
    this.cargarDiasNoLaborales();
  }

  cargarConfiguracion(): void {
    this.configuracionService.obtenerConfiguracion().subscribe({
      next: (config) => {
        this.formVentana.patchValue({ ventanaAgendamientoSemanas: config.ventanaAgendamientoSemanas });
      },
      error: () => {}
    });
  }

  cargarDiasNoLaborales(): void {
    this.isLoadingDias.set(true);
    this.configuracionService.listarDiasNoLaborales().subscribe({
      next: (dias) => {
        this.diasNoLaborales.set(dias);
        this.isLoadingDias.set(false);
      },
      error: () => { this.isLoadingDias.set(false); }
    });
  }

  guardarVentana(): void {
    if (this.formVentana.invalid) {
      this.formVentana.markAllAsTouched();
      return;
    }
    this.isLoadingVentana.set(true);
    this.errorVentana.set('');
    this.successVentana.set('');

    this.configuracionService.actualizarVentana(this.formVentana.value).subscribe({
      next: () => {
        this.successVentana.set('Ventana de agendamiento actualizada correctamente.');
        this.isLoadingVentana.set(false);
      },
      error: () => {
        this.errorVentana.set('Error al actualizar la ventana. Intente de nuevo.');
        this.isLoadingVentana.set(false);
      }
    });
  }

  agregarDia(): void {
    if (this.formDia.invalid) {
      this.formDia.markAllAsTouched();
      return;
    }
    this.isLoadingDia.set(true);
    this.errorDia.set('');
    this.successDia.set('');

    const request: DiaNoLaboralRequest = this.formDia.value;

    this.configuracionService.agregarDiaNoLaboral(request).subscribe({
      next: () => {
        this.successDia.set('Día no laboral agregado correctamente.');
        this.formDia.reset();
        this.cargarDiasNoLaborales();
        this.isLoadingDia.set(false);
      },
      error: () => {
        this.errorDia.set('Error al agregar el día. Intente de nuevo.');
        this.isLoadingDia.set(false);
      }
    });
  }

  eliminarDia(id: number): void {
    this.configuracionService.eliminarDiaNoLaboral(id).subscribe({
      next: () => this.cargarDiasNoLaborales(),
      error: () => {}
    });
  }

  isInvalid(form: FormGroup, field: string): boolean {
    const ctrl = form.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }
}