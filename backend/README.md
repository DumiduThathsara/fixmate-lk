# FixMate LK — Spring Boot Backend API

Java 17 + Spring Boot 3.2.5 + Spring Security (Stateless JWT + BCrypt) + Spring Data JPA + MySQL backend for **FixMate LK**.

## Prerequisites
- **Java 17+**
- **Maven 3.8+** (or `./mvnw`)
- **MySQL 8.x**

## 1. Create the MySQL Database
```sql
CREATE DATABASE fixmate_lk_db;
```
*(Note: `spring.datasource.url` also includes `createDatabaseIfNotExist=true`.)*

## 2. Configure Credentials & JWT Secret
Edit `src/main/resources/application.properties` or set environment variables before running:

- `DB_HOST` (default: `localhost`)
- `DB_PORT` (default: `3306`)
- `DB_NAME` (default: `fixmate_lk_db`)
- `DB_USERNAME` (default: `root`)
- `DB_PASSWORD` (default: `password`)
- `JWT_SECRET` (256-bit+ secret string)
- `CORS_ALLOWED_ORIGINS` (default: `http://localhost:5173`)

## 3. Run the Backend Server
From inside the `backend/` directory:
```bash
mvn spring-boot:run
```
(Or `./mvnw spring-boot:run` if using the Maven wrapper.)

The API will start on `http://localhost:8080/api/v1`.

## 4. Default Seeded Accounts (`DataInitializer`)
On first startup, the following accounts are seeded with BCrypt-hashed passwords:
- **Admin:** `admin@fixmate.lk` / `Admin@123` (sign in via `/api/v1/auth/admin/login`)
- **Customer:** `customer@fixmate.lk` / `Customer@123`
- **Technician:** `kasun.tech@fixmate.lk` / `Tech@123`

## 5. Connecting the Frontend
In `frontend/`, create a `.env` file with:
```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_ENABLE_API=true
```
