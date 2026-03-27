import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

export type DayOfWeek =
  | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY'
  | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export const DIAS_SEMANA: { valor: DayOfWeek; etiqueta: string }[] = [
  { valor: 'MONDAY',    etiqueta: 'Lunes' },
  { valor: 'TUESDAY',   etiqueta: 'Martes' },
  { valor: 'WEDNESDAY', etiqueta: 'Miércoles' },
  { valor: 'THURSDAY',  etiqueta: 'Jueves' },
  { valor: 'FRIDAY',    etiqueta: 'Viernes' },
  { valor: 'SATURDAY',  etiqueta: 'Sábado' },
  { valor: 'SUNDAY',    etiqueta: 'Domingo' },
];

export const INTERVALOS: number[] = [5, 10, 15, 20, 30, 45, 60];

export interface MedicoListadoResponse {
  id: number;
  nombresCompletos: string;
  especialidad: string;
  tipo: string;
  activo: boolean;
  intervaloMinutos: number;
}

export interface ConfiguracionAgendaMedicoResponse {
  medicoId: number;
  medicoNombre: string;
  especialidad: string;
  activo: boolean;
  diasAtencion: DayOfWeek[];
  horaInicio: string;
  horaFin: string;
  intervaloMinutos: number;
  capacidadDiaria: number;
}

export interface ConfigurarAgendaMedicoRequest {
  diasAtencion: DayOfWeek[];
  horaInicio: string;
  horaFin: string;
  intervaloMinutos: number;
}

@Injectable({ providedIn: 'root' })
export class MedicoService {
  private readonly base = 'http://localhost:8080/api/v1/medicos';

  constructor(private http: HttpClient) {}

  listarMedicos(especialidad?: string): Observable<MedicoListadoResponse[]> {
    let params = new HttpParams();
    if (especialidad) {
      params = params.set('especialidad', especialidad);
    }
    return this.http.get<MedicoListadoResponse[]>(this.base, { params });
  }

  obtenerConfiguracion(medicoId: number): Observable<ConfiguracionAgendaMedicoResponse> {
    return this.http.get<ConfiguracionAgendaMedicoResponse>(`${this.base}/${medicoId}/configuracion`);
  }

  configurarAgenda(medicoId: number, request: ConfigurarAgendaMedicoRequest): Observable<ConfiguracionAgendaMedicoResponse> {
    return this.http.put<ConfiguracionAgendaMedicoResponse>(`${this.base}/${medicoId}/configuracion`, request);
  }
}