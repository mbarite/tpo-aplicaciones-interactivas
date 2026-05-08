# Demo Backend

## Guion para leer mientras hago la demo

### 1. Presentacion

> "En esta primera entrega desarrollamos el backend de una aplicacion para gestionar una liga de baloncesto juvenil."

> "Las tecnologias que utilizamos fueron JavaScript, Node.js y Express para construir la API REST, MongoDB como base de datos NoSQL y Mongoose para modelar las entidades."

> "Ademas usamos JWT para autenticacion, bcrypt para guardar la contrasena de forma segura y express-validator para las validaciones."

> "Para hacer las pruebas usamos Postman, porque en esta etapa todavia no hay frontend."

> "Tambien tenemos data cargada de prueba para poder mostrar el funcionamiento sin tener que crear todo desde cero."

## 2. Preparacion antes de hablar

En VS Code, en la terminal:

```bash
cd backend
npm run dev
```

Si queres usar la data demo:

```bash
npm run seed:reset-demo
npm run dev
```

Tiene que aparecer:

```text
Servidor escuchando en http://localhost:4000
```

## 3. Como hago la demo

La demo la hago desde:

1. `VS Code`
   Ahi dejo corriendo el backend.

2. `Postman`
   Ahi muestro el funcionamiento real de la API.

3. `MongoDB Compass` opcional
   Solo si me piden mostrar la base de datos.

## 4. Arranque de la demo

> "Voy a mostrar primero la parte publica del sistema y despues la parte administrativa."

### 4.1 Ver clasificacion

En Postman abrir:

- `Publicos > Ver Clasificacion`

Decir:

> "Aca estoy mostrando la clasificacion general de la liga."

> "La clasificacion ya existe en el backend. Hoy se muestra como JSON en Postman porque todavia no hay frontend, pero esta es la clasificacion real del sistema."

> "La tabla se calcula automaticamente a partir de los partidos jugados."

> "La regla es 3 puntos por victoria, 1 por empate y 0 por derrota. Si hay empate en puntos, primero desempata por diferencia de puntos y despues por puntos a favor."

Lo que se ve aca:

- posicion
- equipo
- entrenador
- puntos
- partidos jugados
- ganados
- empatados
- perdidos
- puntos a favor
- puntos en contra
- diferencia de puntos

### 4.2 Ver equipos

En Postman abrir:

- `Publicos > Ver Equipos`

Decir:

> "Aca se listan los equipos cargados en el sistema."

> "Se puede ver el nombre del equipo, el entrenador y la cantidad de jugadores asociados."

### 4.3 Ver detalle de un equipo

En Postman abrir:

- `Publicos > Detalle De Equipo`

Decir:

> "En el detalle de equipo puedo ver informacion mas completa."

> "Aca se ve el entrenador, los jugadores de ese equipo, su posicion actual y tambien sus partidos pendientes o jugados."

> "Con esto ya puedo mostrar equipos, jugadores y entrenadores."

## 5. Login admin

En Postman abrir:

- `Admin > Login Admin`

Usar:

```json
{
  "username": "admin",
  "password": "admin1234"
}
```

Decir:

> "Ahora voy a ingresar como administrador."

> "Para entrar hay que loguearse con usuario y contrasena."

> "La contrasena no se guarda en texto plano, sino como passwordHash."

> "Cuando hago login, el sistema compara la contrasena ingresada contra el hash usando bcrypt."

> "Si coincide, devuelve un token JWT que se usa para acceder a las rutas privadas."

### 5.1 Ver perfil admin

En Postman abrir:

- `Admin > Perfil Admin`

Decir:

> "Con esta request muestro que el token ya esta funcionando y que el administrador quedo autenticado."

## 6. Que puedo hacer una vez logueado

> "Una vez logueado, puedo agregar, modificar y borrar informacion del sistema."

> "Lo voy a mostrar con equipos, jugadores y partidos."

## 7. Equipos

### 7.1 Crear equipo

En Postman abrir:

- `Admin > Crear Equipo`

Body ejemplo:

```json
{
  "name": "Lobos del Oeste",
  "coachName": "Julian Molina"
}
```

Decir:

> "Aca agrego un equipo nuevo indicando nombre y entrenador."

### 7.2 Modificar equipo

En Postman abrir:

- `Admin > Actualizar Equipo`

Body ejemplo:

```json
{
  "coachName": "Julian Molina Diaz"
}
```

Decir:

> "Aca modifico un equipo ya existente."

> "En este caso estoy actualizando el nombre del entrenador."

### 7.3 Borrar equipo

En Postman abrir:

- `Admin > Eliminar Equipo`

Decir:

> "Tambien puedo borrar un equipo."

> "Pero si el equipo tiene jugadores o partidos asociados, el sistema no lo deja borrar para mantener la consistencia."

## 8. Jugadores

### 8.1 Crear jugador

En Postman abrir:

- `Admin > Crear Jugador`

Body ejemplo:

```json
{
  "firstName": "Nicolas",
  "lastName": "Dominguez",
  "category": "U17",
  "teamId": "PEGAR_ID_DEL_EQUIPO"
}
```

