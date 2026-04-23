# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a full-stack e-commerce application for a record store, split into two sub-projects:

- `root-note-records/api/` — Spring Boot REST API backend (Java 17, Maven)
- `capstone-client-recordshop/` — Vanilla JS frontend (no build step, browser-served)

---

## Backend (API)

### Commands

From `root-note-records/api/`:

```bash
# Build and run
./mvnw spring-boot:run

# Build JAR
./mvnw clean package

# Run all tests
./mvnw test

# Run a single test class
./mvnw test -Dtest=MySqlProductDaoTest
```

### Database Setup

MySQL must be running locally. The database name is `root_note_records`. SQL scripts to create/seed the schema are in `root-note-records/api/database/` — use `create_database_recordshop.sql`.

Credentials are stored in `src/main/resources/application-local.properties` (not committed — create locally if missing):
```properties
datasource.username=root
datasource.password=<your_password>
```

The main `application.properties` sets `spring.profiles.active=local` and connects to `jdbc:mysql://localhost:3306/root_note_records` on port `8080`.

### Architecture

**Layer pattern:** Controller → DAO interface → MySQL DAO implementation

- `controllers/` — REST endpoints; use `@PreAuthorize` for role-based access (`ROLE_ADMIN` for write operations, `isAuthenticated()` for user-specific routes like cart/profile)
- `data/` — DAO interfaces (e.g., `ProductDao`, `ShoppingCartDao`)
- `data/mysql/` — JDBC implementations extending `MySqlDaoBase` (which wraps `DataSource`)
- `models/` — Plain Java model classes; `models/authentication/` holds DTOs for login/register
- `security/` — JWT filter chain (`WebSecurityConfig`, `TokenProvider`, `JWTFilter`); stateless sessions via Spring Security
- `configurations/DatabaseConfig.java` — wires the `DataSource` bean from properties

**Auth flow:** `POST /login` returns a JWT bearer token. All protected endpoints expect `Authorization: Bearer <token>`. Shopping cart and profile endpoints resolve the current user via `Principal principal` → `userDao.getByUserName(principal.getName())`.

**Shopping cart persistence:** Uses a composite primary key `(user_id, product_id)` with `ON DUPLICATE KEY UPDATE quantity = quantity + 1` — cart state lives in MySQL, not in memory.

### Tests

Tests extend `BaseDaoTestClass`, which uses `TestDatabaseConfig` and rolls back after each test (`@AfterEach rollback()`). Tests require a live MySQL connection — no mocks.

---

## Frontend (Client)

No build system. Open `capstone-client-recordshop/index.html` directly in a browser, or serve it with any static file server.

### Configuration

`js/config.js` sets the API base URL:
```js
const config = { baseUrl: 'http://localhost:8080' }
```

### Architecture

- `js/application.js` — entry point; wires DOM events and delegates to services; bootstraps on `DOMContentLoaded`
- `js/services/` — one file per domain (`products-service.js`, `categories-service.js`, `shoppingcart-service.js`, `profile-service.js`, `user-service.js`); each uses Axios for API calls
- `js/template-builder.js` — renders Mustache templates from `templates/*.html` into DOM targets
- `templates/` — Mustache HTML partials for each view (home, cart, profile, login form, product card, etc.)
- `js/lib/` — vendored libraries (Axios, Bootstrap, jQuery, Mustache)

The frontend is purely client-rendered. There is no routing library — views are swapped by injecting template HTML into named DOM containers.
