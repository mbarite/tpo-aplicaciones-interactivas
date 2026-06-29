# Backend TP - Liga de Baloncesto Juvenil

API REST en Node.js + Express + MongoDB para gestionar equipos, jugadores, partidos, resultados y tabla de posiciones.

## Requisitos

- Node.js 20 o superior
- Una base MongoDB
  - Opcion 1: MongoDB Community local
  - Opcion 2: MongoDB Atlas con una cadena de conexion en `.env`

## Instalacion

```bash
npm install
```

Crear un archivo `.env` tomando como base `.env.example`.

## Variables de entorno

```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/liga-baloncesto
JWT_SECRET=un-secreto-seguro
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin1234
```

## Ejecucion

```bash
npm run dev
```

Al iniciar por primera vez, la API crea automaticamente el administrador definido en `.env`.

## Datos de demo

Para sembrar equipos, jugadores, partidos y resultados:

```bash
npm run seed:demo
```

Para volver a dejar la base en su estado inicial de demo:

```bash
npm run seed:reset-demo
```

## Demo con Postman

Hay una coleccion lista para importar en:

- `postman/Liga Baloncesto.postman_collection.json`

## Endpoints principales

### Publicos

- `GET /api/health`
- `GET /api/standings`
- `GET /api/teams`
- `GET /api/teams/:teamId`
- `GET /api/matches`
- `GET /api/matches/calendar`
- `GET /api/matches/results`

### Administracion

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/teams`
- `PUT /api/teams/:teamId`
- `DELETE /api/teams/:teamId`
- `POST /api/players`
- `PUT /api/players/:playerId`
- `DELETE /api/players/:playerId`
- `POST /api/matches`
- `PUT /api/matches/:matchId`
- `PATCH /api/matches/:matchId/result`
- `DELETE /api/matches/:matchId`

Todas las rutas de administracion, excepto `POST /api/auth/login`, requieren:

```http
Authorization: Bearer <token>
```

## Ejemplos de uso rapido

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin1234"
}
```

### Crear equipo

```http
POST /api/teams
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Panteras del Este",
  "coachName": "Julieta Romero"
}
```

### Crear partido

```http
POST /api/matches
Authorization: Bearer <token>
Content-Type: application/json

{
  "homeTeamId": "<id-equipo-local>",
  "awayTeamId": "<id-equipo-visitante>",
  "date": "2026-05-10",
  "time": "20:30",
  "venue": "Club Central"
}
```

### Cargar resultado

```http
PATCH /api/matches/<id-partido>/result
Authorization: Bearer <token>
Content-Type: application/json

{
  "homeScore": 81,
  "awayScore": 77
}
```

## Regla de clasificacion implementada

- Partido ganado: 3 puntos
- Partido empatado: 1 punto
- Partido perdido: 0 puntos
- Desempate por diferencia de puntos
- Segundo desempate por puntos a favor
