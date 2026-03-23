export const ROLES = {
  ADMIN: 'ADMIN',
  AGENDADOR: 'AGENDADOR',
  MEDICO: 'MEDICO',
  PACIENTE: 'PACIENTE'
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

