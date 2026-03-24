import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { PacienteBusqueda } from '../models/paciente-busqueda.model';
import { PacienteDetalle } from '../models/paciente-detalle.model';

@Injectable({ providedIn: 'root' })
export class PacientesAgendaService {
  private readonly http = inject(HttpClient);

  buscarPorDocumento(documento: string, limit = 5): Observable<PacienteBusqueda[]> {
    const params = new HttpParams().set('documento', documento).set('limit', String(limit));

    return this.http.get<PacienteBusqueda[]>(`${environment.apiUrl}/pacientes/buscar`, { params });
  }

  obtenerPorId(id: number): Observable<PacienteDetalle> {
    return this.http.get<PacienteDetalle>(`${environment.apiUrl}/pacientes/${id}`);
  }
}

