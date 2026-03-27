import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AgendarAutonomoRequest, CitaResponse, MedicoResumen } from '../models/agenda.models';
import { AgendaModel } from '../models/cita.model';

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}`;

  // RF1
  listarAgendaMedico(medicoId: number, fecha: string): Observable<AgendaModel> {
    const params = new HttpParams()
      .set('medicoId', medicoId.toString())
      .set('fecha', fecha);
    return this.http.get<AgendaModel>(`${this.base}/citas/agenda`, { params });
  }

  // RF3
  listarMedicosActivos(): Observable<MedicoResumen[]> {
    return this.http.get<MedicoResumen[]>(`${this.base}/medicos`);
  }

  obtenerFranjasDisponibles(medicoId: number, fecha: string): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.base}/citas/disponibilidad/franjas?medicoId=${medicoId}&fecha=${fecha}`
    );
  }

  agendarCita(request: AgendarAutonomoRequest): Observable<CitaResponse> {
    return this.http.post<CitaResponse>(`${this.base}/citas/autonomo`, request);
  }
}