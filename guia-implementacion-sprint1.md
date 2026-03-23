# Guía de implementación — Sprint 1
## Piedrazul Frontend · Angular 21.1

Esta guía describe paso a paso qué crear, en qué orden y dónde, para implementar los cuatro requisitos funcionales del primer sprint. Se asume que el backend está corriendo y los endpoints están disponibles.

**RF a implementar:**

| RF | Historia | Estado backend |
|----|----------|---------------|
| RF-01 | Listar citas por médico y fecha | `COMPLETO` |
| RF-02 | Crear cita manual (agendador) | `COMPLETO` |
| RF-03 | Agendar cita autónoma (paciente) | Endpoint definido |
| RF-04 | Configurar parámetros del sistema | `PARCIAL` |

---

## Orden de implementación recomendado

Antes de construir cualquier pantalla funcional, el proyecto necesita su base de infraestructura. Implementar en este orden evita retrabajos:

```
Fase 0 — Infraestructura base        (core/ + app.routes.ts)
Fase 1 — RF-01 Listar citas          (el más simple, valida la infraestructura)
Fase 2 — RF-02 Crear cita manual     (depende de RF-01 y de los datos de médicos)
Fase 3 — RF-04 Configurar sistema    (independiente, solo ADMIN)
Fase 4 — RF-03 Agendar autónomo      (el más complejo, depende de RF-04)
```

---

## Fase 0 — Infraestructura base

Todo el trabajo posterior depende de esta fase. No saltarla.

### 0.1 Archivos a crear en `core/auth/`

**`auth.service.ts`**
Responsabilidades:
- Llamar a `POST /auth/login` con credenciales.
- Guardar el JWT recibido.
- Exponer un signal `currentUser` con los datos del usuario autenticado (nombre, rol).
- Método `logout()` que limpia el token y redirige a `/login`.
- Método `isAuthenticated()` que verifica si existe un token válido y no expirado.

**`token.service.ts`**
Responsabilidades:
- Guardar y leer el JWT desde `localStorage`.
- Decodificar el payload del JWT para extraer el rol y la expiración.
- Verificar si el token está expirado.

### 0.2 Archivos a crear en `core/guards/`

**`auth.guard.ts`**
- Verifica que exista un token válido.
- Si no hay token: redirige a `/login`.

**`role.guard.ts`**
- Recibe un array de roles permitidos como dato de la ruta.
- Verifica que el rol del usuario coincida con los permitidos.
- Si no coincide: redirige a `/sin-permiso` o al inicio del rol.

**`no-auth.guard.ts`**
- Si el usuario ya está autenticado: redirige a su pantalla de inicio según rol.
- Evita que un usuario con sesión activa vea el `/login`.

### 0.3 Archivos a crear en `core/interceptors/`

**`jwt.interceptor.ts`**
- Función interceptora (formato funcional de Angular 21).
- Adjunta `Authorization: Bearer <token>` a cada petición saliente.
- Excluir las rutas públicas (`/auth/login`, `/auth/register`).

**`error.interceptor.ts`**
- Captura respuestas con código `401`: llama a `logout()` y redirige a `/login`.
- Captura respuestas con código `403`: muestra mensaje de acceso denegado.
- Captura errores de red: muestra notificación de error de conectividad.

### 0.4 Registrar interceptores en `app.config.ts`

Registrar ambos interceptores en `provideHttpClient(withInterceptors([...]))`.

### 0.5 Crear los layouts en `core/layout/`

**`shell/shell.component.ts`**
- Template: sidebar a la izquierda + topbar arriba + `<router-outlet>` en el área de contenido.
- No tiene lógica de negocio.

**`sidebar/sidebar.component.ts`**
- Recibe los ítems de navegación.
- Filtra los visibles según el rol del `currentUser` signal.
- Ítems iniciales para el sprint 1: Agenda, Configuración.

**`topbar/topbar.component.ts`**
- Muestra nombre y rol del usuario autenticado.
- Botón de cierre de sesión que llama a `auth.service.logout()`.

