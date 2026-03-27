import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';


@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css']
})
export class AdminPageComponent {

  formularioActivo: 'admin' | 'medico' | null = null;
  isLoading = signal(false);
  errorMessage = signal('');

  tiposValidos = ['MEDICO', 'TERAPISTA'];
  especialidadesValidas = ['Terapia Neural', 'Quiropraxia', 'Fisioterapia'];

  formMedico: FormGroup;
  formAdmin: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.formMedico = this.fb.group({
      nombres:      ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      apellidos:    ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      correo:       ['', [Validators.required, Validators.email]],
      contrasena:   ['', [Validators.required, Validators.minLength(6)]],
      especialidad: ['', Validators.required],  // sin validador custom, el select solo deja elegir opciones válidas
      genero:       ['', Validators.required],
      tipo:         ['', Validators.required]   // sin validador custom, el select solo deja elegir opciones válidas
    });

    this.formAdmin = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  mostrarFormulario(tipo: 'admin' | 'medico') {
    this.formularioActivo = tipo;
    this.errorMessage.set('');
    this.formMedico.reset();
    this.formAdmin.reset();
  }

  isInvalid(form: FormGroup, campo: string): boolean {
    const c = form.get(campo);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  isValid(form: FormGroup, campo: string): boolean {
    const c = form.get(campo);
    return !!(c && c.valid && (c.dirty || c.touched));
  }

  getError(form: FormGroup, campo: string): string {
    const c = form.get(campo);
    if (!c || !(c.dirty || c.touched) || !c.errors) return '';
    const e = c.errors;

    if (e['required']) return 'Este campo es requerido.';

    switch (campo) {
      case 'nombres':
      case 'apellidos':
        if (e['pattern']) return 'Solo se permiten letras y espacios.';
        break;
      case 'correo':
      case 'username':
        if (e['email']) return 'Ingrese un correo electrónico válido.';
        break;
      case 'contrasena':
      case 'password':
        if (e['minlength']) return 'La contraseña debe tener al menos 6 caracteres.';
        break;
    }
    return 'Valor inválido.';
  }

  validateOnInput(form: FormGroup, campo: string): void {
    const c = form.get(campo);
    c?.markAsDirty();
    c?.markAsTouched();
    c?.updateValueAndValidity();
  }

  registrarMedico(): void {
    if (this.formMedico.invalid) {
      this.formMedico.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.registerMedico(this.formMedico.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        alert('¡Médico registrado exitosamente!');
        this.formularioActivo = null;
        this.formMedico.reset();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Error al registrar médico.');
      }
    });
  }

  registrarAdmin(): void {
    if (this.formAdmin.invalid) {
      this.formAdmin.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.registerAdmin(this.formAdmin.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        alert('¡Administrador registrado exitosamente!');
        this.formularioActivo = null;
        this.formAdmin.reset();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Error al registrar administrador.');
      }
    });
  }
}