export enum TipoCita {
  CONSULTA_GENERAL = 'CONSULTA_GENERAL',
  TERAPIA_NEURAL   = 'TERAPIA_NEURAL',
  QUIROPRAXIA      = 'QUIROPRAXIA',
  FISIOTERAPIA     = 'FISIOTERAPIA',
  ESTANDAR         = 'ESTANDAR',
  PRIORIDAD        = 'PRIORIDAD'
}

export const TIPO_CITA_LABELS: Record<TipoCita, string> = {
  [TipoCita.CONSULTA_GENERAL]: 'Consulta General',
  [TipoCita.TERAPIA_NEURAL]:   'Terapia Neural',
  [TipoCita.QUIROPRAXIA]:      'Quiropraxia',
  [TipoCita.FISIOTERAPIA]:     'Fisioterapia',
  [TipoCita.ESTANDAR]:         'Estándar',
  [TipoCita.PRIORIDAD]:        'Prioridad'
};

export const TIPOS_ESPECIALIDAD: TipoCita[] = [
  TipoCita.TERAPIA_NEURAL,
  TipoCita.QUIROPRAXIA,
  TipoCita.FISIOTERAPIA
];

/** Doctor specialty that handles CONSULTA_GENERAL appointments */
export const ESPECIALIDAD_CONSULTA_GENERAL = 'MEDICINA_GENERAL';

/** Maps each TipoCita to the doctor specialty that covers it */
export const ESPECIALIDAD_POR_TIPO: Partial<Record<TipoCita, string>> = {
  [TipoCita.CONSULTA_GENERAL]: 'MEDICINA_GENERAL',
  [TipoCita.TERAPIA_NEURAL]:   'TERAPIA_NEURAL',
  [TipoCita.QUIROPRAXIA]:      'QUIROPRAXIA',
  [TipoCita.FISIOTERAPIA]:     'FISIOTERAPIA',
};
