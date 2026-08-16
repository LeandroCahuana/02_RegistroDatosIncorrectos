# Registro Datos Incorrectos — Backend

API REST reactiva para la gestión de usuarios, construida con **Spring Boot WebFlux**, **R2DBC** y **PostgreSQL**.

---

## Stack tecnológico

| Tecnología | Detalle |
|---|---|
| Java | 17 |
| Spring Boot | 4.1.0 |
| Spring WebFlux | Programación reactiva (Reactor) |
| Spring Data R2DBC | Acceso reactivo a base de datos |
| PostgreSQL (Neon) | Base de datos cloud |
| Spring Security | BCrypt para hash de contraseñas |
| Spring Validation | Validaciones con Jakarta Bean Validation |
| Lombok | Reducción de boilerplate |

---

## Configuración

El servidor levanta por defecto en el puerto **8081**. Puede sobreescribirse con la variable de entorno `SERVER_PORT`.

La conexión a la base de datos se configura mediante la variable `R2DBC_URL`. Si no se proporciona, usa una URL por defecto apuntando a una instancia de Neon PostgreSQL.

```yaml
server:
  port: ${SERVER_PORT:8081}

spring:
  r2dbc:
    url: ${R2DBC_URL:<url_por_defecto>}
    pool:
      initial-size: 2
      max-size: 10
```

---

## Modelo de datos — `Users`

Tabla: `users`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `Long` | Identificador único (PK, auto-generado) |
| `name` | `String` | Nombre del usuario |
| `type_document` | `String` | Tipo de documento: `DNI` o `CNE` |
| `number_document` | `String` | Número de documento |
| `email` | `String` | Correo electrónico |
| `cellphone` | `String` | Número de celular (9 dígitos, inicia con 9) |
| `age` | `Long` | Edad (mínimo 18) |
| `gender` | `String` | Género: `M` (masculino) o `F` (femenino) |
| `password` | `String` | Contraseña (almacenada como hash BCrypt) |
| `status` | `Boolean` | Estado lógico: `true` activo / `false` eliminado |

---

## Endpoints

Base URL: `/api/v1/users`

Todos los endpoints están abiertos (no requieren autenticación).

---

### `GET /api/v1/users`

Obtiene todos los usuarios registrados.

