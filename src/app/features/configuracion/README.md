# configuracion

## Proposito
Feature de parametrizacion global y por medico del agendamiento autonomo (RF-04).

## Responsabilidad unica
Encapsular el dominio `configuracion` sin acoplarse a otros features.

## Contiene
- `pages/`, `components/`, `services/`, `models/`, `store/`.
- `configuracion.routes.ts` para lazy loading del dominio.

## No contiene
- Imports directos desde otros features.
- Llamadas HTTP fuera de `services/`.

## Referencia
- Basado en `skeleton.md` para `src/app/features/configuracion/`.
