# Guia para publicar la app en internet

La entrega online usa tres piezas:

| Pieza | Que es | Servicio usado |
|-------|--------|----------------|
| Base de datos | Guarda equipos, jugadores, partidos y resultados | MongoDB Atlas |
| Backend (API) | Servidor Node/Express que expone `/api` | Render Web Service |
| Frontend (sitio) | Aplicacion React/Vite que ve el usuario | Render Static Site |

URLs de produccion actuales:

| Servicio | URL |
|----------|-----|
| Frontend | `https://tpo-aplicaciones-interactivas-1-ctwa.onrender.com` |
| Backend | `https://tpo-aplicaciones-interactivas-w5d4.onrender.com` |
| Healthcheck API | `https://tpo-aplicaciones-interactivas-w5d4.onrender.com/api/health` |

Credenciales de demo:

| Usuario | Contrasena |
|---------|------------|
| `admin` | `Admin1234` |

> Nota: Render Free puede dormir los servicios por inactividad. Para una demo, abrir el frontend y el healthcheck de la API unos minutos antes.

---

## Paso 1 - Base de datos (MongoDB Atlas)

1. Crear un cluster gratuito en MongoDB Atlas.
2. Crear un usuario de base de datos.
3. En Network Access, permitir acceso desde Render. Para esta demo se uso `0.0.0.0/0`.
4. Copiar la cadena de conexion desde Connect -> Drivers.
5. Usar una base llamada `liga-baloncesto`.

Ejemplo de forma de `MONGO_URI`:

```env
MONGO_URI=mongodb+srv://USUARIO:CONTRASENA@cluster.mongodb.net/liga-baloncesto?appName=tpo-liga&authSource=admin
```

No subir el `MONGO_URI` real al repositorio.

---

## Paso 2 - Backend en Render (Web Service)

Crear un servicio de tipo **Web Service** conectado al repo de GitHub.

Configuracion:

```text
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

Variables de entorno:

| Key | Value |
|-----|-------|
| `MONGO_URI` | URI de Atlas |
| `JWT_SECRET` | texto secreto largo |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | `Admin1234` |
| `DNS_SERVERS` | `8.8.8.8,1.1.1.1` |

Verificacion:

```text
https://tpo-aplicaciones-interactivas-w5d4.onrender.com/api/health
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "API de liga de baloncesto operativa"
}
```

---

## Paso 3 - Frontend en Render (Static Site)

Crear un servicio de tipo **Static Site** conectado al mismo repo.

Configuracion:

```text
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

Variable de entorno:

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://tpo-aplicaciones-interactivas-w5d4.onrender.com/api` |

Verificacion:

```text
https://tpo-aplicaciones-interactivas-1-ctwa.onrender.com
```

Si se usan rutas internas de React Router, el Static Site debe servir `index.html` para las rutas del frontend.

---

## Paso 4 - Cargar datos de demo en Atlas

Desde la PC local, con `backend/.env` apuntando al `MONGO_URI` de Atlas:

```bash
cd backend
npm install
npm run seed:reset-demo
```

El seed deja cargada una demo con:

- 12 equipos
- 378 jugadores
- 3 temporadas
- 3 categorias
- 108 partidos jugados
- 90 partidos programados

`seed:reset-demo` borra y recarga la base demo. Usarlo con cuidado.

---

## Checklist rapido antes de presentar

1. Abrir el frontend publico.
2. Abrir el healthcheck del backend.
3. Entrar a Admin con `admin / Admin1234`.
4. Mostrar clasificacion, partidos, equipos y detalle de equipo.
5. Desde Admin, crear o editar un dato pequeno y verificar que impacta en la vista publica.
6. Si se hicieron pruebas que ensucian la base, volver a correr `npm run seed:reset-demo`.
