import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';


export interface KeycloakTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterMedicoRequest {
  username: string;
  nombres: string;
  apellidos: string;
  password: string;
  especialidad: string;
  tipo: string;
}

export interface RegisterAdminRequest {
  username: string;
  password: string;
}

export interface RegisterPacienteRequest {
  password: string;
  documento: string;
  nombres: string;
  apellidos: string;
  celular: string;
  correo: string;
  fechaNacimiento: string;
  genero: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private backendUrl = 'http://localhost:8080/api/v1/auth';
  private keycloakUrl = 'http://localhost:8180/realms/piedra-azul/protocol/openid-connect/token';
  private clientId = 'piedrazul-backend';
  private clientSecret = 'S5BTwSG8FJnxdOzbHYZfChn2p7jQYBCr';

  constructor(private http: HttpClient) {}

  login(data: LoginRequest): Observable<KeycloakTokenResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const body = new HttpParams()
      .set('grant_type', 'password')
      .set('client_id', this.clientId)
      .set('client_secret', this.clientSecret)
      .set('username', data.username)
      .set('password', data.password);

    return this.http.post<KeycloakTokenResponse>(this.keycloakUrl, body.toString(), { headers });
  }

  refreshToken(): Observable<KeycloakTokenResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const body = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('client_id', this.clientId)
      .set('client_secret', this.clientSecret)
      .set('refresh_token', this.obtenerRefreshToken() ?? '');

    return this.http.post<KeycloakTokenResponse>(this.keycloakUrl, body.toString(), { headers });
  }

  registerPaciente(data: RegisterPacienteRequest): Observable<void> {
    return this.http.post<void>(`${this.backendUrl}/register/paciente`, data);
  }

  registerMedico(data: RegisterMedicoRequest): Observable<void> {
    return this.http.post<void>(`${this.backendUrl}/register/medico`, data);
  }

  registerAdmin(data: RegisterAdminRequest): Observable<void> {
    return this.http.post<void>(`${this.backendUrl}/register/admin`, data);
  }

  guardarTokens(response: KeycloakTokenResponse): void {
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('access_token');
  }

  obtenerRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  eliminarTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  isAuthenticated(): boolean {
    return !!this.obtenerToken();
  }

  logout(): void {
    this.eliminarTokens();
  }
}



