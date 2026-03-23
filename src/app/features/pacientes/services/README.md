# services

## Proposito
Servicios HTTP del dominio `pacientes`.

## Responsabilidad unica
Centralizar el acceso al backend y contratos de API del feature.

## Contiene
- Consumo de endpoints: GET /pacientes, GET /pacientes/buscar, GET /pacientes/{id}.
- Mapeo de requests/responses del dominio.

## No contiene
- Manipulacion de DOM o logica visual.
- Reglas de negocio de otros dominios.

## Referencia
- Basado en `skeleton.md` para `src/app/features/pacientes/services/`.
