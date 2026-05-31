export const ROLES = {
  ADMIN: 'ADMIN',
  AGENDADOR: 'AGENDADOR',
  MEDICO: 'MEDICO',
  TERAPISTA: 'TERAPISTA',
  PACIENTE: 'PACIENTE'
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

