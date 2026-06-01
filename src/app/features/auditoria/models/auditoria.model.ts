export interface AuditoriaLog {
  id: number;
  usuarioId: string | null;
  accion: string;
  entidad: string;
  entidadId: number | null;
  detalles: string | null;
  ipAddress: string | null;
  timestamp: string;
}

export interface AuditoriaPage {
  content: AuditoriaLog[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const ACCIONES_AUDITORIA = [
  'CREAR',
  'CREAR_PRIORIDAD',
  'REPROGRAMAR',
  'ACTUALIZAR',
] as const;
