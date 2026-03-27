import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-register-admin-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-admin-page.component.html',
  styleUrls: ['./register-admin-page.component.css']
})
export class RegisterAdminPageComponent {

  formAdmin: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.formAdmin = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
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
    if (campo === 'username' && e['email']) return 'Ingrese un correo electrónico válido.';
    if (campo === 'password' && e['minlength']) return 'La contraseña debe tener al menos 6 caracteres.';

    return 'Valor inválido.';
  }

  validateOnInput(form: FormGroup, campo: string): void {
    const c = form.get(campo);
    c?.markAsDirty();
    c?.markAsTouched();
    c?.updateValueAndValidity();
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
        this.formAdmin.reset();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Error al registrar administrador.');
      }
    });
  }
}
