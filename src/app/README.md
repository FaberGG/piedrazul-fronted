# app

## Proposito
Composicion principal de la aplicacion con rutas, providers globales y dominios funcionales.

## Contiene
- `core/` para elementos singleton y transversales.
- `shared/` para artefactos reutilizables entre features.
- `features/` para dominios con lazy loading.
- Archivos raiz como `app.config.ts` y `app.routes.ts`.

## No contiene
- Implementaciones monoliticas sin separacion por dominio.

## Referencia
- Basado en `skeleton.md` para `src/app/`.
