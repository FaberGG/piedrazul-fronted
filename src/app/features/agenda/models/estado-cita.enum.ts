export enum EstadoCita {
  PROGRAMADA = 'PROGRAMADA',
  ATENDIDA   = 'ATENDIDA',
  CANCELADA  = 'CANCELADA'
}

export const ESTADO_CITA_LABELS: Record<EstadoCita, string> = {
  [EstadoCita.PROGRAMADA]: 'Programada',
  [EstadoCita.ATENDIDA]:   'Atendida',
  [EstadoCita.CANCELADA]:  'Cancelada'
};
