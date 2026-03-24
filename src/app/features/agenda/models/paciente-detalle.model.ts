export type GeneroPaciente = 'MASCULINO' | 'FEMENINO' | 'OTRO';

export interface PacienteDetalle {
  id: number;
  documento: string;
  nombres: string;
  apellidos: string;
  celular: string;
  genero: GeneroPaciente;
  fechaNacimiento?: string;
  correo?: string;
}

