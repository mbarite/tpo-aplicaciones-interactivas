# Pruebas del Backend

## Pruebas automaticas

Ejecutar:

```bash
npm test
```

La suite cubre estos casos:

- rutas privadas sin token
- creacion de partidos con el mismo equipo en ambos lados
- creacion de partidos con equipos inexistentes
- actualizacion de partidos que deja local y visitante iguales
- validacion de resultados con puntajes invalidos
- alta y actualizacion de jugadores con equipos inexistentes
- borrado de jugadores inexistentes
- alta y actualizacion de equipos con datos invalidos o ids inexistentes
- bloqueo al borrar equipos con jugadores o partidos asociados
- calculo de tabla con victorias, empates y derrotas
- desempate por diferencia de puntos
- desempate por puntos a favor

## Pruebas manuales recomendadas

Estas pruebas conviene hacerlas tambien en Postman para ver el flujo completo:

1. Login correcto e incorrecto.
2. Ruta privada sin token.
3. Crear equipo con nombre vacio.
4. Crear jugador con un `teamId` inexistente.
5. Crear partido con el mismo `homeTeamId` y `awayTeamId`.
6. Cargar resultado con puntajes negativos.
7. Borrar un equipo que tenga jugadores o partidos asociados.
8. Cargar un resultado y volver a consultar `GET /api/standings`.
9. Editar un partido ya creado y verificar que el calendario o resultados sigan coherentes.
10. Borrar un partido y volver a consultar la tabla para confirmar el cambio esperado.

## Que deberia responder la API

- Si falta autenticacion: `401`
- Si hay datos mal formados: `400`
- Si el recurso no existe: `404`
- Si la accion rompe una regla de negocio: `400` con un mensaje explicando el bloqueo

## Orden sugerido para test manual rapido

1. `GET /api/health`
2. `POST /api/auth/login`
3. `POST /api/teams`
4. `POST /api/players`
5. `POST /api/matches`
6. `PATCH /api/matches/:matchId/result`
7. `GET /api/standings`
8. Probar un caso invalido de cada entidad
