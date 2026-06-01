import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditoriaService } from '../../services/auditoria.service';
import { AuditoriaLog, ACCIONES_AUDITORIA } from '../../models/auditoria.model';

@Component({
  selector: 'app-auditoria-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auditoria-page.component.html',
  styleUrl: './auditoria-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuditoriaPageComponent implements OnInit {
  private readonly auditoriaService = inject(AuditoriaService);

  readonly acciones = ACCIONES_AUDITORIA;

  // filtros
  filtroAccion = signal('');
  filtroEntidad = signal('');
  filtroDesde = signal('');
  filtroHasta = signal('');

  // estado
  logs = signal<AuditoriaLog[]>([]);
  cargando = signal(false);
  error = signal('');
  totalElementos = signal(0);
  totalPaginas = signal(0);
  paginaActual = signal(0);
  readonly tamanoPagina = 20;

  // fila expandida
  expandedLogId = signal<number | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(pagina = 0): void {
    this.cargando.set(true);
    this.error.set('');
    this.paginaActual.set(pagina);
    this.expandedLogId.set(null);

    this.auditoriaService.listar({
      accion: this.filtroAccion() || undefined,
      entidad: this.filtroEntidad() || undefined,
      desde: this.filtroDesde() || undefined,
      hasta: this.filtroHasta() || undefined,
      page: pagina,
      size: this.tamanoPagina
    }).subscribe({
      next: (data) => {
        this.logs.set(data.content);
        this.totalElementos.set(data.totalElements);
        this.totalPaginas.set(data.totalPages);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el registro de auditoría.');
        this.cargando.set(false);
      }
    });
  }

  buscar(): void {
    this.cargar(0);
  }

  limpiarFiltros(): void {
    this.filtroAccion.set('');
    this.filtroEntidad.set('');
    this.filtroDesde.set('');
    this.filtroHasta.set('');
    this.cargar(0);
  }

  paginaAnterior(): void {
    if (this.paginaActual() > 0) this.cargar(this.paginaActual() - 1);
  }

  paginaSiguiente(): void {
    if (this.paginaActual() < this.totalPaginas() - 1) this.cargar(this.paginaActual() + 1);
  }

  toggleExpand(id: number): void {
    this.expandedLogId.set(this.expandedLogId() === id ? null : id);
  }

  isExpanded(id: number): boolean {
    return this.expandedLogId() === id;
  }

  parsearDetalles(json: string | null): { clave: string; valor: string }[] {
    if (!json) return [];
    try {
      const obj = JSON.parse(json);
      return Object.entries(obj).map(([clave, valor]) => ({
        clave,
        valor: String(valor)
      }));
    } catch {
      return [{ clave: 'detalles', valor: json }];
    }
  }

  formatTimestamp(ts: string): string {
    const d = new Date(ts);
    return d.toLocaleString('es-CO', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }

  accionClass(accion: string): string {
    const map: Record<string, string> = {
      CREAR: 'badge--crear',
      CREAR_PRIORIDAD: 'badge--prioridad',
      REPROGRAMAR: 'badge--reprogramar',
      ACTUALIZAR: 'badge--actualizar',
    };
    return map[accion] ?? 'badge--default';
  }
}
