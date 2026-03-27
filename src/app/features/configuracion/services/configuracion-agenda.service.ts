import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ConfiguracionAgendaRequest {
  ventanaAgendamientoSemanas: number;
}

export interface ConfiguracionAgendaResponse {
  ventanaAgendamientoSemanas: number;
}

export interface DiaNoLaboralRequest {
  fecha: string; // ISO format: 'YYYY-MM-DD'
  descripcion?: string;
}

export interface DiaNoLaboralResponse {
  id: number;
  fecha: string;
  descripcion?: string;
}

@Injectable({ providedIn: 'root' })
export class ConfiguracionAgendaService {

  private readonly base = 'http://localhost:8080/api/v1/configuracion/agenda';

  constructor(private http: HttpClient) {}

  obtenerConfiguracion(): Observable<ConfiguracionAgendaResponse> {
    return this.http.get<ConfiguracionAgendaResponse>(this.base);
  }

  actualizarVentana(request: ConfiguracionAgendaRequest): Observable<ConfiguracionAgendaResponse> {
    return this.http.put<ConfiguracionAgendaResponse>(`${this.base}/ventana`, request);
  }

  listarDiasNoLaborales(): Observable<DiaNoLaboralResponse[]> {
    return this.http.get<DiaNoLaboralResponse[]>(`${this.base}/dias-no-laborales`);
  }

  agregarDiaNoLaboral(request: DiaNoLaboralRequest): Observable<DiaNoLaboralResponse> {
    return this.http.post<DiaNoLaboralResponse>(`${this.base}/dias-no-laborales`, request);
  }

  eliminarDiaNoLaboral(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/dias-no-laborales/${id}`);
  }
}