import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuditoriaPage } from '../models/auditoria.model';

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/auditoria`;

  listar(filters: {
    accion?: string;
    entidad?: string;
    desde?: string;
    hasta?: string;
    page: number;
    size: number;
  }): Observable<AuditoriaPage> {
    let params = new HttpParams()
      .set('page', filters.page.toString())
      .set('size', filters.size.toString());

    if (filters.accion) params = params.set('accion', filters.accion);
    if (filters.entidad) params = params.set('entidad', filters.entidad);
    if (filters.desde) params = params.set('desde', filters.desde);
    if (filters.hasta) params = params.set('hasta', filters.hasta);

    return this.http.get<AuditoriaPage>(this.base, { params });
  }
}
