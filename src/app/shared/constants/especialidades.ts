export const ESPECIALIDADES = [
  'TERAPIA_NEURAL',
  'QUIROPRACTICA',
  'FISIOTERAPIA'
] as const;

export type Especialidad = (typeof ESPECIALIDADES)[number];

