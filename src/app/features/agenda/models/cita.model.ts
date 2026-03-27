export type EstadoCita = 'PROGRAMADA' | 'ATENDIDA' | 'CANCELADA' | 'PENDIENTE';

export interface CitaModel {
  id: number;
  pacienteNombre: string;
  pacienteDocumento: string;
  medicoNombre: string;
  especialidad: string;
  fecha: string;
  hora: string;
  estado: EstadoCita;
  observaciones?: string;
}

export interface AgendaModel {
  medicoId: number;
  medicoNombre: string;
  especialidad: string;
  fecha: string;
  citas: CitaModel[];
  horariosDisponibles: string[];
  totalSlots: number;
  slotsOcupados: number;
  porcentajeOcupacion: number;
}
