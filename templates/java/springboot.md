---
name: springboot
displayName: Spring Boot
description: Spring Boot REST API with Java
category: java
tags: [java, spring, springboot, api, backend]
variables:
  - name: build_tool
    prompt: "Build tool?"
    options: [Maven, Gradle]
    default: Maven
  - name: db
    prompt: "Database?"
    options: [PostgreSQL, MySQL, H2]
    default: PostgreSQL
  - name: java_version
    prompt: "Java version?"
    options: ["21", "17"]
    default: "21"
detects:
  files: [pom.xml, build.gradle, build.gradle.kts]
priority: 10
---

# Project

Spring Boot REST API using {{build_tool}} with Java {{java_version}} and {{db}}.

## Commands

- `./mvnw spring-boot:run` — Start dev server (Maven)
- `./gradlew bootRun` — Start dev server (Gradle)
- `./mvnw test` — Run tests (Maven)
- `./gradlew test` — Run tests (Gradle)
- `./mvnw package` — Build JAR (Maven)
- `./gradlew build` — Build JAR (Gradle)

## Architecture

- `src/main/java/` — Application source code
  - `controller/` — REST controllers (@RestController)
  - `service/` — Business logic (@Service)
  - `repository/` — Data access layer (@Repository, Spring Data JPA)
  - `model/` or `entity/` — JPA entities and domain objects
  - `dto/` — Data transfer objects for API requests/responses
  - `config/` — Configuration classes (@Configuration)
  - `exception/` — Custom exceptions and @ControllerAdvice handlers
- `src/main/resources/` — Configuration files (application.yml, etc.)
- `src/test/java/` — Test source code

## Conventions

- Use constructor injection (not field injection) for dependencies
- Keep controllers thin: validate input, call service, return response
- Use Spring Data JPA repositories; avoid raw JDBC unless performance-critical
- Use `@Transactional` at the service layer, not the controller
- Define DTOs for API boundaries; do not expose JPA entities directly
- Use `application.yml` over `application.properties` for structured config
- Write integration tests with `@SpringBootTest` and `@DataJpaTest`
- Use `@Valid` with Jakarta Bean Validation on request DTOs

## Error Handling

Use `@ControllerAdvice` with `@ExceptionHandler` for global error handling. Return consistent error response DTOs with appropriate HTTP status codes.
