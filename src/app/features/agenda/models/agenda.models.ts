export interface MedicoResumen {
  id: number;
  nombresCompletos: string;
  especialidad: string;
  activo: boolean;
}

export interface FranjaDisponible {
  hora: string;
}

export interface AgendarAutonomoRequest {
  medicoId: number;
  fecha: string;
  hora: string;
  tipoCita?: string;
  observaciones?: string;
}

export interface CitaResponse {
  id: number;
  medicoNombre: string;
  especialidad: string;
  fecha: string;
  hora: string;
  estado: string;
  tipoCita?: string;
  observaciones?: string;
}

export interface ReagendarCitaRequest {
  nuevaFecha: string;
  nuevaHora: string;
  motivo: string;
  medicoNuevoId?: number;
}

export interface HistorialCambiosCitaResponse {
  id: number;
  fechaAnterior: string;
  horaAnterior: string;
  medicoAnteriorId: number;
  fechaNueva: string;
  horaNueva: string;
  medicoNuevoId: number;
  motivo: string;
  modificadoPor: string;
  creadoEn: string;
}