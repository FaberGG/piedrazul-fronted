import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MedicoModel } from '../models/medico.model';
import { environment } from '../../../../environments/environment';

export interface CitaDiaDtoFrontend {
  id: number;
  pacienteNombre: string;
  pacienteDocumento: string;
  fecha: string;
  hora: string;
  estado: string;
  observaciones: string | null;
}

export interface AgendaDiaDtoFrontend {
  medicoId: number;
  medicoNombre: string;
  especialidad: string;
  fecha: string;
  citas: CitaDiaDtoFrontend[];
}

@Injectable({ providedIn: 'root' })
export class MedicosService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/medicos`;

  listarActivos(especialidad?: string): Observable<MedicoModel[]> {
    let params = new HttpParams();
    if (especialidad) params = params.set('especialidad', especialidad);
    return this.http.get<MedicoModel[]>(this.base, { params });
  }

  getMedicoActual(): Observable<MedicoModel> {
    return this.http.get<MedicoModel>(`${this.base}/me`);
  }

  getAgendaCompleta(fecha: string): Observable<AgendaDiaDtoFrontend[]> {
    const params = new HttpParams().set('fecha', fecha);
    return this.http.get<AgendaDiaDtoFrontend[]>(`${environment.apiUrl}/citas/agenda-completa`, { params });
  }
}
