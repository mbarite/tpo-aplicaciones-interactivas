# Guía para publicar la app en internet (gratis)

La app tiene 3 piezas. Cada una se publica en un servicio gratuito:

| Pieza | Qué es | Servicio |
|-------|--------|----------|
| Base de datos | Donde se guardan equipos, partidos, etc. | **MongoDB Atlas** |
| Backend (API) | El servidor que maneja los datos | **Render** |
| Frontend (sitio) | La página que se ve | **Vercel** |

> Hacelo en este orden: 1) Atlas → 2) Render → 3) Vercel. Cada paso te da un dato
> que necesitás para el siguiente.

---

## Paso 1 — Base de datos (MongoDB Atlas)

1. Entrá a **https://www.mongodb.com/cloud/atlas/register** y creá una cuenta gratis.
2. Creá un clúster **gratuito** (opción **M0 / Free**).
3. En **Database Access**: creá un usuario y contraseña (anotalos).
4. En **Network Access**: agregá la IP `0.0.0.0/0` (permite el acceso desde cualquier lado).
5. En **Database → Connect → Drivers**: copiá la **cadena de conexión**. Se ve así:
   ```
   mongodb+srv://USUARIO:CONTRASEÑA@cluster0.xxxxx.mongodb.net/liga-baloncesto
   ```
   Reemplazá `USUARIO` y `CONTRASEÑA` por los del paso 3. **Guardá ese texto**, es tu `MONGO_URI`.

---

## Paso 2 — Backend (Render)

1. Entrá a **https://render.com** y registrate con tu cuenta de **GitHub**.
2. **New → Web Service** y elegí el repo `tpo-aplicaciones-interactivas`.
3. Completá:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
4. En **Environment** agregá estas variables:

   | Key | Value |
   |-----|-------|
   | `MONGO_URI` | (la cadena del Paso 1) |
   | `JWT_SECRET` | cualquier-texto-secreto-largo |
   | `ADMIN_USERNAME` | `admin` |
   | `ADMIN_PASSWORD` | (la contraseña de admin que quieras) |

5. **Create Web Service**. Cuando termine, Render te da una URL tipo:
   `https://liga-baloncesto-api.onrender.com` → **guardala**.
6. Probá que anda: abrí esa URL + `/api/health` en el navegador. Debe decir
   `"API de liga de baloncesto operativa"`.

> Nota: el plan gratis de Render "se duerme" si nadie lo usa por un rato. La primera
> carga después de dormir tarda ~40 segundos. Abrí el link 1 minuto antes de mostrarlo.

---

## Paso 3 — Frontend (Vercel)

1. Entrá a **https://vercel.com** y registrate con **GitHub**.
2. **Add New → Project** y elegí el repo `tpo-aplicaciones-interactivas`.
3. Completá:
   - **Root Directory:** `frontend`
   - (Framework: Vite, lo detecta solo)
4. En **Environment Variables** agregá:

   | Key | Value |
   |-----|-------|
   | `VITE_API_BASE_URL` | `https://TU-BACKEND.onrender.com/api` |

   (usá la URL del Paso 2 y agregale `/api` al final)
5. **Deploy**. Al terminar te da la URL pública, tipo `https://tu-liga.vercel.app`.
   **¡Esa es la dirección que abrís desde cualquier PC o celular!**

---

## Después de publicar

- Entrá a tu sitio de Vercel, tocá **Admin** e ingresá con el usuario/contraseña que
  pusiste en Render. Cargá un par de equipos y partidos para que se vea con datos.
- Si cambiás una variable de entorno, volvé a hacer **Deploy / Redeploy** para que tome
  el cambio.

## Credenciales para la entrega

- Usuario y contraseña de admin: los que definiste en las variables de Render
  (`ADMIN_USERNAME` / `ADMIN_PASSWORD`).
