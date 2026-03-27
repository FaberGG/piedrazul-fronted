import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AgendaModel } from '../models/cita.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/citas`;

  listarAgendaMedico(medicoId: number, fecha: string): Observable<AgendaModel> {
    const params = new HttpParams()
      .set('medicoId', medicoId.toString())
      .set('fecha', fecha);
    return this.http.get<AgendaModel>(`${this.base}/agenda`, { params });
  }
}
