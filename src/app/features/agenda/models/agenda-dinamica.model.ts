export interface AgendaDinamicaSlot {
  hora: string;
  estado: string;
  citaId?: number;
  pacienteDocumento?: string;
  pacienteNombres?: string;
  pacienteApellidos?: string;
  pacienteCelular?: string;
  permiteAbrirPrioridadPosterior?: boolean;
}

export interface AgendaDinamicaBloque {
  rango: string;
  estaExpandido: boolean;
  slots: AgendaDinamicaSlot[];
}

export interface AgendaDinamicaResponse {
  fecha: string;
  medico: string;
  primerSlotDisponible?: string;
  bloques: AgendaDinamicaBloque[];
}

