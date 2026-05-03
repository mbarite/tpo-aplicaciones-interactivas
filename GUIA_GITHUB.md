# Guia Git Y GitHub

Esta guía explica qué hace falta para trabajar el TPO con tu compañero en un repo compartido, cada uno con su propia **branch**.

## 1. Estado actual

Hoy el proyecto está así:

- el backend funciona localmente
- Git está instalado
- GitHub CLI (`gh`) está instalado
- todavía **no** hay un repo Git inicializado en `TPO`
- todavía **no** está configurado tu usuario de Git
- todavía **no** estás logueado en GitHub CLI

## 2. Qué falta para dejarlo listo

Faltan estas 3 cosas:

1. configurar nombre y mail de Git
2. loguearte en GitHub
3. crear o conectar un repo remoto

## 3. Antes de empezar

Abrí:

- VS Code
- la carpeta [TPO](/C:/Users/matyb/OneDrive/Documents/Mati/Facultad/Materias/2026/1er Cuatrimestre 2026/Aplicaciones interactivas/TPO)

Después abrí una terminal nueva.

Importante:

- como `gh` se instaló recién, conviene **cerrar y volver a abrir VS Code**
- eso hace que la terminal nueva reconozca el comando `gh`

## 4. Configurar Git

En la terminal de VS Code, corré:

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-mail@example.com"
```

Después podés verificar:

```bash
git config --global user.name
git config --global user.email
```

## 5. Loguearte en GitHub

En la terminal:

```bash
gh auth login
```

Elegí:

1. `GitHub.com`
2. `HTTPS`
3. `Login with a web browser`

Después seguí los pasos que te muestre GitHub.

Para verificar:

```bash
gh auth status
```

## 6. Inicializar el repo local

Parado en la carpeta `TPO`, corré:

```bash
git init -b main
git add .
git commit -m "chore: initial project setup"
```

## 7. Crear el repo remoto

Tenés dos opciones.

### Opción A. Crear el repo desde GitHub web

1. Entrá a GitHub
2. Creá un repo nuevo
3. Elegí un nombre, por ejemplo `tpo-liga-baloncesto`
4. No agregues README ni `.gitignore` si ya vas a subir este proyecto

Después conectás el remoto:

```bash
git remote add origin https://github.com/TU-USUARIO/tpo-liga-baloncesto.git
git push -u origin main
```

### Opción B. Crear el repo desde terminal con `gh`

```bash
gh repo create tpo-liga-baloncesto --private --source . --remote origin --push
```

Si lo quieren público, cambiás `--private` por `--public`.

## 8. Invitar a tu compañero

Desde GitHub:

1. Entrá al repo
2. Andá a `Settings`
3. `Collaborators`
4. invitá a tu compañero

Cuando acepte, ya pueden trabajar los dos.

## 9. Flujo recomendado con branches

La idea es:

- `main` = rama estable
- cada persona trabaja en su propia branch

Ejemplo:

- vos: `mati/backend-auth`
- tu compañero: `juan/backend-partidos`

## 10. Cómo crear tu branch

Desde `main` actualizado:

```bash
git checkout main
git pull origin main
git checkout -b mati/backend-auth
git push -u origin mati/backend-auth
```

## 11. Cómo trabajar y subir cambios

Cuando hagas cambios:

```bash
git status
git add .
git commit -m "feat: add admin authentication improvements"
git push
```

## 12. Cómo traer cambios de `main` a tu branch

Antes de seguir trabajando, conviene actualizar:

```bash
git checkout main
git pull origin main
git checkout mati/backend-auth
git merge main
```

Si prefieren, también pueden usar `rebase`, pero `merge` es más simple para empezar.

## 13. Cómo hacer un Pull Request

Podés hacerlo desde GitHub web o desde terminal:

```bash
gh pr create --base main --head mati/backend-auth --fill
```

Después revisan el PR y lo mergean.

## 14. Cómo mergear una branch

### Desde GitHub web

Es lo más fácil para ustedes.

1. Abren el Pull Request
2. revisan cambios
3. hacen `Merge pull request`

### Desde terminal

Si ya están usando `gh`:

```bash
gh pr merge --merge
```

## 15. Cómo clonar el repo en otra máquina

Si querés clonar el repo compartido:

```bash
git clone https://github.com/TU-USUARIO/tpo-liga-baloncesto.git
cd tpo-liga-baloncesto
code .
```

## 16. Qué comandos van a usar más seguido

```bash
git status
git pull
git add .
git commit -m "mensaje"
git push
git checkout main
git checkout nombre-de-branch
git checkout -b nueva-branch
```

## 17. Reglas importantes para no romper nada

- no trabajen directamente sobre `main`
- hagan una branch por tarea
- hagan `pull` antes de empezar a trabajar
- no suban `backend/.env`
- no suban `backend/node_modules`
- antes de mergear, prueben que el backend siga levantando

## 18. Orden recomendado para ustedes

Si quieren hacerlo prolijo y simple:

1. configurar Git
2. loguearse en GitHub
3. inicializar repo local
4. crear repo remoto
5. subir `main`
6. invitar al compañero
7. crear una branch por persona
8. trabajar con commits chicos
9. mergear por Pull Request

## 19. Qué ya tenés y qué falta

Ya tenés:

- Git instalado
- GitHub CLI instalado
- proyecto listo para versionar

Falta:

- configurar `user.name`
- configurar `user.email`
- hacer `gh auth login`
- inicializar el repo o conectarlo a uno nuevo
