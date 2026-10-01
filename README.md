# TaskFlow · Vanilla JS

Tablero de tareas y proyectos estilo **Kanban** (parecido a una version reducida de Trello/Jira), construido con **HTML, CSS y JavaScript puro** — sin React, sin Vue, sin Angular, sin jQuery.

Este repo es parte de un portafolio con el mismo dominio implementado en distintas tecnologias. Aca el objetivo es mostrar dominio solido de **JavaScript y DOM nativos**: manipulacion directa del DOM, `fetch`, modulos ES, un router hecho a mano basado en `location.hash`, y la API nativa de **HTML5 Drag and Drop**.

## Que hace

- **Login** simple contra un mock backend (email + password).
- **Lista de proyectos** del usuario logueado.
- **Tablero Kanban** por proyecto con tres columnas: `TODO` (Por hacer), `IN_PROGRESS` (En progreso) y `DONE` (Hecho).
- **Crear, editar y eliminar** tareas.
- **Mover tareas** entre columnas de dos formas:
  - Arrastrando la tarjeta (drag & drop nativo HTML5).
  - Con el selector "Mover a" de cada tarjeta (alternativa accesible, sin mouse).
- Actualizaciones **optimistas**: la UI cambia al instante y se revierte con un aviso (toast) si el backend falla.

## Stack

