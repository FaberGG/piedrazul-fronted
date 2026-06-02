import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  // URL base del AuthController
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  // Registro de paciente → POST /api/v1/auth/register/paciente
  registrarPaciente(paciente: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/paciente`, paciente);
  }

  // Ejemplo de otros métodos:
  listarPacientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pacientes`);
  }

  buscarPacientes(nombre: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pacientes/buscar`, { params: { nombre } });
  }

  obtenerPaciente(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/pacientes/${id}`);
  }
}
