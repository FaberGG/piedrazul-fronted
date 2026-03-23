# services

## Proposito
Servicios HTTP del dominio `medicos`.

## Responsabilidad unica
Centralizar el acceso al backend y contratos de API del feature.

## Contiene
- Consumo de endpoints: GET /medicos, GET /medicos/{id}/configuracion, PUT /medicos/{id}/configuracion.
- Mapeo de requests/responses del dominio.

## No contiene
- Manipulacion de DOM o logica visual.
- Reglas de negocio de otros dominios.

## Referencia
- Basado en `skeleton.md` para `src/app/features/medicos/services/`.
