# pacientes

## Proposito
Feature de busqueda y consulta de pacientes para soporte del flujo de citas.

## Responsabilidad unica
Encapsular el dominio `pacientes` sin acoplarse a otros features.

## Contiene
- `pages/`, `components/`, `services/`, `models/`, `store/`.
- `pacientes.routes.ts` para lazy loading del dominio.

## No contiene
- Imports directos desde otros features.
- Llamadas HTTP fuera de `services/`.

## Referencia
- Basado en `skeleton.md` para `src/app/features/pacientes/`.