**`patient-shell/patient-shell.component.ts`**
- Template: header con logo + `<router-outlet>` centrado.
- Para el rol Paciente.

### 0.6 Crear la página de login

Crear como componente standalone en `features/auth/pages/login-page/`:

**`login-page.component.ts`**
- Formulario reactivo con campos: usuario y contraseña.
- Al enviar: llama a `auth.service.login()`.
- En éxito: redirige según el rol recibido en el JWT.
- En error: muestra mensaje de credenciales inválidas.

### 0.7 Configurar `app.routes.ts`

Definir los tres grupos de rutas:

```
/login                    → LoginPageComponent (sin layout, no-auth guard)

/                         → ShellComponent (auth guard)
  /agenda                 → lazy → agenda.routes.ts
  /configuracion          → lazy → configuracion.routes.ts (role guard ADMIN)

/paciente                 → PatientShellComponent (auth guard + role guard PACIENTE)
  /paciente/agendar       → lazy → agenda.routes.ts (ruta del asistente)

**                        → redirect /login
```

### 0.8 Crear los modelos globales en `core/models/`

**`user.model.ts`** — interfaz del usuario autenticado:
- `id`, `username`, `nombreCompleto`, `rol`

**`api-response.model.ts`** — envoltorio genérico de respuesta:
- `data`, `message`, `status`

**`pagination.model.ts`** — estructura de respuesta paginada:
- `content`, `totalElements`, `totalPages`, `page`, `size`

### 0.9 Crear las constantes en `shared/constants/`

**`roles.ts`** — enum o constante con los cuatro roles:
- `ADMIN`, `AGENDADOR`, `MEDICO_TERAPISTA`, `PACIENTE`

**`especialidades.ts`** — lista de especialidades:
- `TERAPIA_NEURAL`, `QUIROPRACTICA`, `FISIOTERAPIA`

**`dias-semana.ts`** — lista de días para selectores de configuración.

---

## Fase 1 — RF-01: Listar citas por médico y fecha

**Historia:** Como agendador necesito listar las citas de un médico en una fecha determinada.

**Endpoint:** `GET /api/v1/citas/agenda`
**Parámetros esperados:** `medicoId`, `fecha` (formato ISO `YYYY-MM-DD`)
**Roles permitidos:** `AGENDADOR`, `MEDICO_TERAPISTA`, `ADMIN`

### Archivos a crear

#### `features/agenda/models/`

**`cita.model.ts`**
Campos mínimos que devuelve el endpoint:
- `id`, `hora`, `paciente` (nombre, documento, celular), `observaciones`, `estado`

**`filtro-agenda.model.ts`**
Parámetros del filtro de búsqueda:
- `medicoId: number`, `fecha: string`

#### `features/agenda/services/`

**`agenda.service.ts`**
- Método `getCitasPorMedicoYFecha(filtro: FiltroAgenda)`: llama a `GET /citas/agenda` con los parámetros del filtro. Retorna un observable con el array de citas.

#### `features/medicos/services/`

**`medicos.service.ts`**
- Método `getMedicos()`: llama a `GET /api/v1/medicos`. Retorna la lista de médicos activos.

#### `features/medicos/models/`

**`medico.model.ts`**
- `id`, `nombreCompleto`, `especialidad`, `intervaloAtencion`, `estado`

#### `features/agenda/components/buscador-citas/`

**`buscador-citas.component.ts`**

Qué hace:
- Formulario reactivo con dos campos: selector de médico (dropdown) y selector de fecha (datepicker).
- Al inicializar: carga la lista de médicos activos desde `medicos.service`.
- Al cambiar cualquier campo: emite un `EventEmitter` con el `FiltroAgenda` al page que lo contiene.
- No hace llamadas HTTP directamente, solo emite el filtro.

Outputs:
- `@Output() filtroChange: EventEmitter<FiltroAgenda>`

