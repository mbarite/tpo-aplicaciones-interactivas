# Liga Metropolitana de Baloncesto Juvenil

Aplicacion web full-stack para la gestion integral de una liga de baloncesto juvenil:
equipos, jugadores, partidos, resultados y clasificacion automatica, con una vista
publica y un area administrativa protegida.

Trabajo Practico Obligatorio - **Aplicaciones Interactivas**.

## Arquitectura

```
┌──────────────────────────┐        HTTP / REST          ┌──────────────────────────┐
│        FRONTEND          │  ───────────────────────▶   │         BACKEND          │
│  React + Vite (SPA)      │   JSON + JWT (Bearer)       │  Node.js + Express       │
│  /frontend  · :3000      │  ◀───────────────────────   │  /backend   · :4000      │
└──────────────────────────┘                             └────────────┬─────────────┘
                                                                       │ Mongoose
                                                                       ▼
                                                              ┌──────────────────┐
                                                              │     MongoDB      │
                                                              └──────────────────┘
```

- **Frontend** (`/frontend`): React 19 + Vite. Vista publica (clasificacion, calendario,
  resultados, equipos) y panel admin (ABM de equipos, jugadores y partidos). Ver
  [frontend/README.md](frontend/README.md).
- **Backend** (`/backend`): API REST en Express + MongoDB (Mongoose), en capas
  `routes → controllers → services → models`, con JWT y validaciones. Ver
  [backend/README.md](backend/README.md).

## Stack

| Capa      | Tecnologias                                             |
|-----------|---------------------------------------------------------|
| Frontend  | React 19, Vite 6, react-router-dom 7, axios, CSS        |
| Backend   | Node.js 20, Express 4, Mongoose 8, JWT, bcrypt, express-validator |
| Base      | MongoDB (local o Atlas)                                 |

## Puesta en marcha

Se necesitan **dos terminales** (una para el backend y otra para el frontend) y una
instancia de MongoDB accesible.

### 1. Backend

```bash
cd backend
npm install
# crear .env a partir de .env.example  (PORT, MONGO_URI, JWT_SECRET, ADMIN_*)
npm run dev          # API en http://localhost:4000
npm run seed:demo    # (opcional) carga equipos, jugadores y partidos de ejemplo
```

### 2. Frontend

```bash
cd frontend
npm install
# crear .env con VITE_API_BASE_URL=http://localhost:4000/api
npm run dev          # sitio en http://localhost:3000
```

## Credenciales de prueba (administrador)

| Usuario | Contrasena  |
|---------|-------------|
| `admin` | `admin1234` |

> El administrador inicial se crea automaticamente al iniciar el backend, tomando los
> valores `ADMIN_USERNAME` / `ADMIN_PASSWORD` del `.env`.

## Funcionalidades

**Vista publica** (sin login)
- Landing con nombre de la liga, temporada y descripcion.
- Tabla de **clasificacion** (3/1/0 puntos; desempate por diferencia y tantos a favor).
- **Calendario** de partidos programados y **resultados** de los jugados.
- Listado de **equipos** y detalle de cada uno (plantel, estadisticas y partidos).

**Area administrativa** (login + rutas protegidas)
- ABM de **equipos** (nombre, entrenador).
- ABM de **jugadores** (nombre, apellido, categoria, equipo).
- ABM de **partidos** (local, visitante, fecha, hora, sede) y **carga de resultados**.

## Seguridad

- Autenticacion JWT (`Authorization: Bearer <token>`) para el area administrativa.
- Contrasena del administrador cifrada con bcrypt.
- Validacion de formularios en frontend **y** backend (`express-validator`).
- Rutas privadas protegidas tanto en el cliente (`ProtectedRoute`) como en el servidor
  (middleware de autorizacion).
