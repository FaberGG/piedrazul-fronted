export interface PacientePerfil {
  id: number;
  documento: string;
  nombres: string;
  apellidos: string;
  celular: string;
  correo?: string;
  fechaNacimiento?: string;
  genero: string;
}