#### `shared/components/tabla-datos/`

**`tabla-datos.component.ts`**

Qué hace:
- Recibe un array genérico de datos y una definición de columnas por `@Input()`.
- Renderiza las filas y columnas dinámicamente.
- Muestra el componente `empty-state` cuando el array está vacío.
- Muestra el `spinner` mientras `isLoading` es `true`.

Inputs:
- `@Input() datos: any[]`
- `@Input() columnas: ColumnaTabla[]`
- `@Input() isLoading: boolean`
- `@Input() totalRegistros: number`

Donde `ColumnaTabla` es una interfaz en `shared/models/` con: `campo`, `titulo`, `tipo`.

#### `features/agenda/components/tabla-citas/`

**`tabla-citas.component.ts`**

Qué hace:
- Instancia de `tabla-datos` preconfigurada con las columnas específicas de citas: hora, documento, nombre completo, celular, observaciones.
- Recibe el array de citas y el estado de carga por `@Input()`.
- Muestra el total de citas encima de la tabla.

Inputs:
- `@Input() citas: Cita[]`
- `@Input() isLoading: boolean`

#### `features/agenda/pages/lista-citas-page/`

**`lista-citas-page.component.ts`**

Qué hace:
- Orquesta el buscador y la tabla.
- Al recibir el evento `filtroChange` del buscador: llama a `agenda.service.getCitasPorMedicoYFecha()`.
- Gestiona el estado de carga y el array de citas.
- Pasa los datos a `tabla-citas`.

Signals de estado:
- `citas = signal<Cita[]>([])`
- `isLoading = signal<boolean>(false)`
- `totalCitas = computed(() => this.citas().length)`

#### `features/agenda/agenda.routes.ts`

Crear el archivo de rutas del feature:

```
/agenda        → ListaCitasPageComponent  (guards: AGENDADOR, MEDICO_TERAPISTA, ADMIN)
```

#### Registrar en `app.routes.ts`

Agregar la ruta lazy de agenda bajo el `ShellComponent`.

### Orden de construcción para RF-01

```
1. core/models/               → user.model.ts, api-response.model.ts
2. shared/constants/          → roles.ts, especialidades.ts
3. core/auth/                 → token.service.ts, auth.service.ts
4. core/guards/               → auth.guard.ts, role.guard.ts
5. core/interceptors/         → jwt.interceptor.ts, error.interceptor.ts
6. core/layout/               → shell, sidebar, topbar (estructura básica)
7. features/medicos/models/   → medico.model.ts
8. features/medicos/services/ → medicos.service.ts
9. features/agenda/models/    → cita.model.ts, filtro-agenda.model.ts
10. features/agenda/services/ → agenda.service.ts
11. shared/components/        → tabla-datos, empty-state, spinner
12. features/agenda/components/ → buscador-citas, tabla-citas
13. features/agenda/pages/    → lista-citas-page
14. features/agenda/          → agenda.routes.ts
15. app.routes.ts             → registrar ruta lazy de agenda
```

### Verificación

Al completar RF-01, el desarrollador debe poder:
- Iniciar sesión con un usuario agendador.
- Navegar a `/agenda`.
- Seleccionar un médico y una fecha.
- Ver la tabla de citas con el total.

---

## Fase 2 — RF-02: Crear cita manual

**Historia:** Como agendador necesito crear una nueva cita de un paciente que me contactó por WhatsApp.

**Endpoints:**
- `GET /api/v1/medicos` — lista de médicos activos
- `GET /api/v1/medicos/{medicoId}/configuracion` — configuración y horario del médico
- `GET /api/v1/citas/disponibilidad/primera` — primera franja disponible
- `GET /api/v1/pacientes/buscar?documento=...` — buscar paciente existente
- `POST /api/v1/citas/manual` — crear la cita

**Roles permitidos:** `AGENDADOR`, `MEDICO_TERAPISTA`

### Archivos a crear

#### `features/pacientes/models/`

