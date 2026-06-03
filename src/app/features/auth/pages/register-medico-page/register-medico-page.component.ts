import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { AuthService } from '../../../auth/services/auth.service';
import { RegisterMedicoRequest } from '../../../auth/models/auth.models';

@Component({
  selector: 'app-registrar-medico-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-medico-page.component.html',
  styleUrls: ['./register-medico-page.component.css']
})
export class RegistrarMedicoPageComponent {

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  private readonly _isLoading = signal(false);
  private readonly _errorMessage = signal('');
  private readonly _successMessage = signal('');

  readonly isLoading = this._isLoading.asReadonly();
  readonly errorMessage = this._errorMessage.asReadonly();
  readonly successMessage = this._successMessage.asReadonly();

  readonly especialidadesValidas: string[] = ['Terapia Neural', 'Quiropraxia', 'Fisioterapia'];
  readonly tiposValidos: string[] = ['MEDICO', 'TERAPISTA'];

  formMedico: FormGroup = this.fb.group({
    nombres:      ['', [Validators.required, Validators.pattern(/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/)]],
    apellidos:    ['', [Validators.required, Validators.pattern(/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/)]],
    genero:       ['', Validators.required],
    tipo:         ['', Validators.required],
    correo:       ['', [Validators.required, Validators.email]],
    contrasena:   ['', [Validators.required, Validators.minLength(6), this.passwordValidator]],
    especialidad: ['', Validators.required]
  });

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    const hasNumber = /\d/.test(value);
    return !hasNumber ? { noNumber: true } : null;
  }

  registrarMedico() {
    if (this.formMedico.invalid) {
      this.formMedico.markAllAsTouched();
      return;
    }

    this._isLoading.set(true);
    this._errorMessage.set('');

    const formValue = this.formMedico.value;


    const payload: RegisterMedicoRequest = {
      nombres: formValue.nombres,
      apellidos: formValue.apellidos,
      tipo: formValue.tipo,
      password: formValue.contrasena,
      especialidad: formValue.especialidad,
      username: formValue.correo
    };

    console.log('Payload enviado:', payload);

    this.authService.registerMedico(payload).subscribe({
      next: () => {
        this._isLoading.set(false);
        this._successMessage.set('¡Médico registrado exitosamente!');
        this._errorMessage.set('');
        this.formMedico.reset();
      },
      error: (err) => {
        this._isLoading.set(false);
        this._errorMessage.set(
          err.error?.message || 'Error al registrar médico.'
        );
      }
    });
  }

  isInvalid(form: FormGroup, field: string): boolean {
    const control = form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  isValid(form: FormGroup, field: string): boolean {
    const control = form.get(field);
    return !!(control && control.valid && control.touched);
  }

  validateOnInput(form: FormGroup, field: string) {
    form.get(field)?.markAsTouched();
  }

  getError(form: FormGroup, field: string): string {
    const control = form.get(field);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'Este campo es obligatorio';
    if (control.errors['email']) return 'Correo inválido';
    if (control.errors['minlength']) return 'Mínimo 6 caracteres';
    if (control.errors['pattern']) return 'Solo se permiten letras';
    if (control.errors['noNumber']) return 'Debe contener al menos un número';

    return 'Campo inválido';
  }
}
