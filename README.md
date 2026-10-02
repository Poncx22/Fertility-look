# FertilityLook 🌸 — Entiende tu ciclo de un vistazo

¿Para qué sirve? Es una app sencilla para saber cuándo es tu **ventana fértil, tu ovulación y tu próximo periodo**. Solo pones la fecha de tu última regla y listo.

Tiene dos partes que trabajan juntas:

- **Backend (la cocina):** guarda tus datos y hace los cálculos. Está hecho con Spring Boot, JPA y MySQL.
- **Frontend (lo que ves):** la página bonita en React donde eliges tu perfil, pones fechas y ves el resultado.

> Ojo: es una estimación informativa, no un método médico.

**¿Qué es JPA?** Es la forma en que el backend habla con la base de datos sin que tengas que escribir SQL a mano. Tú usas clases Java (como `User` o `CycleRecord`) y JPA las guarda/lee en MySQL automáticamente.

---

## 1. ¿Qué necesitas tener instalado?

No necesitas saber Spring Boot, solo instala esto:

1. **Java 21** — es lo que usa el backend para funcionar.
   - Comprueba con: `java -v`
2. **MySQL 8** — es donde se guardan usuarias y ciclos.
   - Tiene que estar encendido cuando uses la app.
3. **Node.js 20 o más** — es lo que usa la página (frontend).
   - Comprueba con: `node -v`
4. **Maven no hace falta instalarlo:** el proyecto ya trae `mvnw` / `mvnw.cmd` que lo hace solo.

---

## 2. Tecnologías (resumen rápido)

- **Backend:** Java 21 + Spring Boot (API) + JPA/Hibernate (persistencia) + MySQL (base de datos) + Lombok
- **Frontend:** React 19 + Vite + TailwindCSS + GSAP (animaciones)
- **Comunicación:** el frontend le "pregunta" al backend por internet usando una dirección como `http://localhost:8080/api/v1/...`

---

## 3. Configuración antes de arrancar

### A) Base de datos

Asegúrate de tener MySQL encendido. El backend crea solo la base `ciclo_db` si no existe.

Si prefieres crearla a mano, usa el archivo:

- `backend/eseculaso_modelado/schema.sql`

### B) Configurar el backend

En `backend/` hay un ejemplo llamado `.env.example`. Cópialo como `.env` o simplemente revisa que estos valores te sirvan:

```text
SERVER_PORT=8080
CORS_ALLOWED_ORIGINS=http://localhost:5173
DB_URL=jdbc:mysql://localhost:3306/ciclo_db?createDatabaseIfNotExist=true&serverTimezone=UTC
DB_USERNAME=root
DB_PASSWORD=admin123
```

¿Qué es cada cosa?

- `SERVER_PORT`: puerto donde corre el backend (normalmente 8080, no lo cambies).
- `CORS_ALLOWED_ORIGINS`: qué página puede hablar con el backend. En local es `http://localhost:5173` (la de Vite).
- `DB_URL / DB_USERNAME / DB_PASSWORD`: cómo conectarse a tu MySQL. Cambia usuario y contraseña por los tuyos.

> Si no creas `.env`, el proyecto usa esos mismos valores por defecto.

### C) Configurar el frontend (opcional)

El frontend ya sabe buscar al backend en `http://localhost:8080/api/v1`.

Solo si tu backend corre en otra dirección, crea un archivo `frontend/.env` con:

```text
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

---

## 4. ¿Cómo habla React con Spring Boot?

Muy simple:

1. Tú pones tu fecha en la página (React).
2. React envía esa info al backend (Spring Boot) en formato JSON.
3. El backend calcula y devuelve el resultado también en JSON.
4. React lo muestra bonito: anillo del ciclo, fechas y tarjetas.

Ejemplo de lo que envía React:

```json
{
  "lastPeriodDate": "2026-09-01",
  "cycleLength": 28,
  "periodLength": 5,
  "userId": 1
}
```

Y lo que responde el backend:

```json
{
  "nextPeriodStart": "2026-09-29",
  "estimatedOvulationDate": "2026-09-15",
  "fertileWindowStart": "2026-09-10",
  "fertileWindowEnd": "2026-09-16"
}
```

No hay login ni contraseñas. Solo se usa un `userId` para separar los perfiles.

Principales direcciones que usa la página:

- `POST /cycle/calculate` → calcular y guardar un ciclo
- `GET /cycle/history?userId=1` → ver historial de una usuaria
- `POST /users` y `GET /users` → crear y listar perfiles

---

## 5. Cómo arrancar todo (paso a paso)

**Paso 1 — Arranca el backend:**

```bash
cd backend
./mvnw spring-boot:run
# En Windows:
mvnw.cmd spring-boot:run
```

Espera a ver algo como `Started AppApplication`. Si da error de base de datos, revisa que MySQL esté encendido y tu usuario/contraseña en el punto 3B.

El backend queda en: `http://localhost:8080/api/v1`

**Paso 2 — Arranca el frontend (en otra terminal):**

```bash
cd frontend
npm install
npm run dev
```

Abre en tu navegador lo que te diga (normalmente `http://localhost:5173`).

**Paso 3 — Úsalo:**

1. Crea un perfil con tu nombre y email.
2. Pon fecha de última regla, duración de ciclo (ej. 28) y de periodo (ej. 5).
3. Pulsa calcular y mira tu ventana fértil.

---

## 6. Comandos útiles

Backend (`cd backend`):

- `./mvnw spring-boot:run` → arrancar
- `./mvnw test` → correr pruebas
- `./mvnw package` → crear .jar

Frontend (`cd frontend`):

- `npm run dev` → modo desarrollo
- `npm run build` → crear versión final en `dist/`
- `npm run preview` → ver la versión final
- `npm run lint` → revisar errores

---

## 7. Si algo falla

- **La página dice que no llega al backend:** ¿arrancaste el backend? ¿está en el puerto 8080?
- **Error de conexión a MySQL:** revisa que MySQL esté encendido y tu `DB_USERNAME / DB_PASSWORD`.
- **Página en blanco en puerto distinto:** revisa `CORS_ALLOWED_ORIGINS` en el backend y `VITE_API_BASE_URL` en el frontend.