**`paciente.model.ts`**
- `id`, `numeroDocumento`, `nombresApellidos`, `celular`, `genero`, `fechaNacimiento` (opcional), `correoElectronico` (opcional)

**`crear-paciente.dto.ts`**
- Mismo set de campos que `paciente.model.ts`, todos tipados para el payload del formulario.

#### `features/pacientes/services/`

**`pacientes.service.ts`**
- Método `buscarPorDocumento(documento: string)`: llama a `GET /pacientes/buscar`. Retorna el paciente si existe o `null`.

#### `features/agenda/models/`

**`crear-cita.dto.ts`**
Payload para `POST /citas/manual`:
- `pacienteId` (si el paciente ya existe) o `datosPaciente` (si es nuevo)
- `medicoId`, `fecha`, `hora`, `observaciones` (opcional)

**`disponibilidad.model.ts`**
Estructura de respuesta del endpoint de disponibilidad:
- `fecha`, `hora`, `medicoId`

#### `features/medicos/models/`

**`configuracion-medico.model.ts`**
Respuesta de `GET /medicos/{id}/configuracion`:
- `intervaloMinutos`, `horaInicio`, `horaFin`, `diasAtencion`

#### `features/medicos/services/`

Agregar al `medicos.service.ts` existente:
- Método `getConfiguracion(medicoId: number)`: llama a `GET /medicos/{medicoId}/configuracion`.

#### `shared/validators/`

**`documento-identidad.validator.ts`**
- Valida que el campo no esté vacío y contenga solo números.

**`celular-colombia.validator.ts`**
- Valida que el número tenga 10 dígitos y comience con 3.

#### `shared/directives/`

**`only-numbers.directive.ts`**
- Bloquea caracteres no numéricos en inputs de tipo texto.

#### `features/agenda/components/formulario-paciente/`

**`formulario-paciente.component.ts`**

Qué hace:
- Subformulario reactivo con los campos del paciente.
- Campos obligatorios: número de documento, nombres y apellidos, celular, género.
- Campos opcionales: fecha de nacimiento, correo electrónico.
- Al perder el foco en el campo de documento: emite el documento para que el page busque el paciente en el backend. Si lo encuentra, rellena los campos automáticamente y los pone en modo lectura. Si no lo encuentra, deja el formulario habilitado para ingreso.
- Usa los validadores `documento-identidad` y `celular-colombia`.

Outputs:
- `@Output() documentoIngresado: EventEmitter<string>` — para disparar la búsqueda.
- `@Output() formularioChange: EventEmitter<FormGroup>`

#### `features/agenda/components/selector-horario/`

**`selector-horario.component.ts`**

Qué hace:
- Recibe la fecha seleccionada, el médico seleccionado y las citas ya ocupadas.
- Calcula y muestra las franjas horarias disponibles en formato de grilla o lista.
- Las franjas se derivan de la configuración del médico (`horaInicio`, `horaFin`, `intervaloMinutos`) filtrando las ya ocupadas.
- Al seleccionar una franja: emite la hora al page.
- Marca visualmente las franjas ocupadas (no seleccionables) y la franja seleccionada.

Inputs:
- `@Input() medicoId: number`
- `@Input() fecha: string`
- `@Input() configuracion: ConfiguracionMedico`
- `@Input() citasOcupadas: string[]`

Outputs:
- `@Output() horaSeleccionada: EventEmitter<string>`

#### `features/agenda/pages/nueva-cita-page/`

**`nueva-cita-page.component.ts`**

Qué hace:
- Orquesta el formulario completo de creación de cita.
- Carga la lista de médicos activos al inicializar.
- Al seleccionar un médico: carga su configuración y las citas ocupadas para la fecha seleccionada.
- Al recibir el documento del `formulario-paciente`: busca el paciente en `pacientes.service`.
- Si el paciente existe: pre-rellena el formulario de datos.
- Si no existe: deja el formulario habilitado para ingreso manual.
- Al enviar: construye el `CrearCitaDto` y llama a `agenda.service.crearCitaManual()`.
- En éxito: muestra mensaje de confirmación y ofrece regresar al listado.
- En error de slot ocupado (409): muestra mensaje específico.

