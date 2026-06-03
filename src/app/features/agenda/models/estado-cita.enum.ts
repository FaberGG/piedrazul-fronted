export enum EstadoCita {
  PROGRAMADA = 'PROGRAMADA',
  ATENDIDA   = 'ATENDIDA',
  CANCELADA  = 'CANCELADA',
  INASISTENCIA = 'INASISTENCIA'
}

export const ESTADO_CITA_LABELS: Record<EstadoCita, string> = {
  [EstadoCita.PROGRAMADA]: 'Programada',
  [EstadoCita.ATENDIDA]:   'Atendida',
  [EstadoCita.CANCELADA]:  'Cancelada',
  [EstadoCita.INASISTENCIA]:  'Inasistencia'
};
