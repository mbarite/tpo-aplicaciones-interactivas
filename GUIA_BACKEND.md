# Guia Del Backend

Esta guia explica **qué hace cada archivo importante del backend** y en qué parte del código está cada responsabilidad de la consigna.

## 1. Dónde está el backend

El backend está en:

- [backend](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend)

## 2. Entrada principal del proyecto

### [src/server.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/server.js)

Este es el archivo que arranca todo.

Hace estas cosas:

- conecta con MongoDB
- crea el admin inicial si no existe
- levanta el servidor en el puerto configurado

### [src/app.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/app.js)

Este archivo arma la aplicación Express.

Acá están:

- `cors`
- `express.json()`
- `morgan`
- el `healthcheck`
- el registro de rutas
- los middlewares de error

## 3. Configuración

### [src/config/env.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/config/env.js)

Lee las variables del archivo `.env`.

Acá se definen:

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

### [src/config/database.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/config/database.js)

Se encarga de conectarse a MongoDB usando Mongoose.

## 4. Modelos de datos

### [src/models/admin.model.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/models/admin.model.js)

Guarda los administradores.

Campos:

- `username`
- `passwordHash`

Importante:

- la contraseña no se guarda en texto plano
- se guarda cifrada como hash

### [src/models/team.model.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/models/team.model.js)

Representa un equipo.

Campos:

- `name`
- `coachName`

### [src/models/player.model.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/models/player.model.js)

Representa un jugador.

Campos:

- `firstName`
- `lastName`
- `category`
- `team`

### [src/models/match.model.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/models/match.model.js)

Representa un partido.

Campos:

- `homeTeam`
- `awayTeam`
- `date`
- `time`
- `venue`
- `status`
- `homeScore`
- `awayScore`

Importante:

- valida que un equipo no juegue contra sí mismo

## 5. Rutas

Las rutas están en:

- [src/routes](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/routes)

### [src/routes/auth.routes.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/routes/auth.routes.js)

Rutas de autenticación:

- `POST /api/auth/login`
- `GET /api/auth/me`

### [src/routes/team.routes.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/routes/team.routes.js)

Rutas de equipos:

- `GET /api/teams`
- `GET /api/teams/:teamId`
- `POST /api/teams`
- `PUT /api/teams/:teamId`
- `DELETE /api/teams/:teamId`

### [src/routes/player.routes.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/routes/player.routes.js)

Rutas de jugadores:

- `GET /api/players`
- `POST /api/players`
- `PUT /api/players/:playerId`
- `DELETE /api/players/:playerId`

### [src/routes/match.routes.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/routes/match.routes.js)

Rutas de partidos:

- `GET /api/matches`
- `GET /api/matches/calendar`
- `GET /api/matches/results`
- `POST /api/matches`
- `PUT /api/matches/:matchId`
- `PATCH /api/matches/:matchId/result`
- `DELETE /api/matches/:matchId`

### [src/routes/standing.routes.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/routes/standing.routes.js)

Ruta de clasificación:

- `GET /api/standings`

## 6. Controladores

Los controladores reciben la request y devuelven la response.

Están en:

- [src/controllers](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/controllers)

### [src/controllers/auth.controller.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/controllers/auth.controller.js)

Hace:

- login del admin
- validación de credenciales
- generación de token JWT
- lectura del admin autenticado

### [src/controllers/team.controller.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/controllers/team.controller.js)

Hace:

- listar equipos
- ver detalle de un equipo
- crear equipo
- editar equipo
- eliminar equipo

Importante:

- no deja borrar un equipo si tiene jugadores o partidos asociados

### [src/controllers/player.controller.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/controllers/player.controller.js)

Hace:

- listar jugadores
- crear jugador
- editar jugador
- eliminar jugador

### [src/controllers/match.controller.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/controllers/match.controller.js)

Hace:

- listar partidos
- crear partido
- editar partido
- eliminar partido
- cargar resultado

Importante:

- valida que local y visitante sean distintos
- valida que los equipos existan

### [src/controllers/standing.controller.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/controllers/standing.controller.js)

Hace:

- devolver la tabla de posiciones

## 7. Lógica de negocio principal

### [src/services/standing.service.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/services/standing.service.js)

Este es uno de los archivos más importantes.

