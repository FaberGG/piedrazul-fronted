import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { RegisterMedicoRequest } from '../../models/auth.models';

const ESPECIALIDADES: { label: string; value: string }[] = [
  { label: 'Medicina General',  value: 'MEDICINA_GENERAL' },
  { label: 'Terapia Neural',    value: 'TERAPIA_NEURAL' },
  { label: 'Quiropraxia',       value: 'QUIROPRAXIA' },
  { label: 'Fisioterapia',      value: 'FISIOTERAPIA' },
];

const TIPOS: { label: string; value: string }[] = [
  { label: 'Médico',    value: 'MEDICO' },
  { label: 'Terapista', value: 'TERAPISTA' },
];

@Component({
  selector: 'app-registrar-usuarios-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registrar-usuarios-page.component.html',
  styleUrl: './registrar-usuarios-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegistrarUsuariosPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly especialidades = ESPECIALIDADES;
  readonly tipos = TIPOS;

  // ── Medico form ──────────────────────────────────────────────
  readonly formMedico: FormGroup = this.fb.group({
    nombres:      ['', [Validators.required, Validators.pattern(/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/)]],
    apellidos:    ['', [Validators.required, Validators.pattern(/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/)]],
    tipo:         ['', Validators.required],
    especialidad: ['', Validators.required],
    correo:       ['', [Validators.required, Validators.email]],
    contrasena:   ['', [Validators.required, Validators.minLength(6), this.passwordValidator]],
  });

  readonly cargandoMedico = signal(false);
  readonly exitoMedico    = signal(false);
  readonly errorMedico    = signal('');

  // ── Admin form ───────────────────────────────────────────────
  readonly formAdmin: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly cargandoAdmin = signal(false);
  readonly exitoAdmin    = signal(false);
  readonly errorAdmin    = signal('');

  // ── Helpers ──────────────────────────────────────────────────
  private passwordValidator(control: AbstractControl): ValidationErrors | null {
    return /\d/.test(control.value || '') ? null : { noNumber: true };
  }

  isInvalid(form: FormGroup, field: string): boolean {
    const c = form.get(field);
    return !!(c?.invalid && c.touched);
  }

  isValid(form: FormGroup, field: string): boolean {
    const c = form.get(field);
    return !!(c?.valid && c.touched);
  }

  touch(form: FormGroup, field: string): void {
    form.get(field)?.markAsTouched();
  }

  getError(form: FormGroup, field: string): string {
    const c = form.get(field);
    if (!c?.errors || !c.touched) return '';
    if (c.errors['required'])   return 'Campo obligatorio';
    if (c.errors['email'])      return 'Correo inválido';
    if (c.errors['minlength'])  return 'Mínimo 6 caracteres';
    if (c.errors['pattern'])    return 'Solo letras';
    if (c.errors['noNumber'])   return 'Debe incluir al menos un número';
    return 'Valor inválido';
  }

  // ── Submit medico ─────────────────────────────────────────────
  registrarMedico(): void {
    if (this.formMedico.invalid) { this.formMedico.markAllAsTouched(); return; }

    this.cargandoMedico.set(true);
    this.errorMedico.set('');
    this.exitoMedico.set(false);

    const v = this.formMedico.value;
    const payload: RegisterMedicoRequest = {
      nombres:      v.nombres,
      apellidos:    v.apellidos,
      tipo:         v.tipo,
      especialidad: v.especialidad,
      username:     v.correo,
      password:     v.contrasena,
    };

    this.authService.registerMedico(payload).subscribe({
      next: () => {
        this.cargandoMedico.set(false);
        this.exitoMedico.set(true);
        this.formMedico.reset();
      },
      error: (err) => {
        this.cargandoMedico.set(false);
        this.errorMedico.set(err.error?.message || 'Error al registrar.');
      }
    });
  }

  // ── Submit admin ──────────────────────────────────────────────
  registrarAdmin(): void {
    if (this.formAdmin.invalid) { this.formAdmin.markAllAsTouched(); return; }

    this.cargandoAdmin.set(true);
    this.errorAdmin.set('');
    this.exitoAdmin.set(false);

    this.authService.registerAdmin(this.formAdmin.value).subscribe({
      next: () => {
        this.cargandoAdmin.set(false);
        this.exitoAdmin.set(true);
        this.formAdmin.reset();
      },
      error: (err) => {
        this.cargandoAdmin.set(false);
        this.errorAdmin.set(err.error?.message || 'Error al registrar.');
      }
    });
  }
}