**Request:** Sin parámetros ni body.

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "name": "Juan Pérez",
    "type_document": "DNI",
    "number_document": "12345678",
    "email": "juan@example.com",
    "cellphone": "987654321",
    "age": 25,
    "gender": "M",
    "password": "$2a$10$...",
    "status": true
  }
]
```

> Devuelve el listado completo incluyendo usuarios con `status: false` (eliminados lógicamente).

---

### `GET /api/v1/users/{id}`

Obtiene un usuario por su ID.

**Path param:** `id` — ID del usuario.

**Response `200 OK`:**
```json
{
  "id": 1,
  "name": "Juan Pérez",
  "type_document": "DNI",
  "number_document": "12345678",
  "email": "juan@example.com",
  "cellphone": "987654321",
  "age": 25,
  "gender": "M",
  "password": "$2a$10$...",
  "status": true
}
```

> Si el ID no existe, devuelve un body vacío (el `Mono` completa sin valor).

---

### `POST /api/v1/users/save`

Crea un nuevo usuario.

**Request body (`application/json`):**
```json
{
  "name": "Juan Pérez",
  "type_document": "DNI",
  "number_document": "12345678",
  "email": "juan@example.com",
  "cellphone": "987654321",
  "age": 25,
  "gender": "M",
  "password": "Segura_123"
}
```

**Comportamiento interno:**
- Fuerza `status = true` en el registro creado.
- Hashea la contraseña con **BCrypt** antes de persistir.

**Response `200 OK`:** El objeto `Users` creado con `id` asignado y contraseña hasheada.

**Response `400 Bad Request`:** Si algún campo no pasa validación (ver sección de excepciones).

---

### `PUT /api/v1/users/update`

Actualiza los datos de un usuario existente.

**Request body (`application/json`):**
```json
{
  "id": 1,
  "name": "Juan Actualizado",
  "type_document": "DNI",
  "number_document": "12345678",
  "email": "nuevo@example.com",
  "cellphone": "912345678",
  "age": 26,
  "gender": "M",
  "password": "NuevaClave_1"
}
```

**Campos actualizables:** `name`, `type_document`, `number_document`, `email`, `cellphone`, `age`, `gender`, `password`.

**Comportamiento interno:**
- Busca el usuario por `id`. Si no existe, lanza `RuntimeException`.
- Si `password` viene en el body (no nulo y no vacío), la re-hashea con BCrypt.
- Si `password` viene vacío o nulo, mantiene la contraseña existente.
- Fuerza `status = true`.

**Response `200 OK`:** El objeto `Users` actualizado.

**Response `400 Bad Request`:** Si algún campo no pasa validación.

> Si el ID no existe, actualmente el error **no está capturado por el `GlobalExceptionHandler`** (ver sección de excepciones).

---

### `PATCH /api/v1/users/delete/{id}`

Realiza una **eliminación lógica** del usuario (no borra el registro de la base de datos).

**Path param:** `id` — ID del usuario.

**Comportamiento interno:** Cambia `status` a `false` y guarda.

**Response `200 OK`:**
```json
{
  "id": 1,
  "name": "Juan Pérez",
  ...
  "status": false
}
```

> Si el ID no existe, lanza `RuntimeException` (no capturada por el handler actual).

---

### `PATCH /api/v1/users/restore/{id}`

Restaura un usuario previamente eliminado de forma lógica.

**Path param:** `id` — ID del usuario.

**Comportamiento interno:** Cambia `status` a `true` y guarda.

**Response `200 OK`:**
```json
{
  "id": 1,
  "name": "Juan Pérez",
  ...
  "status": true
}
```

> Si el ID no existe, lanza `RuntimeException` (no capturada por el handler actual).

---

## Manejo de excepciones

### `GlobalExceptionHandler`

Clase anotada con `@RestControllerAdvice`. Intercepta excepciones a nivel global y devuelve respuestas estructuradas.

#### Excepción capturada: `WebExchangeBindException`

Se dispara automáticamente cuando el body de una petición no pasa las validaciones de `@Valid` (anotaciones de Jakarta Bean Validation en el modelo `Users`).

**Response `400 Bad Request`:**
```json
{
  "timestamp": "2026-08-16T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "path": "/api/v1/users/save",
  "errors": {
    "name": "El nombre de usuario es obligatorio",
    "email": "El formato de correo no es válido",
    "cellphone": "El número de celular debe empezar con el dígito 9 y contener solo números"
  }
}
```

El mapa `errors` contiene **todos los campos que fallaron** y su respectivo mensaje de validación.

---

### Reglas de validación por campo

| Campo | Regla |
|---|---|
| `name` | No vacío. Máximo 120 caracteres. |
| `type_document` | No vacío. Solo acepta `DNI` o `CNE`. |
| `number_document` | No vacío. Máximo 12 caracteres. |
| `email` | No vacío. Formato de email válido. Máximo 120 caracteres. |
| `cellphone` | No vacío. 9 dígitos, debe comenzar con `9`. |
| `age` | No nulo. Mínimo `18`. |
| `gender` | No vacío. Solo acepta `M` o `F`. |
| `password` | Entre 8 y 120 caracteres. Debe incluir al menos: una mayúscula, una minúscula, un número y un símbolo permitido (`@ _ . ; : -`). |


---

## Docker

El proyecto incluye un `Dockerfile` para construir la imagen del servicio.

```bash
docker build -t <username>/registro-datos-incorrectos .
docker run -p 8081:8081 <username>/registro-datos-incorrectos
```
