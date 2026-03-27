import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
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

  // 👉 Método para ir al registro
  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
