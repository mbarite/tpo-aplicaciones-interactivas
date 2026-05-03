# Demo con Postman

La profesora puede evaluar el backend completamente desde Postman. Esta secuencia cubre autenticacion, consultas publicas, ABM y logica de negocio.

## Importar

Importar la coleccion:

- [postman/Liga Baloncesto.postman_collection.json](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO/postman/Liga Baloncesto.postman_collection.json)

## Antes de la demo

1. Tener MongoDB funcionando.
2. Configurar el archivo `.env` en `backend`.
3. Correr:

```bash
cd backend
npm run seed:demo
npm run dev
```

## Orden recomendado de requests

1. `Healthcheck`
2. `Ver Clasificacion`
3. `Ver Equipos`
4. `Detalle De Equipo`
5. `Calendario De Partidos`
6. `Resultados`
7. `Login Admin`
8. `Perfil Admin`
9. `Crear Equipo`
10. `Actualizar Equipo`
11. `Crear Jugador`
12. `Crear Partido`
13. `Cargar Resultado`
14. `Ver Clasificacion` otra vez para mostrar que se recalcula automaticamente

## Que demuestra cada paso

- Publico: cualquiera puede consultar tabla, equipos, calendario y resultados.
- Privado: solo el admin logueado puede modificar datos.
- Validaciones: la API exige token y payload correcto.
- Reglas del negocio: al cargar un resultado se actualiza la tabla con:
  - victoria = 3 puntos
  - empate = 1 punto
  - derrota = 0 puntos
  - desempate por diferencia de puntos y luego puntos a favor

## Credenciales por defecto

- usuario: `admin`
- contrasena: `admin1234`

Conviene cambiarlas en `.env` antes de entregar.
