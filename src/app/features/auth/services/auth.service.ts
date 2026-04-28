import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { RegisterAdminRequest, RegisterMedicoRequest, RegisterPacienteRequest } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly backendUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  registerPaciente(data: RegisterPacienteRequest): Observable<void> {
    return this.http.post<void>(`${this.backendUrl}/register/paciente`, data);
  }

  registerMedico(data: RegisterMedicoRequest): Observable<void> {
    return this.http.post<void>(`${this.backendUrl}/register/medico`, data);
  }

  registerAdmin(data: RegisterAdminRequest): Observable<void> {
    return this.http.post<void>(`${this.backendUrl}/register/admin`, data);
  }
}
