# services

## Proposito
Servicios HTTP del dominio `agenda`.

## Responsabilidad unica
Centralizar el acceso al backend y contratos de API del feature.

## Contiene
- Consumo de endpoints: GET /citas/agenda, POST /citas/manual, POST /citas/autonomo, GET /citas/disponibilidad/primera.
- Mapeo de requests/responses del dominio.

## No contiene
- Manipulacion de DOM o logica visual.
- Reglas de negocio de otros dominios.

## Referencia
- Basado en `skeleton.md` para `src/app/features/agenda/services/`.