Signals de estado:
- `medicos = signal<Medico[]>([])`
- `configuracionMedico = signal<ConfiguracionMedico | null>(null)`
- `citasOcupadas = signal<string[]>([])`
- `pacienteEncontrado = signal<Paciente | null>(null)`
- `isLoading = signal<boolean>(false)`
- `citaCreada = signal<boolean>(false)`

#### Agregar a `agenda.service.ts`

- Método `crearCitaManual(dto: CrearCitaDto)`: llama a `POST /citas/manual`.
- Método `getDisponibilidad(medicoId, fecha)`: llama a `GET /citas/disponibilidad/primera`.

#### Agregar a `features/agenda/agenda.routes.ts`

```
/agenda/nueva   → NuevaCitaPageComponent  (guards: AGENDADOR, MEDICO_TERAPISTA)
```

### Orden de construcción para RF-02

```
1. features/pacientes/models/    → paciente.model.ts, crear-paciente.dto.ts
2. features/pacientes/services/  → pacientes.service.ts
3. features/medicos/models/      → configuracion-medico.model.ts
4. features/medicos/services/    → agregar getConfiguracion() a medicos.service.ts
5. features/agenda/models/       → crear-cita.dto.ts, disponibilidad.model.ts
6. features/agenda/services/     → agregar crearCitaManual() y getDisponibilidad()
7. shared/validators/            → documento-identidad, celular-colombia
8. shared/directives/            → only-numbers
9. features/agenda/components/   → formulario-paciente, selector-horario
10. features/agenda/pages/       → nueva-cita-page
11. features/agenda/routes/      → agregar ruta /agenda/nueva
```

### Verificación

Al completar RF-02, el desarrollador debe poder:
- Navegar a `/agenda/nueva`.
- Ingresar un documento: el sistema busca el paciente y rellena el formulario si existe.
- Seleccionar un médico, una fecha y una franja horaria disponible.
- Guardar la cita y ver el mensaje de confirmación.
- Verificar que la cita aparece en el listado de RF-01.

---

## Fase 3 — RF-04: Configurar parámetros del sistema

**Historia:** Como administrador necesito configurar los parámetros del sistema para el agendamiento autónomo.

**Endpoints:**
- `GET /api/v1/medicos` — lista de médicos
- `GET /api/v1/medicos/{medicoId}/configuracion` — configuración actual
- `PUT /api/v1/medicos/{medicoId}/configuracion` — guardar configuración

**Rol permitido:** exclusivamente `ADMIN`

Esta fase se implementa antes de RF-03 porque la configuración de médicos es el insumo que RF-03 necesita para calcular las franjas disponibles.

### Archivos a crear

#### `features/configuracion/models/`

**`configuracion-sistema.model.ts`**
- `ventanaAgendamientoSemanas: number` — cuántas semanas hacia adelante se habilitan citas.

**`configuracion-medico-form.model.ts`**
Interfaz del formulario de configuración por profesional:
- `medicoId: number`
- `diasAtencion: string[]` — ej. `['LUNES', 'MARTES', 'MIERCOLES']`
- `horaInicio: string` — formato `HH:mm`
- `horaFin: string` — formato `HH:mm`
- `intervaloMinutos: number`

#### `features/configuracion/services/`

**`configuracion.service.ts`**
- Método `getConfiguracionMedico(medicoId)`: llama a `GET /medicos/{medicoId}/configuracion`.
- Método `guardarConfiguracionMedico(medicoId, dto)`: llama a `PUT /medicos/{medicoId}/configuracion`.
- Método `getConfiguracionGlobal()`: pendiente de endpoint en backend — dejar como stub con comentario `TODO`.
- Método `guardarConfiguracionGlobal(dto)`: ídem.

#### `shared/validators/`

