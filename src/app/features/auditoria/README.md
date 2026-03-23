# auditoria

## Proposito
Feature de consulta del log de operaciones, de solo lectura para administrador (RF-11).

## Responsabilidad unica
Encapsular el dominio `auditoria` sin acoplarse a otros features.

## Contiene
- `pages/`, `components/`, `services/`, `models/`, `store/`.
- `auditoria.routes.ts` para lazy loading del dominio.

## No contiene
- Imports directos desde otros features.
- Llamadas HTTP fuera de `services/`.

## Referencia
- Basado en `skeleton.md` para `src/app/features/auditoria/`.
