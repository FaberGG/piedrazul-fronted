# reportes

## Proposito
Feature de visualizacion estadistica para decisiones operativas (RF-12).

## Responsabilidad unica
Encapsular el dominio `reportes` sin acoplarse a otros features.

## Contiene
- `pages/`, `components/`, `services/`, `models/`, `store/`.
- `reportes.routes.ts` para lazy loading del dominio.

## No contiene
- Imports directos desde otros features.
- Llamadas HTTP fuera de `services/`.

## Referencia
- Basado en `skeleton.md` para `src/app/features/reportes/`.