Decir:

> "Aca agrego un jugador y lo asocio a un equipo."

> "Cada jugador pertenece a un equipo."

### 8.2 Sobre modificar jugador

Decir:

> "La API tambien soporta modificacion de jugadores, aunque en esta coleccion de Postman hoy tengo preparado principalmente el alta y la baja."

### 8.3 Borrar jugador

En Postman abrir:

- `Admin > Eliminar Jugador`

Decir:

> "Aca puedo eliminar un jugador si hace falta."

## 9. Partidos

### 9.1 Crear partido

En Postman abrir:

- `Admin > Crear Partido`

Body ejemplo:

```json
{
  "homeTeamId": "ID_EQUIPO_1",
  "awayTeamId": "ID_EQUIPO_2",
  "date": "2026-05-10",
  "time": "20:30",
  "venue": "Club Central"
}
```

Decir:

> "Aca programo un partido entre un equipo local y uno visitante, con fecha, hora y sede."

### 9.2 Ver partidos pendientes

En Postman abrir:

- `Publicos > Calendario De Partidos`

Decir:

> "Aca se muestran los partidos programados que todavia no fueron jugados."

### 9.3 Cargar resultado

En Postman abrir:

- `Admin > Cargar Resultado`

Body ejemplo:

```json
{
  "homeScore": 81,
  "awayScore": 77
}
```

Decir:

> "Aca cargo el resultado del partido."

> "Cuando se carga el resultado, el partido pasa a estado jugado."

### 9.4 Ver historial de partidos jugados

En Postman abrir:

- `Publicos > Resultados`

Decir:

> "Aca se ve el historial de partidos ya jugados con sus resultados."

### 9.5 Borrar partido

En Postman abrir:

- `Admin > Eliminar Partido`

Decir:

> "Tambien puedo borrar un partido si hace falta."

## 10. Mostrar que la clasificacion se actualiza sola

En Postman abrir:

- `Publicos > Ver Clasificacion`

Decir:

> "Despues de cargar un resultado, vuelvo a la clasificacion para mostrar que el sistema la recalcula automaticamente."

## 11. Base de datos

Si me preguntan por la base de datos, la respuesta correcta es:

> "Si, tenemos base de datos."

> "Usamos MongoDB, asi que no hablamos de tablas SQL sino de colecciones."

> "La base actual se llama liga-baloncesto."

Las colecciones principales son:

- `admins`
- `teams`
- `players`
- `matches`

## 12. Como mostrar la base de datos

Si me lo pide la profe, uso `MongoDB Compass`.

Pasos:

1. Abrir MongoDB Compass
2. Conectarse a:

```text
mongodb://127.0.0.1:27017
```

3. Abrir la base:

```text
liga-baloncesto
```

4. Mostrar estas colecciones:

- `admins`
  Aca se ve `username` y `passwordHash`

- `teams`
  Aca se ve `name` y `coachName`

- `players`
  Aca se ve `firstName`, `lastName`, `category` y la referencia al equipo

- `matches`
  Aca se ve `homeTeam`, `awayTeam`, `date`, `time`, `venue`, `status`, `homeScore` y `awayScore`

Decir:

> "Como usamos MongoDB, no tenemos tablas como en SQL, sino colecciones."

> "Aca se ve la persistencia real de los datos."

> "En admins se puede ver que la contrasena no esta guardada en texto plano, sino como hash."

## 13. Validaciones o camino triste

Si quiero mostrar errores controlados, puedo probar:

1. login con contrasena incorrecta
2. ruta privada sin token
3. crear equipo con campos vacios
4. crear partido con el mismo equipo local y visitante
5. cargar resultado con puntaje invalido
6. borrar equipo con jugadores o partidos asociados

Decir:

> "En el camino feliz la API valida, guarda y responde correctamente."

> "En el camino triste la API no rompe ni guarda datos invalidos, sino que responde con errores controlados."

## 14. Preguntas tipicas

### Como juega la liga

> "Hoy el sistema esta pensado para una sola liga. Se cargan equipos, se les asocian jugadores, se programan partidos, se cargan resultados y con eso se calcula la clasificacion."

### Si quiero crear la liga 2

> "Hoy no esta modelado multi-liga. Si quisiera manejar varias ligas o temporadas, agregaria una entidad Liga o Temporada."

> "No duplicaria equipos. Lo correcto es que el equipo exista una sola vez y se asocie a la liga o temporada que corresponda."

### Si quiero que funcione varios anos seguidos

> "Agregaria una entidad Temporada. Los equipos seguirian existiendo una sola vez y los partidos y la clasificacion se filtrarian por temporada."

### Si me preguntan por la tabla de clasificacion

> "Si, la clasificacion ya existe en el backend. Hoy se muestra como JSON porque todavia no hay frontend."

## 15. Archivo de apoyo para pruebas

- [DEMO.md](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er%20Cuatrimestre%202026/Aplicaciones%20interactivas/TPO/documentacion_demo/DEMO.md)
- [TESTING.md](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er%20Cuatrimestre%202026/Aplicaciones%20interactivas/TPO/backend/TESTING.md)
