import { GeneroPaciente } from './paciente-detalle.model';

export interface PacienteFormulario {
  documento: string;
  nombres: string;
  apellidos: string;
  celular: string;
  genero: GeneroPaciente | '';
  fechaNacimiento?: string | null;
  correo?: string | null;
}

export interface CrearCitaManualRequest extends PacienteFormulario {
  medicoId: number;
  fecha: string;
  hora: string;
  observaciones?: string;
}

export interface CrearCitaPrioridadRequest extends PacienteFormulario {
  medicoId: number;
  fecha: string;
  horaReferencia: string;
  observaciones?: string;
}

export interface CitaManualResponse {
  id: number;
  pacienteNombre: string;
  pacienteDocumento: string;
  medicoNombre: string;
  especialidad: string;
  fecha: string;
  hora: string;
  estado: string;
  observaciones?: string;
}

