import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CitaResponse } from '../../agenda/models/agenda.models';
import { PacientePerfil } from '../models/paciente-perfil.model';

@Injectable({ providedIn: 'root' })
export class PacientePortalService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  puedeAgendarEspecialidad(): Observable<{ puedeEspecialidad: boolean }> {
    return this.http.get<{ puedeEspecialidad: boolean }>(
      `${this.base}/citas/autonomo/puede-especialidad`
    );
  }

  getMisCitas(): Observable<CitaResponse[]> {
    return this.http.get<CitaResponse[]>(`${this.base}/citas/paciente/me`);
  }

  getMiPerfil(): Observable<PacientePerfil> {
    return this.http.get<PacientePerfil>(`${this.base}/pacientes/me`);
  }
}