Acá está la lógica de negocio que resuelve la consigna de clasificación.

Hace:

- calcula la tabla de posiciones
- cuenta partidos jugados
- cuenta ganados, empatados y perdidos
- suma puntos
- suma tantos a favor y en contra
- calcula diferencia de tantos
- ordena por reglas de desempate

Las reglas implementadas son:

- victoria = 3 puntos
- empate = 1 punto
- derrota = 0 puntos
- desempate por diferencia de puntos
- segundo desempate por puntos a favor

También arma el detalle de cada equipo:

- jugadores
- partidos jugados
- partidos pendientes
- posición y estadísticas

## 8. Seguridad y validaciones

### [src/middlewares/auth.middleware.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/middlewares/auth.middleware.js)

Protege rutas privadas.

Hace:

- lee el token Bearer
- valida el JWT
- rechaza requests sin token o con token inválido

### [src/middlewares/validateRequest.middleware.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/middlewares/validateRequest.middleware.js)

Procesa los errores de validación.

Se usa junto con `express-validator`.

### [src/middlewares/error.middleware.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/middlewares/error.middleware.js)

Maneja errores globales de la API.

Hace:

- respuesta para rutas inexistentes
- manejo de errores internos
- manejo de errores de validación
- manejo de errores por duplicados

## 9. Utilidades

### [src/utils/jwt.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/utils/jwt.js)

Genera el token JWT del administrador.

### [src/utils/ensureDefaultAdmin.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/utils/ensureDefaultAdmin.js)

Si no existe admin, lo crea automáticamente al iniciar o al correr seeds.

### [src/utils/seedDemoData.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/utils/seedDemoData.js)

Carga datos de demo:

- admin
- equipos
- jugadores
- partidos
- resultados

### [src/utils/seedAdmin.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/utils/seedAdmin.js)

Sirve para crear solo el administrador.

### [src/utils/serializeMatch.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/utils/serializeMatch.js)

Da formato prolijo a los partidos antes de devolverlos en la API.

### [src/utils/catchAsync.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/utils/catchAsync.js)

Evita repetir `try/catch` en todos los controladores async.

### [src/utils/httpError.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/utils/httpError.js)

Sirve para crear errores con código HTTP.

## 10. Qué archivo mirar según lo que quieras entender

Si querés entender...

- cómo arranca todo: [src/server.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/server.js)
- cómo se registran rutas: [src/app.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/app.js)
- cómo funciona el login: [src/controllers/auth.controller.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/controllers/auth.controller.js)
- cómo se protegen rutas: [src/middlewares/auth.middleware.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/middlewares/auth.middleware.js)
- cómo se gestionan equipos: [src/controllers/team.controller.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/controllers/team.controller.js)
- cómo se gestionan jugadores: [src/controllers/player.controller.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/controllers/player.controller.js)
- cómo se gestionan partidos: [src/controllers/match.controller.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/controllers/match.controller.js)
- cómo se calcula la clasificación: [src/services/standing.service.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/services/standing.service.js)
- cómo cargar datos demo: [src/utils/seedDemoData.js](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/src/utils/seedDemoData.js)

## 11. Relación con la consigna del PDF

La consigna pide:

- autenticación admin
- gestión de equipos
- gestión de jugadores
- gestión de partidos
- carga de resultados
- clasificación automática
- vista pública
- validaciones y seguridad

Eso en el backend está resuelto así:

- autenticación: `auth.routes.js` + `auth.controller.js` + `jwt.js`
- seguridad: `auth.middleware.js`
- equipos: `team.routes.js` + `team.controller.js` + `team.model.js`
- jugadores: `player.routes.js` + `player.controller.js` + `player.model.js`
- partidos: `match.routes.js` + `match.controller.js` + `match.model.js`
- clasificación: `standing.routes.js` + `standing.controller.js` + `standing.service.js`
- validaciones: `express-validator` en rutas + `validateRequest.middleware.js`

## 12. Documentos que ya tenés

- guía de inicio y uso: [GUIA_INICIO.md](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/GUIA_INICIO.md)
- guía de demo con Postman: [POSTMAN_DEMO.md](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/POSTMAN_DEMO.md)
- guía del backend: [GUIA_BACKEND.md](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/GUIA_BACKEND.md)
