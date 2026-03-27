import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MedicoModel } from '../models/medico.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MedicosService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/medicos`;

  listarActivos(especialidad?: string): Observable<MedicoModel[]> {
    let params = new HttpParams();
    if (especialidad) params = params.set('especialidad', especialidad);
    return this.http.get<MedicoModel[]>(this.base, { params });
  }
}
