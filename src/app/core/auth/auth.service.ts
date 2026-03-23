import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Role, ROLES } from '../../shared/constants/roles';
import { User } from '../models/user.model';
import { TokenService } from './token.service';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenService = inject(TokenService);

  private readonly currentUserState = signal<User | null>(this.userFromStoredToken());

  readonly currentUser = computed(() => this.currentUserState());

  login(credentials: LoginRequest): Observable<User> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => this.tokenService.setToken(response.token)),
        map((response) => this.userFromToken(response.token)),
        tap((user) => this.currentUserState.set(user))
      );
  }

  logout(): void {
    this.tokenService.clearToken();
    this.currentUserState.set(null);
    void this.router.navigateByUrl('/login');
  }

  isAuthenticated(): boolean {
    return this.tokenService.hasValidToken();
  }

  getCurrentRole(): Role | null {
    const role = this.currentUserState()?.rol;
    return this.isKnownRole(role) ? role : null;
  }

  getHomeRouteForRole(role: Role | null): string {
    switch (role) {
      case ROLES.PACIENTE:
        return '/paciente/agendar';
      case ROLES.ADMIN:
      case ROLES.AGENDADOR:
      case ROLES.MEDICO:
        return '/agenda';
      default:
        return '/login';
    }
  }

  private userFromStoredToken(): User | null {
    if (!this.tokenService.hasValidToken()) {
      return null;
    }

    const token = this.tokenService.getToken();
    return this.userFromToken(token);
  }

  private userFromToken(token: string | null): User {
    const payload = this.tokenService.getPayload(token);
    return {
      id: Number(payload?.id ?? 0),
      username: String(payload?.username ?? payload?.sub ?? ''),
      nombreCompleto: String(payload?.nombreCompleto ?? payload?.username ?? payload?.sub ?? ''),
      rol: String(payload?.rol ?? '')
    };
  }

  private isKnownRole(role: string | undefined): role is Role {
    return role === ROLES.ADMIN || role === ROLES.AGENDADOR || role === ROLES.MEDICO || role === ROLES.PACIENTE;
  }
}

