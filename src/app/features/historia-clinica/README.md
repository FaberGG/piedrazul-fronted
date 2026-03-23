# historia-clinica

## Proposito
Feature de registro y consulta del historial clinico por paciente (RF-10).

## Responsabilidad unica
Encapsular el dominio `historia-clinica` sin acoplarse a otros features.

## Contiene
- `pages/`, `components/`, `services/`, `models/`, `store/`.
- `historia-clinica.routes.ts` para lazy loading del dominio.

## No contiene
- Imports directos desde otros features.
- Llamadas HTTP fuera de `services/`.

## Referencia
- Basado en `skeleton.md` para `src/app/features/historia-clinica/`.
