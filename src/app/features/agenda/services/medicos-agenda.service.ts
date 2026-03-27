import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { MedicoAgenda } from '../models/medico-agenda.model';
import { MedicoConfiguracion } from '../models/medico-configuracion.model';

@Injectable({ providedIn: 'root' })
export class MedicosAgendaService {
  private readonly http = inject(HttpClient);

  obtenerMedicos(): Observable<MedicoAgenda[]> {
    return this.http.get<MedicoAgenda[]>(`${environment.apiUrl}/medicos`);
  }

  obtenerConfiguracionMedico(medicoId: number): Observable<MedicoConfiguracion> {
    return this.http.get<MedicoConfiguracion>(`${environment.apiUrl}/medicos/${medicoId}/configuracion`);
  }
}

