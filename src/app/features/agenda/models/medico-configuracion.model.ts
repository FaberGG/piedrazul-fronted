export interface MedicoConfiguracion {
  medicoId: number;
  medicoNombre: string;
  especialidad: string;
  activo: boolean;
  diasAtencion: string[];
  horaInicio: string;
  horaFin: string;
  intervaloMinutos: number;
  capacidadDiaria: number;
}

