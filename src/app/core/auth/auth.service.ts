import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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

interface KeycloakTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenService = inject(TokenService);

  private readonly keycloakUrl = `${environment.keycloakUrl}/realms/piedra-azul/protocol/openid-connect/token`;
  private readonly clientId = 'piedrazul-backend';
  private readonly clientSecret = 'aExogrb55E5lYtM7HeiFXFfj1kZJDW8m';

  private readonly currentUserState = signal<User | null>(this.userFromStoredToken());

  readonly currentUser = computed(() => this.currentUserState());

  login(credentials: LoginRequest): Observable<User> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const body = new HttpParams()
      .set('grant_type', 'password')
      .set('client_id', this.clientId)
      .set('client_secret', this.clientSecret)
      .set('username', credentials.username)
      .set('password', credentials.password);

    return this.http.post<KeycloakTokenResponse>(this.keycloakUrl, body.toString(), { headers }).pipe(
      tap(response => {
        this.tokenService.setToken(response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
      }),
      map(response => this.userFromToken(response.access_token)),
      tap(user => this.currentUserState.set(user))
    );
  }

  logout(): void {
    this.tokenService.clearToken();
    localStorage.removeItem('refresh_token');
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
    if (!this.tokenService.hasValidToken()) return null;
    return this.userFromToken(this.tokenService.getToken());
  }

  private userFromToken(token: string | null): User {
    const payload = this.tokenService.getPayload(token);
    const roles: string[] = (payload as any)?.realm_access?.roles ?? [];

    const rol = roles.find(r => ['ADMIN', 'MEDICO', 'PACIENTE', 'AGENDADOR'].includes(r)) ?? '';

    return {
      id: Number(payload?.id ?? 0),
      username: String(payload?.['preferred_username'] ?? payload?.sub ?? ''),
      nombreCompleto: String(payload?.['name']?? payload?.['preferred_username'] ?? ''),
      rol
    };
  }

  private isKnownRole(role: string | undefined): role is Role {
    return role === ROLES.ADMIN || role === ROLES.AGENDADOR || role === ROLES.MEDICO || role === ROLES.PACIENTE;
  }
}