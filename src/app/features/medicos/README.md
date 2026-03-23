# medicos

## Proposito
Feature para administracion del catalogo de medicos y terapistas (RF-07).

## Responsabilidad unica
Encapsular el dominio `medicos` sin acoplarse a otros features.

## Contiene
- `pages/`, `components/`, `services/`, `models/`, `store/`.
- `medicos.routes.ts` para lazy loading del dominio.

## No contiene
- Imports directos desde otros features.
- Llamadas HTTP fuera de `services/`.

## Referencia
- Basado en `skeleton.md` para `src/app/features/medicos/`.