**`rango-horario.validator.ts`**
- Validación de grupo: la `horaFin` debe ser posterior a la `horaInicio`.
- Se aplica como validador de nivel `FormGroup`, no de campo individual.

#### `features/configuracion/components/form-configuracion-medico/`

**`form-configuracion-medico.component.ts`**

Qué hace:
- Formulario reactivo para los parámetros de un médico específico.
- Campo de días de atención: checkboxes con los días de la semana (Lunes a Viernes).
- Campo de hora inicio y hora fin: inputs de tipo `time`.
- Campo de intervalo: input numérico en minutos, valor mínimo de 1.
- Al inicializar: recibe el `medicoId` y carga la configuración actual para pre-rellenar.
- Al guardar: llama a `configuracion.service.guardarConfiguracionMedico()`.
- Aplica el validador `rango-horario` al grupo de horas.
- Muestra mensaje de éxito o error según la respuesta.

Inputs:
- `@Input() medico: Medico`

#### `features/configuracion/pages/configuracion-medico-page/`

**`configuracion-medico-page.component.ts`**

Qué hace:
- Carga la lista de médicos activos al inicializar.
- Renderiza un acordeón o lista: cada ítem es un médico con su formulario `form-configuracion-medico` embebido.
- Permite guardar la configuración de cada médico individualmente.

Signals de estado:
- `medicos = signal<Medico[]>([])`
- `isLoading = signal<boolean>(false)`
- `medicoExpandido = signal<number | null>(null)`

#### `features/configuracion/pages/configuracion-global-page/`

**`configuracion-global-page.component.ts`**

Qué hace:
- Formulario simple con el campo de ventana de agendamiento en semanas (input numérico, mínimo 1).
- Carga el valor actual al inicializar.
- Guarda el nuevo valor al enviar.

> El endpoint de configuración global está pendiente de implementación en el backend. Crear el componente y el formulario completos; el método del servicio que llama al backend se deja como stub hasta que el contrato esté disponible.

#### `features/configuracion/configuracion.routes.ts`

```
/configuracion          → ConfiguracionMedicoPageComponent
/configuracion/global   → ConfiguracionGlobalPageComponent
```

Ambas rutas protegidas con `role.guard(['ADMIN'])`.

#### Registrar en `app.routes.ts`

Agregar la ruta lazy de configuración bajo el `ShellComponent` con el guard de rol ADMIN.

### Orden de construcción para RF-04

```
1. features/configuracion/models/     → configuracion-sistema.model.ts, configuracion-medico-form.model.ts
2. features/configuracion/services/   → configuracion.service.ts
3. shared/validators/                 → rango-horario.validator.ts
4. features/configuracion/components/ → form-configuracion-medico
5. features/configuracion/pages/      → configuracion-medico-page, configuracion-global-page
6. features/configuracion/            → configuracion.routes.ts
7. app.routes.ts                      → registrar ruta lazy de configuracion
8. sidebar                            → agregar ítem "Configuración" solo para ADMIN
```

### Verificación

Al completar RF-04, el desarrollador debe poder:
- Iniciar sesión como ADMIN.
- Ver el ítem "Configuración" en el sidebar (no visible para otros roles).
- Navegar a `/configuracion` y ver la lista de médicos.
- Expandir un médico, modificar días de atención, franja horaria e intervalo.
- Guardar y ver confirmación. Verificar que los cambios persisten al recargar.

---

## Fase 4 — RF-03: Agendar cita autónoma (paciente)

**Historia:** Como paciente necesito agendar una cita por la web de manera sencilla y rápida.

**Endpoints:**
- `GET /api/v1/medicos` — lista de médicos con especialidades
- `GET /api/v1/medicos/{medicoId}/configuracion` — configuración por médico
- `GET /api/v1/citas/disponibilidad/primera` — primera franja disponible por médico
- `GET /api/v1/citas/disponibilidad/primera/global` — primera franja global entre todos los médicos
- `POST /api/v1/citas/autonomo` — confirmar la cita
- `POST /auth/register/paciente` — registro de nuevo paciente