- **Frontend:** JavaScript vanilla (ES modules), HTML5, CSS3 con variables CSS.
- **Dev server / bundler:** [Vite](https://vitejs.dev/) (solo como servidor de desarrollo y build, el codigo de la app no depende de ningun framework).
- **Mock backend:** [json-server](https://github.com/typicode/json-server) sobre un `db.json` semilla con `users`, `projects` y `tasks`. No hay JWT real: el login valida el email/password contra `/users` y guarda el usuario (sin password) en `localStorage`.
- **Tests unitarios:** [Vitest](https://vitest.dev/) para las funciones puras de logica (agrupar tareas por columna, validaciones de formularios, etc).
- **Tests end-to-end:** [Playwright](https://playwright.dev/) simulando un usuario real en el navegador (login, proyectos, tablero, crear/mover/editar/borrar tarea, logout).

No hay backend propio mas alla de json-server: el repo es autocontenible y no depende de ningun otro proyecto del portafolio.

> **Versiones:** Vite y Vitest estan en la ultima major compatible con Node 18
> (`vite@6` / `vitest@3`; las majors siguientes ya exigen Node 20+).
> `json-server` sigue en `0.17.4` a proposito: es la ultima version
> **estable** del paquete — la serie `1.0.0-beta.*` lleva mas de un año como
> `latest` en npm sin llegar a release estable, asi que no es una buena
> apuesta para un repo que tiene que seguir funcionando.

## Estructura del proyecto

```
taskflow-vanilla-js/
├── db.json                 # Semilla del mock backend (users, projects, tasks)
├── index.html               # Punto de entrada + <template> de la tarjeta de tarea
├── src/
│   ├── main.js               # Bootstrap: rutas, topbar, guard de sesion
│   ├── router.js              # Router a mano basado en location.hash
│   ├── api.js                  # Cliente fetch contra json-server
│   ├── session.js               # Sesion del usuario en localStorage
│   ├── logic.js                   # Funciones puras (testeadas con Vitest)
│   ├── styles.css
│   ├── components/
│   │   ├── taskCard.js            # Tarjeta de tarea (drag&drop, acciones)
│   │   ├── taskModal.js           # Modal de crear/editar tarea
│   │   └── toast.js               # Notificaciones simples
│   └── views/
│       ├── loginView.js
│       ├── projectsView.js
│       └── boardView.js           # El tablero Kanban en si
├── tests/
│   ├── logic.test.js          # Unitarios (Vitest) de src/logic.js
│   └── e2e/
│       ├── task-flow.spec.js        # Suite end-to-end (Playwright)
│       ├── run-mock-server.cjs      # Levanta json-server sobre una COPIA de db.json
│       └── run-dev-server.mjs       # Levanta Vite para los tests (API de Node de Vite)
├── playwright.config.js       # Config de Playwright (webServer, puertos, etc)
└── postman_collection.json    # Coleccion de Postman para probar el backend mock
```

## Como correrlo

Requisitos: Node 18+.

### 1. Instalar dependencias

```bash
npm install
```

### 2. Levantar el mock backend (json-server)

En una terminal:

```bash
npm run server
```

Esto levanta json-server en `http://localhost:3001` sirviendo `/users`, `/projects` y `/tasks` a partir de `db.json`.

### 3. Levantar el frontend

En otra terminal:

```bash
npm run dev
```

Esto abre `http://localhost:5173` con Vite (recarga en caliente). El frontend espera que el mock backend este corriendo en el puerto 3001.

### 4. Usuarios de prueba

El `db.json` ya trae usuarios y proyectos de ejemplo:

| Email                  | Password   |
| ----------------------- | ---------- |
| mariana@taskflow.dev    | demo1234   |
| diego@taskflow.dev      | demo1234   |

### Tests unitarios

```bash
npm test          # corre una vez
npm run test:watch  # modo watch
```

### Tests end-to-end (Playwright)

Hay una segunda suite, separada de los unitarios, que simula a un usuario real
usando la app en un navegador de verdad (Chromium): login con un usuario
semilla, ver el listado de proyectos, entrar a uno, ver el tablero con sus 3
columnas, crear una tarea nueva, moverla a "En progreso" con el select
"Mover a", editar su titulo, borrarla y hacer logout.

```bash
npm run test:e2e        # corre toda la suite una vez (headless)
npm run test:e2e:ui     # modo interactivo de Playwright (UI mode)
npm run test:e2e:report # abre el ultimo reporte HTML generado
```

No hace falta levantar nada a mano antes: `playwright.config.js` usa la
opcion [`webServer`](https://playwright.dev/docs/test-webserver) para levantar
automaticamente, antes de correr los tests:

1. Un **json-server** propio de los tests en el puerto `3101`, sirviendo una
   **copia temporal** de `db.json` (ver `tests/e2e/run-mock-server.cjs`).
2. Un **Vite dev server** propio de los tests en el puerto `5183`
   (`tests/e2e/run-dev-server.mjs`), apuntando a ese backend via la env var
   `VITE_API_URL` (`src/api.js` la lee con `import.meta.env.VITE_API_URL`,
   si no esta seteada usa `http://localhost:3001` como siempre).

Usar puertos distintos a los de desarrollo (`5173`/`3001`) es a proposito:
los tests nunca compiten con un `npm run dev` / `npm run server` que ya
este corriendo, y sobre todo **nunca tocan el `db.json` real** — la copia
temporal vive en `tests/e2e/.db.e2e.json` (gitignored) y se borra sola
cuando termina la corrida. Por eso no hace falta ningun paso manual de
"resetear" el `db.json` despues de correr los tests: el original jamas se
escribe.

Si es la primera vez que se corren los tests en esta maquina, Playwright
necesita descargar el navegador una vez:

```bash
npx playwright install chromium
```

### Postman (probar el backend mock directamente)

`postman_collection.json`, en la raiz del repo, trae requests para probar
`json-server` sin pasar por la UI: listar `users`/`projects`/`tasks`,
buscar un usuario por email (lo que hace el login), listar proyectos de un
owner, **filtrar tasks por `projectId`**, y el flujo completo de
crear → editar → mover (cambiar `status`) → borrar una tarea, con un test
que confirma que ya no existe despues del `DELETE`.

Para importarla en Postman:

1. Levantar el mock backend: `npm run server` (queda en `http://localhost:3001`).
2. En Postman: **File → Import** (o el boton **Import** de la barra
   izquierda) y seleccionar `postman_collection.json`.
3. La coleccion ya trae la variable `baseUrl = http://localhost:3001`, asi
   que las requests funcionan tal cual contra el `db.json` semilla.
4. Correr las requests de la carpeta `Tasks` en orden (Crear → Editar →
   Mover → Borrar → Verificar que ya no existe): la de "Crear tarea" guarda
   el `id` devuelto en la variable de coleccion `taskId`, que las siguientes
   requests reusan.

Tambien se puede correr toda la coleccion de una con el **Collection
Runner** de Postman, o por consola con
[Newman](https://github.com/postmanlabs/newman):

```bash
npx newman run postman_collection.json
```

### Build de produccion (opcional)

```bash
npm run build     # genera /dist
npm run preview   # sirve /dist localmente
```

El build de produccion sigue necesitando un json-server corriendo en `http://localhost:3001` (o ajustar `API_URL` en `src/api.js` si se despliega el mock backend en otra URL).

## Descripcion de la UI

- **Pantalla de login:** formulario centrado con email y password, validacion basica en el cliente y mensaje de error si las credenciales no matchean con `db.json`.
- **Pantalla de proyectos:** grilla de tarjetas, una por proyecto del usuario logueado, cada una linkea a su tablero.
- **Tablero:** tres columnas lado a lado (una debajo de otra en pantallas angostas). Cada columna muestra su contador de tareas y un boton "+ Agregar tarea" que abre un modal. Cada tarjeta tiene titulo, descripcion, boton de editar (✎), boton de eliminar (🗑) y un `<select>` "Mover a" para cambiar de columna sin arrastrar. Las tarjetas tambien se pueden arrastrar y soltar entre columnas.
- **Topbar:** visible solo con sesion iniciada, con el nombre del usuario y boton de salir (limpia la sesion de `localStorage` y vuelve al login).

## Decisiones de diseño

- **Sin build obligatorio para el "codigo de la app":** toda la logica vive en modulos ES planos (`import`/`export` nativos). Vite se usa solo para tener recarga en caliente y, opcionalmente, un build minificado — el codigo fuente no usa sintaxis ni APIs exclusivas de ningun framework.
- **Router a mano:** en vez de traer una libreria de routing, `src/router.js` implementa un router minimo basado en `location.hash` con soporte de parametros (`/board/:projectId`), para mostrar manejo de expresiones regulares y eventos del navegador (`hashchange`).
- **Actualizaciones optimistas:** crear, editar, eliminar y mover tareas actualiza el estado en memoria y el DOM antes de que responda el servidor; si la llamada falla, se revierte el cambio y se muestra un toast de error. Esto se nota especialmente al mover tareas por drag & drop.
- **Autenticacion simulada:** como json-server no soporta JWT real, el "login" busca el usuario por email (`GET /users?email=...`), compara el password en el cliente y persiste el usuario (sin el campo `password`) en `localStorage`. No es un esquema de seguridad real — es intencional, dado que el objetivo del repo es demostrar JS/DOM, no autenticacion de produccion.

## Limitaciones conocidas

- El login compara passwords en texto plano contra `db.json` vía json-server; **no** es apto para produccion (no hay hashing, ni tokens, ni backend real).
- No hay control de permisos entre usuarios: cualquier tarea de cualquier proyecto es editable si se conoce su `id` (no hay backend real que valide ownership).
- Los proyectos se filtran por `ownerId`, pero no hay gestion de miembros/colaboradores multiples por proyecto.
- No hay paginacion ni busqueda/filtrado de tareas — pensado para una cantidad chica de tareas de demo.
- Los tests unitarios cubren las funciones puras de `src/logic.js` (agrupado por columnas, validaciones, orden, sanitizado de usuario); la suite end-to-end de Playwright (`tests/e2e/task-flow.spec.js`) cubre el flujo completo de UI en el navegador.
