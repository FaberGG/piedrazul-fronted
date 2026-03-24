# Piedrazul — Frontend

Sistema web de agendamiento de citas médicas para la **Red de Servicios Médicos de Piedrazul**, Popayán.

---

## Tabla de contenidos

- [Contexto del proyecto](#contexto-del-proyecto)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura de carpetas](#estructura-de-carpetas)
- [Configuración y ejecución](#configuración-y-ejecución)
- [Variables de entorno](#variables-de-entorno)
- [Guia de estandares UI](#guia-de-estandares-ui)
- [Guía de contribución](#guía-de-contribución)

---

## Contexto del proyecto

La Red de Servicios Médicos de Piedrazul es una organización sin ánimo de lucro ubicada en el kilómetro 5 vía al Huila, Popayán, que brinda atención en medicina alternativa (terapia neural, quiropraxia y fisioterapia) de lunes a viernes en jornada de mañana.

Este frontend reemplaza un software de escritorio monolítico con una aplicación web moderna que permite:

- **Agendamiento autónomo** por parte de los pacientes, sin depender del personal del centro.
- **Agendamiento manual** por parte del personal (agendadores y médicos) desde cualquier dispositivo con navegador.
- **Gestión operativa** de médicos, terapistas, historias clínicas y configuración de disponibilidad.
- **Reportes y auditoría** para la toma de decisiones y el control del sistema.

El sistema maneja cuatro roles: **Administrador**, **Agendador de citas**, **Médico/Terapista** y **Paciente**. Cada rol accede a un subconjunto de funcionalidades protegido por guards y renderizado condicionalmente en la interfaz.

El frontend se comunica exclusivamente con el backend de Piedrazul (Spring Boot + JWT) a través de su API REST documentada en `http://localhost:8080/api/v1`.

Repositorio del backend: _(agregar URL aquí)_

---

## Stack tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Angular | 21.1 |
| Lenguaje | TypeScript | 5.7+ |
| Estilos | SCSS | — |
| Gestión de estado | Angular Signals | nativo Angular 21 |
| Enrutamiento | Angular Router | nativo Angular 21 |
| HTTP | Angular HttpClient | nativo Angular 21 |
| Autenticación | JWT (stateless) | — |
| Gráficas | Chart.js + ng2-charts | latest |
| Testing unitario | Jest | 29+ |
| Testing e2e | Playwright | latest |
| Linting | ESLint + Angular ESLint | latest |
| Formateo | Prettier | 3+ |
| Gestor de paquetes | npm | 10+ |

> El proyecto usa **standalone components** de Angular (sin NgModules tradicionales) y **lazy loading** por feature. No se usa `app.module.ts`.

---

## Estructura de carpetas

```
piedrazul-frontend/
├── src/
│   ├── app/
│   │   ├── core/                  # Singleton services, guards, interceptors, layout
│   │   │   ├── auth/              # Servicio de sesión y JWT
│   │   │   ├── guards/            # auth.guard, role.guard, no-auth.guard
│   │   │   ├── interceptors/      # jwt.interceptor, error.interceptor
│   │   │   ├── layout/
│   │   │   │   ├── shell/         # Layout del staff (sidebar + topbar + outlet)
│   │   │   │   ├── patient-shell/ # Layout del paciente (header + outlet)
│   │   │   │   ├── sidebar/       # Menú lateral filtrado por rol
│   │   │   │   └── topbar/        # Encabezado con info de sesión
│   │   │   ├── models/            # Interfaces globales (User, ApiResponse, Pagination)
│   │   │   └── utils/             # Funciones puras (fechas, roles)
│   │   │
│   │   ├── shared/                # Artefactos reutilizables entre features
│   │   │   ├── components/        # tabla-datos, modal-confirmacion, badge-estado, empty-state
│   │   │   ├── directives/        # only-numbers, click-outside, auto-focus
│   │   │   ├── pipes/             # hora-formato, nombre-completo, rol-label, fecha-corta
│   │   │   ├── validators/        # documento-identidad, celular-colombia, hora-disponible
│   │   │   ├── ui/                # Componentes atómicos: spinner, alert, avatar, tooltip
│   │   │   └── constants/         # especialidades, roles, dias-semana, estados-cita
│   │   │
│   │   ├── features/              # Módulos de dominio (lazy loaded)
│   │   │   ├── agenda/            # RF-01 · RF-02 · RF-03 · RF-08 · RF-09
│   │   │   ├── pacientes/         # Búsqueda y consulta de pacientes
│   │   │   ├── medicos/           # Gestión de médicos y terapistas (RF-07)
│   │   │   ├── configuracion/     # Parámetros del sistema (RF-04) — solo ADMIN
│   │   │   ├── reportes/          # Estadísticas y gráficas (RF-12)
│   │   │   ├── auditoria/         # Log de operaciones (RF-11) — solo ADMIN
│   │   │   └── historia-clinica/  # Controles médicos por cita (RF-10)
│   │   │
│   │   ├── app.config.ts          # Providers globales (router, http, interceptores)
│   │   ├── app.routes.ts          # Rutas raíz con lazy loading y guards
│   │   └── app.component.ts       # Componente raíz (solo <router-outlet>)
│   │
│   ├── environments/
│   │   ├── environment.ts         # Configuración de desarrollo
│   │   └── environment.prod.ts    # Configuración de producción
│   ├── assets/
│   │   └── images/                # Logo, imagen de portada
│   ├── styles/
│   │   ├── styles.scss            # Punto de entrada de estilos globales
│   │   ├── _variables.scss        # Paleta, tipografía, espaciados
│   │   └── _reset.scss            # Normalización de estilos del navegador
│   └── index.html
│
├── .editorconfig
├── .eslintrc.json
├── .prettierrc
├── angular.json
├── package.json
└── tsconfig.json
```

Cada feature dentro de `features/` sigue el mismo patrón interno:

```
features/<dominio>/
├── pages/               # Componentes ruteados (una página = una ruta)
├── components/          # UI específica del dominio, no ruteada
├── services/            # Llamadas HTTP al backend
├── models/              # Interfaces y DTOs del dominio
├── store/               # Estado reactivo con Signals
└── <dominio>.routes.ts  # Rutas lazy del feature
```

Para un detalle completo de responsabilidades por directorio, consultar [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## Configuración y ejecución

### Requisitos previos

| Herramienta | Versión mínima |
|-------------|---------------|
| Node.js | 22.x LTS |
| npm | 10.x |
| Angular CLI | 21.1.x |
| Git | 2.40+ |

Verificar instalaciones:

```bash
node -v
npm -v
ng version
```

Instalar Angular CLI globalmente si no está disponible:

```bash
npm install -g @angular/cli@21.1
```

---

### Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd piedrazul-frontend

# 2. Instalar dependencias
npm install
```

---

### Ejecución en desarrollo

Asegurarse de que el backend de Piedrazul esté corriendo en `http://localhost:8080` antes de iniciar el frontend.

```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200`.

El servidor de desarrollo incluye hot module replacement (HMR): los cambios en el código se reflejan en el navegador sin necesidad de recargar manualmente.

---

### Compilación para producción

```bash
npm run build
```

Los artefactos compilados se generan en `dist/piedrazul-frontend/`. Estos archivos estáticos pueden ser servidos por cualquier servidor web (Nginx, Apache, Node.js).

---

### Ejecución de pruebas

```bash
# Pruebas unitarias
npm test

# Pruebas unitarias en modo watch (desarrollo)
npm run test:watch

# Pruebas end-to-end
npm run e2e

# Cobertura de pruebas
npm run test:coverage
```

---

### Linting y formateo

```bash
# Verificar reglas de ESLint
npm run lint

# Corregir errores de lint automáticamente
npm run lint:fix

# Verificar formateo con Prettier
npm run format:check

# Aplicar formateo con Prettier
npm run format
```

---

## Variables de entorno

La URL base de la API y otras configuraciones de ambiente se definen en los archivos de entorno. **No hardcodear URLs ni credenciales en componentes o servicios.**

**`src/environments/environment.ts`** — desarrollo local:

```
apiUrl:       http://localhost:8080/api/v1
production:   false
```

**`src/environments/environment.prod.ts`** — producción:

```
apiUrl:       <URL del servidor de producción>
production:   true
```

> `environment.prod.ts` no debe contener credenciales ni datos sensibles. Si el despliegue requiere variables en tiempo de ejecución, usar un mecanismo de configuración externa (variables de entorno del servidor o un archivo de configuración inyectado en el CI/CD).

---

## Guia de estandares UI

Para mantener consistencia visual (tipografia, colores, espaciados, estados y uso de tokens), consultar:

- `guia-estandares-ui.md`

---

## Guía de contribución

### Flujo de trabajo con Git

El proyecto usa **Git Flow** simplificado con tres tipos de ramas:

| Rama | Propósito |
|------|-----------|
| `main` | Código estable, solo recibe merges desde `develop` en releases |
| `develop` | Integración continua del trabajo del equipo |
| `feature/<nombre>` | Desarrollo de una funcionalidad o historia de usuario |

**Flujo para una nueva funcionalidad:**

```bash
# 1. Partir siempre desde develop actualizado
git checkout develop
git pull origin develop

# 2. Crear rama de feature con nombre descriptivo
git checkout -b feature/RF-01-listar-citas-agenda

# 3. Desarrollar y hacer commits atómicos (ver convención abajo)
git add .
git commit -m "feat(agenda): implementar buscador de citas por medico y fecha"

# 4. Mantener la rama actualizada con develop durante el desarrollo
git fetch origin
git rebase origin/develop

# 5. Abrir Pull Request hacia develop cuando el feature esté completo
```

---

### Convención de commits

El proyecto sigue [Conventional Commits](https://www.conventionalcommits.org/). Esto permite generar changelogs automáticos y mantener un historial legible.

**Formato:**

```
<tipo>(<scope>): <descripción en minúsculas, imperativo, sin punto final>
```

**Tipos permitidos:**

| Tipo | Cuándo usarlo |
|------|--------------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `refactor` | Cambio de código sin corrección ni nueva funcionalidad |
| `style` | Cambios de formato, espacios, nombres (sin impacto en lógica) |
| `test` | Agregar o corregir pruebas |
| `docs` | Cambios en documentación |
| `chore` | Tareas de mantenimiento (dependencias, configuración) |

**Scopes válidos** (corresponden a los features y capas del proyecto):

`agenda` · `pacientes` · `medicos` · `configuracion` · `reportes` · `auditoria` · `historia-clinica` · `core` · `shared` · `layout` · `auth` · `routing`

**Ejemplos:**

```bash
feat(agenda): agregar componente selector-horario con franjas disponibles
fix(auth): corregir redirección al expirar el JWT en background
refactor(shared): extraer tabla-datos a componente standalone reutilizable
test(agenda): agregar pruebas unitarias al servicio agenda.service
docs(core): documentar contratos de guards en auth.guard y role.guard
chore: actualizar dependencias de Angular a 21.1.2
```

---

### Estándares de código

**Nomenclatura de archivos:** kebab-case para todos los archivos. El sufijo describe el tipo de artefacto.

```
lista-citas-page.component.ts
agenda.service.ts
hora-formato.pipe.ts
role.guard.ts
crear-cita.dto.ts
```

**Nomenclatura de clases:** PascalCase.

```typescript
ListaCitasPageComponent
AgendaService
HoraFormatoPipe
```

**Componentes:** usar `@Component` con `standalone: true` y `changeDetection: ChangeDetectionStrategy.OnPush` como práctica base para todos los componentes nuevos.

**Inyección de dependencias:** usar la función `inject()` en lugar del constructor para todos los servicios y dependencias.

**Estado reactivo:** preferir Angular Signals para estado local y derivado. Evitar `BehaviorSubject` y `Observable` para estado de UI cuando un signal es suficiente.

**Imports en templates:** declarar en el array `imports` del `@Component` solo los artefactos que el template usa directamente.

---

### Checklist antes de abrir un Pull Request

Antes de solicitar revisión, verificar que:

- [ ] El código compila sin errores (`ng build`).
- [ ] Las pruebas unitarias pasan (`npm test`).
- [ ] No hay errores de lint (`npm run lint`).
- [ ] El código está formateado con Prettier (`npm run format:check`).
- [ ] Los commits siguen la convención de Conventional Commits.
- [ ] El PR tiene un título descriptivo que referencia el RF o la tarea.
- [ ] Si se agregó un nuevo feature, tiene su archivo `.routes.ts` y está registrado en `app.routes.ts` con lazy loading.
- [ ] Si se agregó un componente a `shared/`, es genuinamente reutilizable por más de un feature.
- [ ] No se escribieron URLs de la API como literales fuera de `environments/`.

---

### Estructura de un Pull Request

**Título:** seguir la misma convención de commits.

```
feat(agenda): implementar asistente de agendamiento autonomo (RF-03)
```

**Descripción mínima esperada:**

```
## Qué hace este PR
Breve descripción de los cambios.

## RF relacionado
RF-03 — Agendar cita autónoma (paciente)

## Cómo probar
1. Iniciar sesión con un usuario de rol PACIENTE.
2. Navegar a /paciente/agendar.
3. Seleccionar especialidad, médico y franja horaria disponible.
4. Confirmar la cita y verificar que aparece en la agenda del médico.

## Notas para el revisor
Cualquier decisión de diseño relevante o deuda técnica conocida.
```

---

*Proyecto académico — Ingeniería de Software III, Universidad del Cauca, semestre 2026.1.*
