# 🎵 Root Note Records v2

A full-stack e-commerce application for an online vinyl record store,
built with Java Spring Boot and Vanilla JS.

🔴 **Live Demo:** [root-note-records.netlify.app](https://root-note-records.netlify.app)

---

## Demo Account

- **Username:** `admin`
- **Password:** `password`

---

## Features

- 🔐 JWT authentication with Spring Security and BCrypt password hashing
- 🛒 Persistent shopping cart (MySQL composite key, session-safe)
- 🤖 AI-powered product recommendations via Claude API
- 🔍 Product filtering by category, price range, and genre
- 👤 User profile management
- 🛡️ Role-based access control (ROLE_ADMIN vs standard user)

---

## Tech Stack

### Backend

- Java 17 + Spring Boot 2.7
- Spring Security + JWT (stateless auth)
- Plain JDBC — no ORM, hand-written SQL
- MySQL 8.0

### Frontend

- Vanilla JS (no framework)
- Axios, Mustache.js, Bootstrap 4

### AI

- Anthropic Claude API (product recommendations)

### DevOps

- Backend → Railway (auto-deploy on push)
- Frontend → Netlify
- CI → GitHub Actions

---

## Architecture

```text
Controller → DAO Interface → MySqlDAO → MySQL
```

- Stateless JWT auth via Spring Security filter chain
- Shopping cart persisted with composite key (user_id, product_id)
- AI recommendations via `GET /products/{id}/recommendations`

---

## Local Setup

### Backend Setup

```bash
cd root-note-records/api
# Create src/main/resources/application-local.properties with:
# datasource.url=jdbc:mysql://localhost:3306/root_note_records
# datasource.username=root
# datasource.password=your_password
# anthropic.api.key=your_key
# jwt.secret=your_base64_secret

./mvnw spring-boot:run
```

### Frontend Setup

```bash
# Update capstone-client-recordshop/js/config.js
# Set baseUrl to http://localhost:8080
# Open index.html in browser or use Live Server
```

### Database Setup

```bash
mysql -u root -p root_note_records < root-note-records/api/database/create_database_recordshop.sql
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| POST | /login | Public | Get JWT token |
| POST | /register | Public | Create account |
| GET | /products | Public | List/search products |
| GET | /products/{id}/recommendations | Public | AI recommendations |
| GET | /cart | User | View cart |
| POST | /cart/products/{id} | User | Add to cart |
| GET | /profile | User | View profile |
| POST | /categories | Admin | Create category |

---

## Screenshots

> Add screenshots here after deployment is stable

---

## Author

**Estifanos** — [github.com/Estif017](https://github.com/Estif017)
