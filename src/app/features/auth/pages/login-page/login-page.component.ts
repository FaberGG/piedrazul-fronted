import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  template: `
    <section class="login-page">
      <h1>Iniciar sesion</h1>
      <form [formGroup]="form" (ngSubmit)="submit()" class="login-page__form">
        <label>
          Usuario
          <input type="text" formControlName="username" />
        </label>

        <label>
          Contrasena
          <input type="password" formControlName="password" />
        </label>

        @if (errorMessage()) {
          <p class="login-page__error">{{ errorMessage() }}</p>
        }

        <button type="submit" [disabled]="form.invalid || isLoading()">
          {{ isLoading() ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>
    </section>
  `,
  styles: [
    `
      .login-page {
        max-width: 360px;
        margin: 3rem auto;
        padding: 1rem;
      }

      .login-page__form {
        display: grid;
        gap: 0.75rem;
      }

      .login-page__error {
        color: #b91c1c;
        margin: 0;
      }

      label {
        display: grid;
        gap: 0.25rem;
      }
    `
  ]
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid || this.isLoading()) {
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.isLoading.set(false);
        const target = this.authService.getHomeRouteForRole(this.authService.getCurrentRole());
        void this.router.navigateByUrl(target);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Credenciales invalidas. Intenta nuevamente.');
      }
    });
  }
}
