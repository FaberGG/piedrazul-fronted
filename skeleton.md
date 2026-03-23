# Skeleton — Arquitectura Frontend Angular
## Sistema de Agendamiento de Citas Médicas — Red de Servicios Médicos de Piedrazul

**Proyecto:** Piedrazul Frontend  
**Framework:** Angular 17+ (standalone components)  
**Patrón:** Feature-based (organización por dominio funcional)  
**Semestre:** 2026.1

---

## Tabla de contenidos

1. [Contexto arquitectónico](#1-contexto-arquitectónico)
2. [Árbol de directorios](#2-árbol-de-directorios)
3. [Estrategia de layouts](#3-estrategia-de-layouts)
4. [Descripción detallada por directorio](#4-descripción-detallada-por-directorio)
  - [core/](#41-core)
  - [shared/](#42-shared)
  - [features/](#43-features)
  - [Archivos raíz de app/](#44-archivos-raíz-de-app)
  - [Fuera de src/app/](#45-fuera-de-srcapp)
5. [Patrón interno de cada feature](#5-patrón-interno-de-cada-feature)
6. [Reglas editoriales de la arquitectura](#6-reglas-editoriales-de-la-arquitectura)
7. [Correspondencia con el backend](#7-correspondencia-con-el-backend)
8. [Matriz de acceso por rol](#8-matriz-de-acceso-por-rol)

---

## 1. Contexto arquitectónico

El frontend de Piedrazul se construye como una **SPA (Single-Page Application)** con Angular 17+, usando el enfoque de **standalone components** (sin NgModules tradicionales) y carga diferida (**lazy loading**) por feature.

La organización del proyecto sigue el patrón **feature-based**: el código se agrupa por dominio funcional (agenda, médicos, pacientes, reportes), no por tipo de artefacto. Esto significa que cada feature contiene sus propios componentes, servicios y modelos, reduciendo el acoplamiento entre dominios.

Este patrón está alineado con la estructura del backend (`auth`, `agenda`, `medicos`, `pacientes`, `reportes`, `shared`), lo que facilita la trazabilidad entre capas.

**Principios que guían la estructura:**

- Un feature no importa directamente de otro feature. La comunicación entre dominios ocurre a través de `core/` o `shared/`.
- Los servicios HTTP viven exclusivamente en `services/` dentro de cada feature o en `core/`.
- Ningún componente realiza llamadas HTTP directamente.
- Los guards y los interceptores se definen una sola vez en `core/` y se aplican globalmente desde `app.routes.ts`.
- La lógica de presentación compleja (estado reactivo) vive en `store/` dentro de cada feature, usando Angular Signals o NgRx según la complejidad.

---

## 2. Árbol de directorios

```
piedrazul-frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── auth/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── layout/
│   │   │   │   ├── shell/
│   │   │   │   ├── patient-shell/
│   │   │   │   ├── sidebar/
│   │   │   │   └── topbar/
│   │   │   ├── models/
│   │   │   └── utils/
│   │   │
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── tabla-datos/
│   │   │   │   ├── modal-confirmacion/
│   │   │   │   ├── badge-estado/
│   │   │   │   └── empty-state/
│   │   │   ├── directives/
│   │   │   ├── pipes/
│   │   │   ├── validators/
│   │   │   ├── ui/
│   │   │   └── constants/
│   │   │
│   │   ├── features/
│   │   │   ├── agenda/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── lista-citas-page/
│   │   │   │   │   ├── nueva-cita-page/
│   │   │   │   │   ├── agendar-autonomo-page/
│   │   │   │   │   └── reagendar-page/
│   │   │   │   ├── components/
│   │   │   │   │   ├── buscador-citas/
│   │   │   │   │   ├── tabla-citas/
│   │   │   │   │   ├── asistente-agendamiento/
│   │   │   │   │   ├── selector-horario/
│   │   │   │   │   └── formulario-paciente/
│   │   │   │   ├── services/
│   │   │   │   ├── models/
│   │   │   │   ├── store/
│   │   │   │   └── agenda.routes.ts
│   │   │   │
│   │   │   ├── pacientes/
│   │   │   │   ├── pages/
│   │   │   │   │   └── buscar-paciente-page/
│   │   │   │   ├── components/
│   │   │   │   ├── services/
│   │   │   │   ├── models/
│   │   │   │   ├── store/
│   │   │   │   └── pacientes.routes.ts
│   │   │   │
│   │   │   ├── medicos/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── lista-medicos-page/
│   │   │   │   │   └── detalle-medico-page/
│   │   │   │   ├── components/
│   │   │   │   ├── services/
│   │   │   │   ├── models/
│   │   │   │   ├── store/
│   │   │   │   └── medicos.routes.ts
│   │   │   │
│   │   │   ├── configuracion/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── configuracion-global-page/
│   │   │   │   │   └── configuracion-medico-page/
│   │   │   │   ├── components/
│   │   │   │   ├── services/
│   │   │   │   ├── models/
│   │   │   │   ├── store/
│   │   │   │   └── configuracion.routes.ts
│   │   │   │
│   │   │   ├── reportes/
│   │   │   │   ├── pages/
│   │   │   │   │   └── reportes-page/
│   │   │   │   ├── components/
│   │   │   │   │   ├── grafica-citas-mes/
│   │   │   │   │   ├── grafica-por-medico/
│   │   │   │   │   └── grafica-especialidad/
│   │   │   │   ├── services/
│   │   │   │   ├── models/
│   │   │   │   ├── store/
│   │   │   │   └── reportes.routes.ts
│   │   │   │
│   │   │   ├── auditoria/
│   │   │   │   ├── pages/
│   │   │   │   │   └── auditoria-page/
│   │   │   │   ├── components/
│   │   │   │   ├── services/
│   │   │   │   ├── models/
│   │   │   │   ├── store/
│   │   │   │   └── auditoria.routes.ts
│   │   │   │
│   │   │   └── historia-clinica/
│   │   │       ├── pages/
│   │   │       │   └── historia-clinica-page/
│   │   │       ├── components/
│   │   │       │   ├── formulario-control/
│   │   │       │   └── lista-controles/
│   │   │       ├── services/
│   │   │       ├── models/
│   │   │       ├── store/
│   │   │       └── historia-clinica.routes.ts
│   │   │
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   └── app.component.ts
│   │
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── assets/
│   │   └── images/
│   ├── styles/
│   │   ├── styles.scss
│   │   ├── _variables.scss
│   │   └── _reset.scss
│   └── index.html
│
├── angular.json
├── package.json
└── tsconfig.json
```

---

## 3. Estrategia de layouts

El proyecto maneja **tres layouts distintos**, cada uno como un componente padre en `app.routes.ts`. Angular inyecta el feature activo dentro del `<router-outlet>` de cada layout, sin que los features tengan conocimiento del marco que los contiene.

### Layout 1 — `ShellComponent` (staff autenticado)

Aplicado a los roles: **Administrador, Agendador de citas, Médico/Terapista.**

Estructura visual:
- **Sidebar** fijo a la izquierda con logo de Piedrazul y menú de navegación.
- **Topbar** en la parte superior con nombre del usuario, rol activo y botón de cierre de sesión.
- **Área de contenido** a la derecha con el `<router-outlet>`.

El sidebar no se replica por rol. Un único `SidebarComponent` recibe los ítems de navegación como datos y los filtra reactivamente según el rol del usuario autenticado. Los ítems no visibles para el rol activo simplemente no se renderizan.

### Layout 2 — `PatientShellComponent` (paciente autenticado)

Aplicado exclusivamente al rol: **Paciente.**

El flujo de agendamiento autónomo tiene una experiencia visual diferente a la del staff operativo. Por esta razón se justifica un layout separado, más limpio y enfocado en la tarea del paciente.

Estructura visual:
- **Header** con logo de Piedrazul, nombre del usuario y opción de cerrar sesión.
- **Área de contenido** centrada, sin sidebar lateral.

### Layout 3 — Sin layout (rutas públicas)

Aplicado a: `/login`, `/registro`.

Los componentes de autenticación son standalone y se cargan directamente como raíz visual, sin ningún componente padre de layout. Esto evita parpadeos o flashes del shell mientras se verifica el estado de sesión.

### Definición en el router

Los tres grupos de rutas se definen en `app.routes.ts` usando el componente de layout como padre (`component`) y los features como hijos (`children`). Los guards de autenticación y rol se aplican en este nivel, no dentro de cada feature.

---

## 4. Descripción detallada por directorio

### 4.1 `core/`

**Propósito:** Contiene todo lo que existe una sola vez en la aplicación. Los artefactos de `core/` se proveen en el injector raíz y nunca se instancian más de una vez. Ningún feature importa directamente desde `core/` a excepción de los servicios y guards que necesita.

---

#### `core/auth/`

Responsabilidad única: gestión del estado de sesión del usuario autenticado.

**Contiene:**
- El servicio que realiza la llamada de login al endpoint `POST /auth/login`.
- El servicio que encapsula la lectura, escritura y decodificación del JWT (lectura de payload, verificación de expiración).
- El store o signal que expone el usuario actual y su rol a todo el sistema de forma reactiva.
- La lógica de logout (invalidación local del token y redirección).

**No contiene:**
- Componentes de formulario de login (esos van en `features/` o como páginas standalone).
- Lógica de navegación post-login específica de un feature.
- Llamadas a otros endpoints que no sean de autenticación.

---

#### `core/guards/`

Responsabilidad única: protección de rutas según estado de sesión y rol del usuario.

**Contiene:**
- `auth.guard`: verifica que exista un JWT válido y no expirado. Redirige a `/login` si la verificación falla.
- `role.guard`: recibe una lista de roles permitidos y verifica que el rol del usuario autenticado esté incluida. Redirige a una página de acceso denegado o al inicio si no coincide.
- `no-auth.guard`: evita que un usuario ya autenticado acceda a rutas públicas como `/login`. Redirige al inicio correspondiente a su rol.

**No contiene:**
- Lógica de negocio ni llamadas HTTP.
- Guards específicos de un solo feature (si un guard aplica únicamente a una ruta de un feature, puede vivir en ese feature, aunque es poco frecuente).

---

#### `core/interceptors/`

Responsabilidad única: procesamiento transversal de todas las peticiones y respuestas HTTP de la aplicación.

**Contiene:**
- `jwt.interceptor`: adjunta el header `Authorization: Bearer <token>` a todas las peticiones salientes hacia la API. Lee el token desde el servicio de `core/auth/`.
- `error.interceptor`: captura respuestas con código 401 (sesión expirada o inválida), 403 (acceso denegado) y errores de red, y los convierte en acciones controladas: cierre de sesión automático para 401, mensaje de error para 403, notificación de red caída para errores de conectividad.
- `loading.interceptor` _(opcional)_: activa y desactiva un indicador global de carga en sincronía con las peticiones HTTP en curso.

**No contiene:**
- Lógica específica de un feature o de un endpoint particular.
- Transformación de datos de respuesta (eso es responsabilidad del servicio del feature).

---

#### `core/layout/`

Responsabilidad única: definir los marcos visuales persistentes de la aplicación.

**Contiene:**

`shell/` — el componente raíz del staff autenticado. Orquesta la estructura visual: renderiza el sidebar, el topbar y el `<router-outlet>` donde se inyectan los features. No contiene lógica de negocio.

`patient-shell/` — el componente raíz del paciente. Renderiza el header simplificado y el `<router-outlet>`. Structuralmente más ligero que `shell/`, orientado al flujo de autogestión.

`sidebar/` — menú lateral con el logo de Piedrazul y los ítems de navegación. Filtra los ítems visibles según el rol del usuario en sesión usando un signal reactivo. Un único componente, no uno por rol.

`topbar/` — encabezado con el nombre y rol del usuario autenticado y el botón de cierre de sesión.

**No contiene:**
- Componentes de páginas individuales de features.
- Lógica de carga de datos o llamadas al backend.
- Estilos globales de la aplicación (esos van en `styles/`).

---

#### `core/models/`

Responsabilidad única: interfaces y tipos TypeScript que son transversales a toda la aplicación y no pertenecen a un solo dominio.

**Contiene:**
- Interfaz del usuario autenticado con sus campos de sesión y rol.
- Interfaz genérica de respuesta de la API (envoltorio con `data`, `message`, `status`).
- Interfaz de paginación para respuestas de listados.
- Enumeración o tipo unión de roles del sistema.

**No contiene:**
- Modelos de dominio específicos como `Cita`, `Medico` o `Paciente`. Esos viven en `features/<dominio>/models/`.
- DTOs de request/response de endpoints específicos.

---

#### `core/utils/`

Responsabilidad única: funciones puras de utilidad sin dependencias de Angular.

**Contiene:**
- Utilidades de fechas y horas orientadas al dominio del agendamiento (formateo AM/PM, cálculo de slots disponibles, comparación de rangos horarios).
- Helpers de roles (verificar si un usuario tiene un rol específico).
- Funciones de formateo de texto reutilizables.

**No contiene:**
- Pipes de Angular (van en `shared/pipes/`).
- Funciones con dependencias de servicios inyectables.

---

### 4.2 `shared/`

**Propósito:** Artefactos reutilizables por dos o más features distintos. La regla de inclusión es estricta: si un artefacto es usado exclusivamente por un feature, vive dentro de ese feature. Solo sube a `shared/` cuando la necesidad de reutilización entre features es comprobable.

---

#### `shared/components/`

Componentes "tontos" o de presentación: reciben datos por `@Input()`, emiten eventos por `@Output()`, y no tienen conocimiento del dominio de negocio ni del estado global.

**Contiene:**

`tabla-datos/` — tabla genérica y configurable mediante columnas declaradas externamente. Incluye paginación, indicador de carga y estado vacío. Usada en: listado de citas (RF-01), listado de médicos, listado de pacientes, auditoría.

`modal-confirmacion/` — diálogo de confirmación genérico para acciones irreversibles o de alto impacto (desactivar un usuario, cancelar una cita). Recibe título, mensaje y callbacks de confirmación/cancelación.

`badge-estado/` — indicador visual del estado de una entidad (activo/inactivo, cita confirmada/cancelada). Recibe el estado como string y aplica el color correspondiente.

`empty-state/` — componente que se muestra cuando una búsqueda o listado no retorna resultados. Recibe un mensaje configurable.

**No contiene:**
- Componentes que consumen servicios HTTP directamente.
- Componentes que contienen lógica de negocio o validaciones específicas de un dominio.
- Formularios de creación o edición de entidades (esos van en `features/<dominio>/components/`).

---

#### `shared/directives/`

Directivas de atributo reutilizables entre features, orientadas a comportamiento de UI.

**Contiene:**
- `only-numbers`: restringe la entrada en un campo de texto a solo caracteres numéricos. Usada en campos de número de documento y celular.
- `click-outside`: emite un evento cuando el usuario hace click fuera del elemento host. Útil para cerrar dropdowns y paneles flotantes.
- `auto-focus`: coloca el foco automáticamente en el elemento cuando el componente se inicializa.

**No contiene:**
- Directivas estructurales complejas con lógica de negocio.
- Directivas que dependan de servicios específicos de un feature.

---

#### `shared/pipes/`

Pipes de transformación de datos para templates, reutilizables en múltiples vistas.

**Contiene:**
- `hora-formato`: transforma un string de hora en formato 24h (`07:05`) al formato de display de Piedrazul (`07:05 AM`).
- `nombre-completo`: concatena nombres y apellidos con el formato adecuado.
- `rol-label`: transforma el identificador de rol del backend (`MEDICO_TERAPISTA`) a su etiqueta legible (`Médico / Terapista`).
- `fecha-corta`: formatea fechas ISO a formato legible en español (`mié 28 ene 2026`).

**No contiene:**
- Pipes que dependan de servicios HTTP o del estado de sesión.
- Pipes cuya lógica de transformación es específica de un solo feature.

---

#### `shared/validators/`

Funciones validadoras de formularios reactivos (`ValidatorFn` y `AsyncValidatorFn`) reutilizables.

**Contiene:**
- `documento-identidad.validator`: valida el formato de un número de cédula colombiana.
- `celular-colombia.validator`: valida que el número móvil tenga el formato local correcto (inicio con 3, 10 dígitos).
- `hora-disponible.validator`: valida que una hora seleccionada manualmente respete el intervalo configurado para un médico.
- `rango-fechas.validator`: valida que una fecha de fin sea posterior a una fecha de inicio, para filtros de reportes.

**No contiene:**
- Validaciones que requieren llamada HTTP (como verificar si un documento ya existe en la base de datos). Esas son `AsyncValidatorFn` y viven en el servicio del feature que las necesita.
- Lógica de presentación de errores (eso es responsabilidad del componente del formulario).

---

#### `shared/ui/`

Componentes de presentación atómica sin lógica alguna. Son los bloques más pequeños del sistema de diseño.

**Contiene:**
- `spinner/`: indicador de carga circular.
- `alert/`: componente de mensaje informativo, de éxito, advertencia o error.
- `avatar/`: representación visual de un usuario (iniciales o imagen).
- `tooltip/`: texto flotante de ayuda contextual.

Si el proyecto adopta una librería de componentes (PrimeNG, Angular Material), esta carpeta contiene los wrappers que adaptan los componentes de la librería al estilo visual de Piedrazul, evitando dependencias directas de la librería en los features.

---

#### `shared/constants/`

Valores fijos del dominio de negocio que se usan en múltiples features.

**Contiene:**
- `especialidades`: lista de especialidades médicas disponibles (Terapia neural, Quiropraxia, Fisioterapia), usada en selectores de médicos y filtros de reportes.
- `roles`: definición central de los roles del sistema, usada en guards, sidebar y badges.
- `dias-semana`: lista de días hábiles para los selectores de configuración de agenda.
- `estados-cita`: posibles estados de una cita (confirmada, cancelada, reagendada), usados en badges y filtros.

**No contiene:**
- Constantes de configuración de ambiente como URLs de la API (esas van en `environments/`).
- Constantes propias de un solo feature (esas viven en ese feature).

---

### 4.3 `features/`

**Propósito:** Cada subdirectorio representa un dominio funcional del sistema. Son las unidades de negocio del frontend. Se cargan de forma lazy (solo cuando el usuario navega a esa sección) para optimizar el tiempo de carga inicial.

Todos los features siguen el mismo patrón interno descrito en la sección 5.

---

#### `features/agenda/`

El feature de mayor valor del sistema. Concentra las funcionalidades de los sprints iniciales (RF-01, RF-02, RF-03, RF-08, RF-09).

**Páginas (`pages/`):**

`lista-citas-page/` — vista principal de consulta de citas. Contiene el panel de búsqueda (médico + fecha) y la tabla de resultados con el total de citas. Accesible para Agendador, Médico/Terapista y Administrador. Corresponde a RF-01.

`nueva-cita-page/` — formulario de creación manual de cita. Flujo: búsqueda de paciente existente → captura de datos del paciente si es nuevo → selección de médico, fecha y horario disponible → confirmación. Accesible para Agendador y Médico/Terapista. Corresponde a RF-02.

`agendar-autonomo-page/` — asistente de agendamiento guiado para el paciente. Flujo en pasos: selección de especialidad o médico → visualización de franjas disponibles → selección de horario → resumen y confirmación. Accesible solo para el rol Paciente. Corresponde a RF-03.

`reagendar-page/` — formulario de modificación de una cita existente. Muestra la cita actual y permite seleccionar una nueva fecha y hora disponible para el mismo médico. Corresponde a RF-08.

**Componentes de dominio (`components/`):**

`buscador-citas/` — panel de filtros con selector de médico y selector de fecha. Emite el evento de búsqueda al page que lo contiene.

`tabla-citas/` — instancia configurada del `tabla-datos` de shared, con las columnas específicas del dominio de citas (hora, documento, nombre, celular, observaciones).

`asistente-agendamiento/` — componente de navegación en pasos para el flujo autónomo del paciente. Gestiona el estado del wizard internamente.

`selector-horario/` — grilla visual de franjas horarias disponibles. Recibe la lista de slots del backend y emite la franja seleccionada. Consume la respuesta de `GET /citas/disponibilidad/primera`.

`formulario-paciente/` — subformulario reutilizado dentro de la creación manual para capturar o confirmar los datos del paciente.

**Servicios (`services/`):**

`agenda.service` — centraliza todas las llamadas HTTP del dominio: consulta de agenda por médico y fecha, creación de cita manual, agendamiento autónomo, consulta de disponibilidad y re-agendamiento.

`exportacion.service` — gestiona la exportación de citas a CSV (RF-09). Solicita el archivo al backend o lo genera en el cliente a partir de los datos de la agenda.

---

#### `features/pacientes/`

Dominio de búsqueda y consulta de pacientes, utilizado como referencia desde el flujo de creación de citas.

**Páginas (`pages/`):**

`buscar-paciente-page/` — búsqueda de paciente por número de documento de identidad. Muestra los datos del paciente si existe o habilita el formulario de registro si es nuevo.

**Servicios (`services/`):**

`pacientes.service` — consume los endpoints de listado, búsqueda por documento y detalle de paciente (`GET /pacientes`, `GET /pacientes/buscar`, `GET /pacientes/{id}`).

---

#### `features/medicos/`

Dominio de administración del catálogo de profesionales del centro médico. Corresponde a RF-07.

**Páginas (`pages/`):**

`lista-medicos-page/` — listado de médicos y terapistas con filtros por especialidad y estado (activo/inactivo). Solo Administrador puede crear o desactivar desde esta vista.

`detalle-medico-page/` — ficha completa del profesional. Muestra sus datos, especialidad, intervalo de atención y el estado de su configuración de agenda.

**Servicios (`services/`):**

`medicos.service` — consume `GET /medicos`, `GET /medicos/{id}/configuracion` y `PUT /medicos/{id}/configuracion`.

---

#### `features/configuracion/`

Dominio exclusivo del Administrador para parametrizar el funcionamiento del agendamiento autónomo. Corresponde a RF-04.

**Páginas (`pages/`):**

`configuracion-global-page/` — parámetros de alcance general del sistema: ventana de tiempo habilitada para citas (en semanas) y festivos o días bloqueados.

`configuracion-medico-page/` — parámetros por profesional: días de la semana que atiende, franja horaria (hora inicio y hora fin) e intervalo en minutos entre citas. Se navega desde la ficha del médico.

**Nota:** Este feature tiene acceso restringido mediante `role.guard(['ADMIN'])` en la definición de rutas. Un Médico/Terapista no debe acceder a estas páginas.

---

#### `features/reportes/`

Dominio de visualización estadística para la toma de decisiones operativas. Corresponde a RF-12.

**Páginas (`pages/`):**

`reportes-page/` — dashboard con múltiples gráficas. Incluye filtros por año, médico y especialidad. Accesible para Administrador y Médico/Terapista.

**Componentes de dominio (`components/`):**

`grafica-citas-mes/` — gráfica de barras con la cantidad de citas por mes para un año seleccionado, desglosada por médico.

`grafica-por-medico/` — comparativo de volumen de citas entre profesionales.

`grafica-especialidad/` — distribución de citas por especialidad.

**Servicios (`services/`):**

`reportes.service` — consume `GET /api/v1/reportes/citas` con los parámetros de filtro aplicados.

---

#### `features/auditoria/`

Dominio de consulta del log de operaciones del sistema. Acceso exclusivo para Administrador. Corresponde a RF-11.

**Páginas (`pages/`):**

`auditoria-page/` — tabla de registros de auditoría con filtros por usuario, tipo de acción y rango de fechas. Los registros son de solo lectura.

**Servicios (`services/`):**

`auditoria.service` — consume el endpoint de auditoría con parámetros de filtrado y paginación.

---

#### `features/historia-clinica/`

Dominio de registro y consulta del historial clínico de cada paciente. Accesible para Médico/Terapista y Administrador. Corresponde a RF-10.

**Páginas (`pages/`):**

`historia-clinica-page/` — vista del historial completo de controles de un paciente. Se navega desde la vista de detalle de una cita atendida o desde la búsqueda de paciente.

**Componentes de dominio (`components/`):**

`formulario-control/` — formulario para registrar un nuevo control médico asociado a una cita. Campos mínimos: descripción del procedimiento. Los campos de fecha, hora y profesional se registran automáticamente.

`lista-controles/` — listado cronológico de los controles previos del paciente. Muestra fecha, profesional y descripción. Los registros no son eliminables.

**Servicios (`services/`):**

`historia-clinica.service` — consume los endpoints de registro y consulta de controles médicos.

---

### 4.4 Archivos raíz de `app/`

`app.config.ts` — archivo de configuración de providers de la aplicación. Aquí se registran: el router (`provideRouter`), el cliente HTTP (`provideHttpClient`), los interceptores (`withInterceptors`), y cualquier provider global como el de animaciones o internacionalización.

`app.routes.ts` — definición central del árbol de rutas. Organiza las rutas en tres grupos: rutas públicas sin layout, rutas de staff con `ShellComponent` como padre, y rutas de paciente con `PatientShellComponent` como padre. Los guards se aplican en este nivel. Todos los features se cargan con `loadChildren` apuntando al archivo de rutas del feature.

`app.component.ts` — componente raíz minimalista. Su única responsabilidad es renderizar el `<router-outlet>` de nivel superior. No contiene lógica de negocio ni presentación propia.

---

### 4.5 Fuera de `src/app/`

#### `environments/`

Configuración de variables por ambiente. La única referencia a la URL base del backend vive aquí.

`environment.ts` — configuración de desarrollo local. Contiene `apiUrl: 'http://localhost:8080/api/v1'` y cualquier flag de entorno como `production: false`.

`environment.prod.ts` — configuración de producción. Contiene la URL del servidor desplegado y `production: true`. Este archivo no se versiona con credenciales.

**Regla crítica:** Ningún servicio ni componente debe escribir la URL del backend de forma literal. Siempre se consume desde `environment.apiUrl`.

---

#### `assets/`

Recursos estáticos servidos directamente por el servidor.

`assets/images/` — logotipo de Piedrazul, imagen de portada de la clínica y cualquier imagen estática que se muestre en la interfaz. No almacenar aquí imágenes de pacientes o profesionales (esas son dinámicas y vienen del backend).

---

#### `styles/`

Estilos globales de la aplicación.

`styles.scss` — punto de entrada de estilos. Importa las hojas parciales y, si se usa una librería de componentes, sus estilos base.

`_variables.scss` — variables Sass del sistema de diseño: paleta de colores, tipografía, espaciados y breakpoints. Define la identidad visual de Piedrazul de forma centralizada.

`_reset.scss` — normalización de estilos por defecto del navegador para asegurar consistencia entre plataformas.

**Regla:** Los estilos específicos de un componente van en el archivo `.scss` del componente con `ViewEncapsulation.Emulated` (comportamiento por defecto de Angular). Solo van en `styles/` los estilos verdaderamente globales.

---

## 5. Patrón interno de cada feature

Todos los features del directorio `features/` siguen la misma estructura interna. Esta consistencia reduce la curva de aprendizaje al incorporar un nuevo integrante al equipo y facilita la navegación entre dominios.

```
features/<dominio>/
├── pages/            ← componentes ruteados, uno por vista/pantalla
├── components/       ← componentes de UI propios del dominio, no ruteados
├── services/         ← llamadas HTTP al backend, una por recurso de API
├── models/           ← interfaces TypeScript y DTOs del dominio
├── store/            ← estado reactivo del feature (Signals o NgRx)
└── <dominio>.routes.ts  ← rutas con lazy loading propias del feature
```

**`pages/`** — cada directorio hijo es un componente que corresponde a una ruta navegable. Son los "contenedores inteligentes": conocen el estado, inyectan servicios y coordinan los componentes de presentación. Nunca se reutilizan como subcomponentes de otras páginas.

**`components/`** — componentes de UI propios del dominio que no son ruteables. Pueden consumir servicios del mismo feature pero no de otros features. Si un componente de esta carpeta es necesario en otro feature, se mueve a `shared/components/`.

**`services/`** — servicios que encapsulan las llamadas HTTP al backend. Un servicio por recurso o agrupación lógica de endpoints. Los componentes y páginas del feature inyectan estos servicios; nunca usan `HttpClient` directamente.

**`models/`** — interfaces TypeScript que representan las entidades del dominio y los DTOs de request/response de la API. No contienen lógica, solo tipos. Si un modelo se comparte entre features, se evalúa promoverlo a `core/models/`.

**`store/`** — gestión de estado reactivo del feature. Para features simples, un archivo con signals de Angular es suficiente. Para features complejos con estado derivado, efectos y sincronización, se puede usar NgRx Feature Store. El store no se comparte entre features.

**`<dominio>.routes.ts`** — archivo de rutas del feature cargado de forma lazy desde `app.routes.ts`. Define las rutas internas del feature apuntando a los componentes de `pages/`. Puede aplicar guards adicionales específicos del dominio.

---

## 6. Reglas editoriales de la arquitectura

Las siguientes reglas definen los límites entre capas y evitan el acoplamiento involuntario entre features.

| Regla | Descripción |
|-------|-------------|
| **Lazy loading obligatorio** | Cada feature se carga únicamente cuando el usuario navega a él. Ningún feature se importa directamente en `app.config.ts` o `app.component.ts`. |
| **Sin imports cruzados entre features** | `features/agenda/` nunca importa desde `features/medicos/`. Si necesitan comunicarse, lo hacen a través de servicios en `core/` o tipos en `shared/`. |
| **HTTP solo en `services/`** | Ningún componente, pipe, directiva ni guard realiza llamadas con `HttpClient` directamente. |
| **Guards exclusivamente en `core/guards/`** | No se definen guards dentro de los features, salvo casos de restricción muy específica de una sub-ruta. |
| **Modelos locales permitidos** | Si `agenda/` y `medicos/` tienen representaciones distintas del mismo concepto (ej. `Medico`), cada uno mantiene la suya. No se fuerzan modelos globales prematuramente. |
| **Sin lógica en templates** | Las expresiones en templates son solo de lectura o binding simple. La lógica condicional compleja, el filtrado y los cálculos van en el componente `.ts` o en el servicio. |
| **URL del backend solo en `environments/`** | Ningún archivo fuera de `environments/` contiene la URL base de la API como literal. Todos los servicios la leen desde `environment.apiUrl`. |
| **Estilos encapsulados** | Los estilos de un componente viven en su propio `.scss`. Los estilos globales solo en `styles/`. No se usan estilos `!important` ni selectores globales para afectar componentes hijos. |
| **Un componente, una responsabilidad** | Si un componente necesita más de un servicio no relacionado, es señal de que debería dividirse. |

---

## 7. Correspondencia con el backend

La siguiente tabla muestra la trazabilidad entre los módulos del backend (Spring Boot) y los features del frontend Angular.

| Módulo backend | Feature frontend | Endpoints principales consumidos |
|----------------|-----------------|----------------------------------|
| `auth` | `core/auth/` | `POST /auth/login`, `POST /auth/register/paciente` |
| `agenda` | `features/agenda/` | `GET /citas/agenda`, `POST /citas/manual`, `POST /citas/autonomo`, `GET /citas/disponibilidad/primera` |
| `pacientes` | `features/pacientes/` | `GET /pacientes`, `GET /pacientes/buscar`, `GET /pacientes/{id}` |
| `medicos` | `features/medicos/` y `features/configuracion/` | `GET /medicos`, `GET /medicos/{id}/configuracion`, `PUT /medicos/{id}/configuracion` |
| `reportes` | `features/reportes/` | `GET /reportes/citas` |
| `auditoria` | `features/auditoria/` | Endpoint de auditoría (pendiente de implementación en backend) |
| `historia-clinica` | `features/historia-clinica/` | Endpoints de controles clínicos (pendiente de implementación en backend) |

**Nota sobre endpoints pendientes:** Los features `auditoria` e `historia-clinica` están estructurados en el frontend pero sus servicios deben implementarse una vez el backend exponga los endpoints correspondientes (actualmente en estado `PENDIENTE` según la documentación del backend). Los servicios de estos features deben crearse con la firma esperada y completarse cuando el contrato de API esté disponible.

---

## 8. Matriz de acceso por rol

La siguiente matriz define qué features y páginas son accesibles para cada rol. Esta información debe reflejarse en la configuración de guards en `app.routes.ts` y en el filtrado del sidebar.

| Feature / Página | Administrador | Agendador | Médico/Terapista | Paciente |
|------------------|:---:|:---:|:---:|:---:|
| `agenda/lista-citas-page` | ✅ | ✅ | ✅ | — |
| `agenda/nueva-cita-page` | ✅ | ✅ | ✅ | — |
| `agenda/agendar-autonomo-page` | — | — | — | ✅ |
| `agenda/reagendar-page` | ✅ | ✅ | ✅ | — |
| `pacientes/buscar-paciente-page` | ✅ | ✅ | ✅ | — |
| `medicos/lista-medicos-page` | ✅ | — | — | — |
| `medicos/detalle-medico-page` | ✅ | — | — | — |
| `configuracion/configuracion-global-page` | ✅ | — | — | — |
| `configuracion/configuracion-medico-page` | ✅ | — | — | — |
| `reportes/reportes-page` | ✅ | — | ✅ | — |
| `auditoria/auditoria-page` | ✅ | — | — | — |
| `historia-clinica/historia-clinica-page` | ✅ | — | ✅ | — |

---

*Documento elaborado para el proyecto de clase 2026.1 — Ingeniería de Software III, Universidad del Cauca.*  
*Versión inicial del skeleton de arquitectura frontend Angular para la Red de Servicios Médicos de Piedrazul.*
