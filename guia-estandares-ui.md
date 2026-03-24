# Guia de estandares UI

Esta guia define como usar y extender colores, tipografia, espaciados y estilos base del frontend de Piedrazul.

## 1) Objetivo

- Mantener consistencia visual en toda la aplicacion.
- Evitar colores y tamanos hardcodeados en componentes.
- Facilitar que nuevos desarrolladores agreguen UI sin romper el sistema visual.

## 2) Donde vive cada cosa

- Tokens globales (colores, tipografia, layout): `src/styles.css`.
- Carga de fuentes e iconos globales: `src/index.html`.
- Estilos de layout staff: `src/app/core/layout/shell/`, `src/app/core/layout/sidebar/`, `src/app/core/layout/topbar/`.
- Estilos de cada feature: solo en su propio `.css` dentro de `features/...`.

Regla base: los componentes usan variables CSS globales, no valores directos de color/tamano.

## 3) Fuente estandar

Fuente oficial del proyecto: `Inter`.

- Declarada en `src/index.html` via Google Fonts.
- Aplicada globalmente desde `src/styles.css` con `--font-family-base`.

Tokens actuales:

```css
--font-family-base: 'Inter', sans-serif;
--font-size-base: 1rem;                  /* 16px */
--font-size-sm: 0.875rem;                /* 14px */
--font-size-topbar-title: 1.5rem;        /* 24px */
--font-size-topbar-description: 1rem;    /* 16px */
--font-size-topbar-user-name: 1rem;      /* 16px */
--font-size-topbar-user-email: 0.875rem; /* 14px */
```

Base global:

```css
html,
body {
  font-size: 16px;
}
```

## 4) Paleta de color oficial

Definida en `:root` en `src/styles.css`.

### Blue Green

- `--blue-green-50` a `--blue-green-900`
- Uso recomendado:
  - `500`: acento principal (detalles, avatar, acciones).
  - `600`: estados activos fuertes (item seleccionado del sidebar).
  - `50`: hover suave y fondos de apoyo.

### Neutros

- `--neutro-white`, `--neutro-black`
- `--neutro-gray-100` a `--neutro-gray-900`
- Uso recomendado:
  - `700`: texto principal.
  - `500`: texto secundario.
  - `400`: texto neutro de items no activos.
  - `300`: texto terciario (ej: correo en topbar).

## 5) Tokens de layout

```css
--layout-padding: 1rem;
--layout-gap: 0.3rem;
--layout-radius: 20px;
--menu-item-radius: 10px;
```

Uso actual:

- Fondo global de la app: `var(--blue-green-200)`.
- `Shell`: separacion y estructura general.
- `Sidebar`, `Topbar`, area de contenido: radio y superficies blancas.

## 6) Estandares vigentes por componente

## Sidebar (`src/app/core/layout/sidebar/`)

- Texto de items: `1rem` (`--font-size-base`).
- Item activo: fondo `--blue-green-600`, texto `--neutro-white`.
- Item inactivo: fondo `--neutro-white`, texto `--neutro-gray-400`.
- `Ajustes` y `Ayuda y soporte`: items neutros (placeholder), sin estado seleccionado ni navegacion.

## Topbar (`src/app/core/layout/topbar/`)

- Padding: `20px` arriba/abajo y `40px` izquierda/derecha (`1.25rem 2.5rem`).
- Titulo: `24px` y `--neutro-gray-700`.
- Descripcion: `16px` y `--neutro-gray-500`.
- Nombre usuario: `16px`.
- Correo usuario: `14px` y `--neutro-gray-300`.
- Accion derecha: flecha abajo de cambio de cuenta (visual, sin logica por ahora).

## 7) Como implementar estilos en un componente nuevo

1. Crear/usar el `.css` del componente (no usar estilos inline en `.ts`).
2. Consumir solo variables globales para color/tamano/radius.
3. Si falta un token, agregarlo en `src/styles.css` y luego usarlo.
4. Mantener clases BEM o convencion local estable del componente.
5. Verificar responsive minimo para mobile.

Ejemplo:

```css
.card-resumen {
  background: var(--neutro-white);
  color: var(--neutro-gray-700);
  border-radius: var(--layout-radius);
  padding: 1rem;
}

.card-resumen__titulo {
  font-size: var(--font-size-base);
}

.card-resumen__meta {
  color: var(--neutro-gray-500);
  font-size: var(--font-size-sm);
}
```

## 8) Como agregar un nuevo token (proceso recomendado)

1. Identificar necesidad real reutilizable (no puntual).
2. Nombrar el token por semantica, no por pantalla.
   - Correcto: `--font-size-label`, `--color-status-warning`.
   - Evitar: `--title-medicos-page`.
3. Agregar el token a `:root` en `src/styles.css`.
4. Reemplazar usos hardcodeados en componentes relacionados.
5. Documentar el nuevo token en esta guia.

## 9) Reglas de calidad visual

- No usar colores hex hardcodeados dentro de componentes.
- No usar `!important` salvo caso extremo justificado.
- No mezclar tipografias fuera de `Inter` para UI funcional.
- Mantener contraste legible entre texto y fondo.
- Los estados `hover`, `active`, `disabled` deben estar definidos cuando aplique.

## 10) Checklist rapido para PR de UI

- [ ] Use variables globales en lugar de hex/rem sueltos.
- [ ] Respete `Inter` como fuente base.
- [ ] Mantenga tamanos tipograficos de la escala definida.
- [ ] Incluya responsive basico.
- [ ] Evite logica de negocio en componentes de layout.
- [ ] Actualice esta guia si agrega tokens nuevos.

