import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ReporteService {
    private readonly http = inject(HttpClient);
    private readonly base = `${environment.apiUrl}`;


    exportarAgendaDiaria(medicoId: number, dia: string, exportFormat: string): Observable<Blob> {
        const params = new HttpParams()
            .set('medicoId', medicoId.toString())
            .set('dia', dia.toString())
            .set('exportFormat', exportFormat.toString());

        return this.http.get<Blob>(`${this.base}/reportes/citas/reporteDiario`, {params, responseType: 'blob' as 'json'});
    }

    getExportFormatos(): Observable<string[]> {
        return this.http.get<string[]>(`${this.base}/reportes/formatos`);
    }

}