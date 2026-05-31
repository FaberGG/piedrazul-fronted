export type EstadoCita = 'PROGRAMADA' | 'ATENDIDA' | 'CANCELADA';

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

export interface CitaDetalleModel extends CitaModel {
  pacienteCelular?: string;
  pacienteCorreo?: string;
  esPrimeraCita: boolean;
}

export interface ActualizarCitaRequest {
  nuevoEstado?: string;
  nuevasObservaciones?: string;
  pacienteNombres?: string;
  pacienteApellidos?: string;
  pacienteDocumento?: string;
  pacienteCelular?: string;
  pacienteCorreo?: string;
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
