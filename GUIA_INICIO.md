# Guia Paso A Paso

Esta guia esta pensada para dejar el backend funcionando desde cero y despues usarlo para la demo con Postman.

## 1. Que tenes que abrir

Abrí solamente esto:

- VS Code
- Postman
- Navegador web

No abras SQL. Este proyecto usa MongoDB, no MySQL ni PostgreSQL.

## 2. Que hace cada cosa

- VS Code: para abrir el proyecto y correr el backend
- Postman: para hacer requests `GET`, `POST`, `PUT`, `PATCH` y `DELETE`
- Navegador: para crear o ver la base de datos en MongoDB Atlas

## 3. Opcion recomendada para la base de datos

La opcion recomendada ahora es usar **MongoDB local**, porque ya quedó instalado en tu máquina y no depende de internet.

Ventajas:

- funciona aunque falle internet
- no dependes de Atlas durante la demo
- ya quedó probado con este proyecto

MongoDB Atlas sigue siendo una alternativa, pero ahora queda como opcion secundaria.

## 4. Paso a paso para dejarlo funcionando por primera vez

### Paso 1. Abrir el proyecto en VS Code

1. Abrí VS Code
2. Elegí `File > Open Folder`
3. Abrí esta carpeta:

- [TPO](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO)

### Paso 2. Abrir una terminal en VS Code

1. En VS Code, andá a `Terminal > New Terminal`
2. La terminal debería abrir dentro de `TPO`

Si no abre ahí, escribí:

```bash
cd backend
```

Si todavía estás un nivel más arriba:

```bash
cd TPO\backend
```

### Paso 3. Verificar que MongoDB local está listo

MongoDB Server ya quedó instalado y funcionando como servicio de Windows.

La API va a usar esta conexión local:

```env
mongodb://127.0.0.1:27017/liga-baloncesto
```

### Paso 4. Verificar o crear el archivo `.env`

Dentro de [backend](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend), creá un archivo llamado `.env`.

Podés copiar el contenido de:

- [.env.example](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/.env.example)

Y dejarlo asi:

```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/liga-baloncesto
JWT_SECRET=un-secreto-largo-y-seguro
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin1234
```

Importante:

- con Mongo local no hace falta tocar `MONGO_URI`
- si querés usar Atlas más adelante, ahí sí reemplazás `MONGO_URI` por tu cadena real

### Paso 5. Instalar dependencias

En la terminal de VS Code, dentro de `backend`, corré:

```bash
npm install
```

### Paso 6. Cargar datos de demo

En esa misma terminal, corré:

```bash
npm run seed:demo
```

Eso crea:

- el administrador
- equipos
- jugadores
- partidos
- resultados iniciales

### Paso 7. Levantar el backend

Corré:

```bash
npm run dev
```

Si todo salió bien, deberías ver algo como:

```bash
Conexion a MongoDB establecida
Administrador inicial creado: admin
Servidor escuchando en http://localhost:4000
```

Si ya habías corrido el seed antes, puede no volver a mostrar que creó el admin, y eso está bien.

## 5. Paso a paso para probarlo en Postman

### Paso 1. Abrir Postman

Abrí Postman.

### Paso 2. Importar la colección

Importá este archivo:

- [Liga Baloncesto.postman_collection.json](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/postman/Liga Baloncesto.postman_collection.json)

### Paso 3. Probar los endpoints públicos

Probá en este orden:

1. `Healthcheck`
2. `Ver Clasificacion`
3. `Ver Equipos`
4. `Detalle De Equipo`
5. `Calendario De Partidos`
6. `Resultados`

Esto demuestra la parte publica pedida en la consigna:

- clasificación general
- detalle de equipos
- calendario
- resultados

### Paso 4. Probar el login de administrador

Ejecutá:

1. `Login Admin`
2. `Perfil Admin`

La colección guarda el token automáticamente.

### Paso 5. Probar acciones de administrador

Ejecutá:

1. `Crear Equipo`
2. `Actualizar Equipo`
3. `Crear Jugador`
4. `Crear Partido`
5. `Cargar Resultado`

Y después:

6. `Ver Clasificacion`

Esto demuestra:

- autenticación
- rutas protegidas
- alta y edición
- carga de resultados
- recálculo automático de la tabla

## 6. Cómo defenderlo para que cumpla con el PDF

La consigna pide estas cosas del backend:

- login de administrador
- gestión de equipos
- gestión de jugadores
- gestión de partidos
- carga de resultados
- clasificación automática
- vista pública de tabla, equipos, calendario y resultados
- validaciones en backend
- contraseñas cifradas
- rutas privadas protegidas

Este backend ya está armado para eso.

Cuando expliques la demo, decilo así:

1. `GET` públicos para consultar información
2. `POST /auth/login` para autenticación
3. rutas protegidas con token Bearer
4. alta y modificación de entidades
5. carga de resultado y actualización automática de la tabla

## 7. Qué abrir cada vez que quieras usarlo

Cada vez que quieras trabajar o practicar:

1. Abrí VS Code
2. Abrí la carpeta `TPO`
3. Abrí una terminal
4. Entrá a `backend`
5. Corré:

```bash
npm run dev
```

6. Abrí Postman
7. Ejecutá los requests que necesites

## 8. Qué no tenés que hacer

- no abras SQL
- no borres `node_modules` si todo ya funciona
- no subas `.env` a GitHub
- no trabajes directamente desde `main` cuando armen el repo con tu compañero

## 9. Si algo falla

### Error de conexión a MongoDB local

Revisá:

- que MongoDB esté corriendo como servicio
- que `MONGO_URI` siga siendo `mongodb://127.0.0.1:27017/liga-baloncesto`
- que no haya otro proceso ocupando o bloqueando la base

### Si querés usar Atlas en vez de local

Podés hacerlo, pero ya no es obligatorio.

En ese caso:

1. Creás el cluster en Atlas
2. Copiás la cadena de conexión
3. Reemplazás `MONGO_URI` en `.env`

### Error 401 o token inválido

Hacé `Login Admin` otra vez y repetí el request protegido.

### Puerto ocupado

Cambiá el `PORT` en `.env`, por ejemplo:

```env
PORT=4001
```

Y actualizá `baseUrl` en Postman.

## 10. Archivos importantes del proyecto

- [backend/README.md](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/README.md)
- [POSTMAN_DEMO.md](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/POSTMAN_DEMO.md)
- [postman/Liga Baloncesto.postman_collection.json](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/postman/Liga Baloncesto.postman_collection.json)
- [backend/.env.example](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/backend/.env.example)
