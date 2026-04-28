import { Injectable, NgZone, inject } from '@angular/core';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { TokenService } from '../../../core/auth/token.service';
import { AgendaDinamicaResponse } from '../models/agenda-dinamica.model';
import { AgendaUpdatedEvent } from '../models/agenda-updated-event.model';

export interface AgendaStreamQuery {
  medicoId: number;
  fecha: string;
}

export type AgendaStreamEvent =
  | { type: 'connected' }
  | { type: 'agenda-snapshot'; data: AgendaDinamicaResponse }
  | { type: 'agenda-updated'; data: AgendaUpdatedEvent };

@Injectable({
  providedIn: 'root',
})
export class AgendaSse {
  private readonly base = `${environment.apiUrl}`;
  private readonly tokenService = inject(TokenService);
  private abortController: AbortController | null = null;

  constructor(private readonly ngZone: NgZone) {}

  connect(query: AgendaStreamQuery): Observable<AgendaStreamEvent> {
    this.disconnect();

    return new Observable<AgendaStreamEvent>((subscriber) => {
      const url = new URL(`${this.base}/citas/agenda-dinamica/stream`);
      url.searchParams.set('medicoId', String(query.medicoId));
      url.searchParams.set('fecha', query.fecha);

      const headers: Record<string, string> = {
        Accept: 'text/event-stream',
        'Cache-Control': 'no-cache',
      };

      const token = this.tokenService.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const abortController = new AbortController();
      this.abortController = abortController;

      void fetchEventSource(url.toString(), {
        method: 'GET',
        headers,
        signal: abortController.signal,
        openWhenHidden: true,
        onopen: async (response) => {
          if (!response.ok) {
            throw new Error(`No se pudo abrir el stream SSE: ${response.status}`);
          }
        },
        onmessage: (event) => {
          this.ngZone.run(() => {
            if (event.event === 'connected') {
              subscriber.next({ type: 'connected' });
              return;
            }

            if (!event.data) {
              return;
            }

            if (event.event === 'agenda-snapshot') {
              subscriber.next({
                type: 'agenda-snapshot',
                data: JSON.parse(event.data) as AgendaDinamicaResponse,
              });
              return;
            }

            if (event.event === 'agenda-updated') {
              subscriber.next({
                type: 'agenda-updated',
                data: JSON.parse(event.data) as AgendaUpdatedEvent,
              });
            }
          });
        },
        onerror: (error) => {
          this.ngZone.run(() => subscriber.error(error));
          throw error;
        },
      }).catch((error) => {
        this.ngZone.run(() => {
          if (!subscriber.closed) {
            subscriber.error(error);
          }
        });
      });

      return () => {
        abortController.abort();
      };
    });
  }

  disconnect(): void {
    this.abortController?.abort();
    this.abortController = null;
  }
}
