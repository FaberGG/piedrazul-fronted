import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { AgendaDinamicaResponse } from '../models/agenda-dinamica.model';
import {
  CitaManualResponse,
  CrearCitaManualRequest,
  CrearCitaPrioridadRequest
} from '../models/cita-manual.model';
import { DisponibilidadGlobal } from '../models/disponibilidad.model';

@Injectable({ providedIn: 'root' })
export class AgendaManualService {
  private readonly http = inject(HttpClient);

  obtenerAgendaDinamica(medicoId: number, fecha: string): Observable<AgendaDinamicaResponse> {
    const params = new HttpParams().set('medicoId', String(medicoId)).set('fecha', fecha);

    return this.http.get<AgendaDinamicaResponse>(`${environment.apiUrl}/citas/agenda-dinamica`, { params });
  }

  obtenerPrimeraDisponibilidadMedico(medicoId: number): Observable<DisponibilidadGlobal> {
    const params = new HttpParams().set('medicoId', String(medicoId));

    return this.http.get<DisponibilidadGlobal>(`${environment.apiUrl}/citas/disponibilidad/primera`, { params });
  }

  obtenerPrimeraDisponibilidadGlobal(): Observable<DisponibilidadGlobal> {
    return this.http.get<DisponibilidadGlobal>(`${environment.apiUrl}/citas/disponibilidad/primera/global`);
  }

  crearCitaManual(payload: CrearCitaManualRequest): Observable<CitaManualResponse> {
    return this.http.post<CitaManualResponse>(`${environment.apiUrl}/citas/manual`, payload);
  }

  abrirEspacioPrioritario(payload: CrearCitaPrioridadRequest): Observable<CitaManualResponse> {
    return this.http.post<CitaManualResponse>(`${environment.apiUrl}/citas/prioridad`, payload);
  }
}

