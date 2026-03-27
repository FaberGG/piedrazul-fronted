export interface Paciente {
  documento: string;
  nombres: string;
  apellidos: string;
  celular: string;
  correo?: string;
  fechaNacimiento?: string; // formato: YYYY-MM-DD
  genero: 'MASCULINO' | 'FEMENINO' | 'OTRO';
}
