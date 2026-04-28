export interface RegisterPacienteRequest {
  password: string;
  documento: string;
  nombres: string;
  apellidos: string;
  celular: string;
  genero: string;
  fechaNacimiento: string;
  correo: string;
}

export interface RegisterAdminRequest {
  username: string;
  password: string;
}

export interface RegisterMedicoRequest {
  username: string;
  password: string;
  nombres: string;
  apellidos: string;
  especialidad: string;
  tipo: string;
}