**Rol permitido:** `PACIENTE`

Este es el RF más complejo del sprint. Depende de que RF-04 esté implementado para que la disponibilidad sea correcta.

### Archivos a crear

#### Página de registro de paciente

Crear en `features/auth/pages/registro-paciente-page/`:

**`registro-paciente-page.component.ts`**

Qué hace:
- Formulario de registro: usuario, contraseña, nombre completo, documento, celular, género.
- Llama a `POST /auth/register/paciente`.
- En éxito: redirige a `/login` con mensaje de cuenta creada.
- Enlace desde la página de login hacia esta vista: "¿No tienes cuenta? Regístrate aquí."

#### `features/agenda/models/`

**`agendar-autonomo.dto.ts`**
Payload para `POST /citas/autonomo`:
- `medicoId`, `fecha`, `hora`

**`opcion-horario.model.ts`**
Estructura de una franja disponible para mostrar al paciente:
- `medicoId`, `nombreMedico`, `especialidad`, `fecha`, `hora`

#### Agregar a `agenda.service.ts`

- Método `agendarAutonomo(dto: AgendarAutonomoDto)`: llama a `POST /citas/autonomo`.
- Método `getPrimeraDisponibilidadGlobal()`: llama a `GET /citas/disponibilidad/primera/global`.

#### `features/agenda/components/asistente-agendamiento/`

El asistente es el corazón de RF-03. Se implementa como un componente de pasos (wizard) con navegación entre etapas.

**`asistente-agendamiento.component.ts`**

Estructura de pasos:

```
Paso 1 — Seleccionar especialidad o médico
Paso 2 — Seleccionar fecha y franja horaria
Paso 3 — Confirmar y agendar
```

**Paso 1 — Selección de especialidad o médico:**
- Muestra tarjetas con las tres especialidades disponibles.
- Al seleccionar una especialidad: filtra y muestra los médicos de esa especialidad.
- El paciente puede escoger directamente un médico o dejar que el sistema sugiera el de menor espera.
- Al seleccionar un médico: avanza al paso 2.

**Paso 2 — Selección de fecha y horario:**
- Muestra un selector de fecha que habilita únicamente los días de atención del médico seleccionado (tomados de su configuración).
- Al seleccionar una fecha: carga las franjas disponibles usando el componente `selector-horario` ya construido en RF-02.
- Opción adicional: botón "Primer horario disponible" que llama a `GET /citas/disponibilidad/primera` y pre-selecciona la franja.
- Al seleccionar una franja: avanza al paso 3.

**Paso 3 — Confirmación:**
- Muestra el resumen completo: médico, especialidad, fecha y hora.
- Botón de confirmación que llama a `agenda.service.agendarAutonomo()`.
- En éxito: muestra pantalla de confirmación con los datos de la cita agendada.
- En error de slot ocupado (409): regresa al paso 2 con mensaje de que esa franja ya no está disponible.

Estado interno del wizard:
- `pasoActual = signal<number>(1)`
- `medicoSeleccionado = signal<Medico | null>(null)`
- `fechaSeleccionada = signal<string | null>(null)`
- `horaSeleccionada = signal<string | null>(null)`
- `isLoading = signal<boolean>(false)`
- `citaConfirmada = signal<boolean>(false)`

#### `features/agenda/pages/agendar-autonomo-page/`

**`agendar-autonomo-page.component.ts`**

Qué hace:
- Contenedor de la vista del paciente.
- Carga la lista de médicos activos al inicializar.
- Instancia el `asistente-agendamiento` pasándole los médicos disponibles.
- No contiene lógica del wizard, solo provee los datos iniciales.

#### `features/agenda/agenda.routes.ts`

Agregar la ruta del asistente:

```
/agendar   → AgendarAutonomoPageComponent  (guard: PACIENTE)
```

