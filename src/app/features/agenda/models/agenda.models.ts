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
  observaciones?: string;
}

export interface CitaResponse {
  id: number;
  medicoNombre: string;
  especialidad: string;
  fecha: string;
  hora: string;
  estado: string;
}