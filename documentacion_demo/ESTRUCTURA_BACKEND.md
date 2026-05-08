# Estructura Del Backend

Este documento sirve para responder rapido si te preguntan para que sirve cada carpeta o archivo del proyecto.

## Idea general

Podes decir:

> "El proyecto esta separado por responsabilidades para que no quede toda la logica mezclada en un solo archivo."

> "La estructura principal esta dividida en rutas, controladores, modelos, middlewares, servicios, utilidades, configuracion y tests."

## Carpeta `backend`

Es la carpeta principal del backend.

Adentro estan:

- el codigo de la API
- la configuracion
- las pruebas
- las dependencias del proyecto

## Carpeta `backend/src`

Es donde esta el codigo fuente principal.

## `backend/src/controllers`

Sirve para manejar lo que hace cada endpoint.

Podes decir:

> "Los controladores reciben la request, ejecutan la logica correspondiente y devuelven la response."

Ejemplos:

- `auth.controller.js`
  Maneja el login del administrador y el perfil autenticado.

- `team.controller.js`
  Maneja listar, crear, actualizar y borrar equipos.

- `player.controller.js`
  Maneja listar, crear, actualizar y borrar jugadores.

- `match.controller.js`
  Maneja listar, crear, actualizar, borrar partidos y cargar resultados.

- `standing.controller.js`
  Maneja la respuesta de la clasificacion.

## `backend/src/middlewares`

Son funciones que se ejecutan antes del controlador.

Podes decir:

> "Los middlewares sirven para cortar el flujo cuando falta autenticacion, cuando los datos vienen mal o cuando hay que manejar errores."

Archivos importantes:

- `auth.middleware.js`
  Verifica el token JWT en las rutas privadas.

- `validateRequest.middleware.js`
  Revisa si hubo errores de validacion en los datos enviados.

- `error.middleware.js`
  Centraliza las respuestas de error.

## `backend/src/models`

Aca esta definida la estructura de datos que usa MongoDB a traves de Mongoose.

Podes decir:

> "Como usamos MongoDB, en vez de tablas SQL tenemos modelos y colecciones."

Modelos:

- `admin.model.js`
  Define el administrador con `username` y `passwordHash`.

- `team.model.js`
  Define los equipos con `name` y `coachName`.

- `player.model.js`
  Define los jugadores con nombre, apellido, categoria y referencia al equipo.

- `match.model.js`
  Define los partidos con equipo local, visitante, fecha, hora, sede, estado y puntajes.

## `backend/src/routes`

Aca se definen las rutas de la API.

Podes decir:

> "Las rutas conectan una URL con un controlador y, si hace falta, con validaciones o autenticacion."

Archivos:

- `auth.routes.js`
  Rutas de login y perfil admin.

- `team.routes.js`
  Rutas de equipos.

- `player.routes.js`
  Rutas de jugadores.

- `match.routes.js`
  Rutas de partidos, calendario, resultados y carga de marcador.

- `standing.routes.js`
  Ruta de clasificacion.

## `backend/src/services`

Aca va la logica de negocio que conviene separar de los controladores.

Podes decir:

> "Los servicios guardan logica mas puntual para no sobrecargar los controladores."

Archivo principal:

- `standing.service.js`
  Calcula la clasificacion de la liga a partir de los partidos jugados.

## `backend/src/utils`

Aca estan las funciones auxiliares reutilizables.

Podes decir:

> "Las utilidades sirven para no repetir codigo comun en distintas partes del proyecto."

Ejemplos de uso:

- generar o verificar JWT
- serializar respuestas
- crear errores HTTP
- asegurar que exista el admin inicial

## `backend/src/app.js`

Configura la aplicacion Express.

Podes decir:

> "En `app.js` se configuran los middlewares globales, el parseo de JSON, CORS, logs y el montaje de las rutas."

## `backend/src/server.js`

Es el punto de arranque del backend.

Podes decir:

> "En `server.js` se conecta MongoDB y se levanta el servidor."

## Carpeta `backend/test`

Aca estan las pruebas automaticas.

Podes decir:

> "La carpeta `test` contiene pruebas para validar autenticacion, reglas de negocio, validaciones y clasificacion."

Archivo principal:

- `app.test.js`
  Ejecuta los casos de prueba del backend.

## `backend/.env`

Tiene las variables de entorno reales del proyecto.

Ejemplos:

- puerto
- conexion a MongoDB
- secret del JWT
- usuario admin
- password admin

Podes decir:

> "El archivo `.env` guarda configuraciones sensibles o variables que no conviene dejar hardcodeadas en el codigo."

## `backend/.env.example`

Es un ejemplo de como deberia verse el `.env`.

Sirve para orientar la configuracion en otra maquina.

## `backend/demo.http`

Es un archivo para probar requests rapido desde VS Code.

Podes decir:

> "Es una alternativa simple para disparar requests sin Postman, aunque para la demo principal usamos Postman."

## `backend/package.json`

Define el proyecto Node.js.

Aca estan:

- nombre del proyecto
- dependencias
- scripts

Ejemplos de scripts:

- `npm run dev`
- `npm test`
- scripts de seed

## `backend/package-lock.json`

Guarda las versiones exactas de las dependencias instaladas.

## `backend/README.md`

Es la documentacion general del backend.

## `backend/TESTING.md`

Es la guia de pruebas.

Podes decir:

> "Aca tengo documentadas las pruebas automaticas y los casos manuales importantes."

## `backend/.gitignore`

Indica que archivos o carpetas no se deben subir al repositorio.

Ejemplos:

- `node_modules`
- `.env`

## `backend/node_modules`

Es la carpeta donde npm instala las dependencias.

Podes decir:

> "No es codigo nuestro, sino las librerias instaladas que usa el proyecto."

## Resumen corto para responder rapido

Si te preguntan muy de golpe, podes decir:

> "La estructura esta separada por capas: rutas para definir endpoints, controladores para manejar requests, modelos para definir los datos, middlewares para autenticacion y validacion, servicios para logica de negocio, utils para funciones auxiliares, server para levantar la app y test para pruebas automaticas."