Esta ruta se registra bajo el `PatientShellComponent` en `app.routes.ts`.

#### `app.routes.ts`

Agregar el grupo de rutas del paciente:

```
/paciente                 → PatientShellComponent (auth guard + role guard PACIENTE)
  /paciente/agendar       → lazy → agenda.routes.ts
```

### Orden de construcción para RF-03

```
1. features/auth/pages/          → registro-paciente-page
2. app.routes.ts                 → agregar ruta /registro con no-auth guard
3. features/agenda/models/       → agendar-autonomo.dto.ts, opcion-horario.model.ts
4. features/agenda/services/     → agregar agendarAutonomo() y getPrimeraDisponibilidadGlobal()
5. features/agenda/components/   → asistente-agendamiento (3 pasos)
6. features/agenda/pages/        → agendar-autonomo-page
7. features/agenda/routes/       → agregar ruta /agendar
8. app.routes.ts                 → agregar grupo de rutas del paciente con PatientShellComponent
9. core/layout/patient-shell/    → completar si estaba en borrador
```

### Verificación

Al completar RF-03, el desarrollador debe poder:
- Registrar un nuevo usuario con rol paciente desde `/registro`.
- Iniciar sesión: el sistema redirige a `/paciente/agendar` (no al shell del staff).
- Completar los tres pasos del asistente y confirmar una cita.
- Verificar que la cita aparece en el listado de RF-01 al consultarla con un agendador.

---

## Resumen de archivos del Sprint 1

### Archivos nuevos por capa

| Capa | Archivos creados |
|------|-----------------|
| `core/auth/` | `auth.service.ts`, `token.service.ts` |
| `core/guards/` | `auth.guard.ts`, `role.guard.ts`, `no-auth.guard.ts` |
| `core/interceptors/` | `jwt.interceptor.ts`, `error.interceptor.ts` |
| `core/layout/` | `shell`, `patient-shell`, `sidebar`, `topbar` |
| `core/models/` | `user.model.ts`, `api-response.model.ts`, `pagination.model.ts` |
| `shared/components/` | `tabla-datos`, `empty-state`, `spinner` |
| `shared/validators/` | `documento-identidad`, `celular-colombia`, `rango-horario` |
| `shared/directives/` | `only-numbers` |
| `shared/constants/` | `roles.ts`, `especialidades.ts`, `dias-semana.ts` |
| `features/auth/` | `login-page`, `registro-paciente-page` |
| `features/medicos/` | `medico.model.ts`, `configuracion-medico.model.ts`, `medicos.service.ts` |
| `features/pacientes/` | `paciente.model.ts`, `crear-paciente.dto.ts`, `pacientes.service.ts` |
| `features/agenda/` | 4 pages, 5 components, 5 models, `agenda.service.ts`, `agenda.routes.ts` |
| `features/configuracion/` | 2 pages, 1 component, 2 models, `configuracion.service.ts`, `configuracion.routes.ts` |

### Archivos de configuración modificados

| Archivo | Cambios |
|---------|---------|
| `app.config.ts` | Registro de interceptores y providers globales |
| `app.routes.ts` | Tres grupos de rutas: públicas, staff y paciente |

---

## Reglas a mantener durante el sprint

- Cada servicio llama solo endpoints de su dominio. `agenda.service` no llama a `/medicos`.
- Ningún componente usa `HttpClient` directamente.
- Todo estado reactivo de un componente se declara como `signal()` al inicio del archivo.
- Los guards se configuran en `app.routes.ts`, no en el constructor de los componentes.
- Al crear un modelo de respuesta del backend, verificar el contrato real del endpoint antes de definir la interfaz. No asumir nombres de campos.
- Si un endpoint está marcado como `PENDIENTE` en el backend, crear el método del servicio con una implementación stub y un comentario `TODO: implementar cuando el backend exponga el endpoint`.

---

*Guía de implementación Sprint 1 · Piedrazul Frontend · Ingeniería de Software III 2026.1*
