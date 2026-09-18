# JAT Backend

Spring Boot REST API for Job Application Tracker.

## Stack

- Java 21
- Spring Boot 4 (Web MVC, Data JPA, Validation)
- PostgreSQL
- Lombok
- Maven Wrapper (`mvnw` / `mvnw.cmd`)

## Setup

1. Ensure PostgreSQL is running and create DB `jat`.
2. Copy env:

```bash
cp .env.example .env
```

3. Run:

```bash
./mvnw spring-boot:run
```

On Windows: `mvnw.cmd spring-boot:run`.

Server: `http://localhost:8080`

## Environment

| Variable | Default | Description |
| --- | --- | --- |
| `SERVER_PORT` | `8080` | HTTP port |
| `DB_HOST` | `localhost` | Postgres host |
| `DB_PORT` | `5432` | Postgres port |
| `DB_NAME` | `jat` | Database name |
| `DB_USERNAME` | `postgres` | DB user |
| `DB_PASSWORD` | `postgres` | DB password |
| `JPA_DDL_AUTO` | `update` | Hibernate DDL mode |
| `JPA_SHOW_SQL` | `true` | Log SQL |

`application.properties` also loads optional `.env` / `backend/.env`.

## Useful Maven commands

```bash
./mvnw test
./mvnw package
./mvnw spring-boot:run
```

## Package layout

Java packages under `com.jat.jat` (e.g. company, job, thread, contact, interaction, follow-up, remark), typically `api` / `application` / `domain`.
