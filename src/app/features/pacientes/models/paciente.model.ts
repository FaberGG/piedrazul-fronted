export interface Paciente {
  readonly id: number;
  documento: string;
  nombres: string;
  apellidos: string;
  celular: string;
  correo?: string;
  fechaNacimiento?: string; // formato: YYYY-MM-DD
  genero: 'MASCULINO' | 'FEMENINO' | 'OTRO';
}
