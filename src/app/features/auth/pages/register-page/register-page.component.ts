import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PacienteService } from '../../../pacientes/services/pacientes-service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css'
})
export class RegisterPageComponent {

  form: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private pacienteService: PacienteService
  ) {
    this.form = this.fb.group({
      nombres: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      apellidos: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]], // corregido
      documento: ['', [Validators.required, Validators.pattern(/^[0-9]{6,12}$/)]],
      celular: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      fechaNacimiento: [''],
      correo: ['', [Validators.required, Validators.email]],
      genero: ['', Validators.required],
      username: [''] // se llenará con el correo
    }, { validators: this.passwordsMatchValidator });

    // sincronizar username con correo
    this.form.get('correo')?.valueChanges.subscribe(value => {
      this.form.get('username')?.setValue(value, { emitEvent: false });
    });
  }

  passwordsMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  isInvalid(campo: string): boolean {
    const control = this.form.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  isValid(campo: string): boolean {
    const control = this.form.get(campo);
    return !!(control && control.valid && (control.dirty || control.touched));
  }

  getError(campo: string): string {
    const control = this.form.get(campo);
    if (!control || !(control.dirty || control.touched) || !control.errors) return '';
    const e = control.errors;

    if (e['required']) return 'Este campo es requerido.';

    switch (campo) {
      case 'nombres':
      case 'apellidos': // corregido
        if (e['minlength']) return 'Debe tener al menos 2 caracteres.';
        if (e['pattern'])   return 'Solo se permiten letras y espacios.';
        break;
      case 'documento':
        if (e['pattern']) return 'Ingrese entre 6 y 12 dígitos numéricos.';
        break;
      case 'celular':
        if (e['pattern']) return 'Ingrese exactamente 10 dígitos numéricos.';
        break;
      case 'password':
        if (e['minlength']) return 'La contraseña debe tener al menos 6 caracteres.';
        break;
      case 'correo':
        if (e['email']) return 'Ingrese un correo electrónico válido.';
        break;
    }
    return 'Valor inválido.';
  }

  getConfirmPasswordError(): string {
    const control = this.form.get('confirmPassword');
    if (!control || !(control.dirty || control.touched)) return '';
    if (control.errors?.['required']) return 'Este campo es requerido.';
    if (this.form.errors?.['passwordsMismatch'] && control.value) return 'Las contraseñas no coinciden.';
    return '';
  }

  isConfirmPasswordInvalid(): boolean {
    const control = this.form.get('confirmPassword');
    return !!(control && (control.dirty || control.touched) &&
      (control.errors?.['required'] || (this.form.errors?.['passwordsMismatch'] && control.value)));
  }

  isConfirmPasswordValid(): boolean {
    const control = this.form.get('confirmPassword');
    return !!(control && control.valid && !this.form.errors?.['passwordsMismatch'] && (control.dirty || control.touched));
  }

  validateOnInput(campo: string): void {
    const control = this.form.get(campo);
    control?.markAsDirty();
    control?.markAsTouched();
    control?.updateValueAndValidity({ emitEvent: true });
  }

  submit(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  this.isLoading.set(true);
  this.errorMessage.set('');

  const request = {
    username: this.form.value.username,        // se llena con el correo
    password: this.form.value.password,
    documento: this.form.value.documento,
    nombres: this.form.value.nombres,
    apellidos: this.form.value.apellidos,      // plural
    celular: this.form.value.celular,
    genero: this.form.value.genero,
    fechaNacimiento: this.form.value.fechaNacimiento,
    correo: this.form.value.correo
  };

  this.pacienteService.registrarPaciente(request).subscribe({
    next: (resp: any) => {
      console.log('Paciente registrado en backend:', resp);
      this.isLoading.set(false);
      this.router.navigate(['/login']);
    },
    error: (err: any) => {
      console.error('Error al registrar paciente:', err);
      this.isLoading.set(false);
      this.errorMessage.set('Error al registrar paciente');
    }
  });
}
}
