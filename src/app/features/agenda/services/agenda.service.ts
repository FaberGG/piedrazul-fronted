import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AgendarAutonomoRequest, CitaResponse, FranjaDisponible, MedicoResumen } from '../models/agenda.models';

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}`;

  listarMedicosActivos(): Observable<MedicoResumen[]> {
    return this.http.get<MedicoResumen[]>(`${this.base}/medicos`);
  }

  obtenerFranjasDisponibles(medicoId: number, fecha: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/agenda/disponibilidad/${medicoId}/${fecha}`);
  }

  agendarCita(request: AgendarAutonomoRequest): Observable<CitaResponse> {
    return this.http.post<CitaResponse>(`${this.base}/agenda/autonomo`, request);
  }
}