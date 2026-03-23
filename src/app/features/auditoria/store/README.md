# store

## Proposito
Estado reactivo del dominio `auditoria`.

## Responsabilidad unica
Gestionar estado local del feature con Signals o NgRx segun complejidad.

## Contiene
- Estado de carga, filtros y resultados del dominio.
- Selectores/computeds para consumo de pages/components.

## No contiene
- Estado compartido con otros features.
- Llamadas HTTP directas fuera de servicios.

## Referencia
- Basado en `skeleton.md` para `src/app/features/auditoria/store/`.
