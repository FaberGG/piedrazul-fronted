import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CitaResponse } from '../../features/agenda/models/agenda.models';

export interface HistorialPaciente {
  pacienteId: number;
  nombreCompleto: string;
  documento: string;
  citas: CitaResponse[];
}

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}`;

  exportarAgendaDiaria(medicoId: number, dia: string, exportFormat: string): Observable<Blob> {
    const params = new HttpParams()
      .set('medicoId', medicoId.toString())
      .set('dia', dia.toString())
      .set('exportFormat', exportFormat.toString());
    return this.http.get<Blob>(`${this.base}/reportes/citas/reporteDiario`, { params, responseType: 'blob' as 'json' });
  }

  getExportFormatos(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/reportes/formatos`);
  }

  getHistorialPaciente(pacienteId: number): Observable<HistorialPaciente> {
    return this.http.get<HistorialPaciente>(`${this.base}/citas/paciente/${pacienteId}`);
  }

  exportarHistorialPaciente(pacienteId: number): Observable<Blob> {
    const params = new HttpParams().set('pacienteId', pacienteId.toString());
    return this.http.get(`${this.base}/reportes/historial-paciente`, { params, responseType: 'blob' });
  }

  exportarAgendaDiaCompleta(dia: string): Observable<Blob> {
    const params = new HttpParams().set('dia', dia);
    return this.http.get(`${this.base}/reportes/agenda-dia-completa`, { params, responseType: 'blob' });
  }
}
