# ── Stage 1: Build ────────────────────────────────────────────
FROM eclipse-temurin:17-jdk-alpine AS build

WORKDIR /app

# Copy Maven wrapper & config first (better layer caching)
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw

# Download dependencies (cached unless pom.xml changes)
RUN ./mvnw dependency:resolve -B

# Copy source and build the fat JAR
COPY src/ src/
RUN ./mvnw package -DskipTests -B

# ── Stage 2: Run ──────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Render injects PORT env var — Spring Boot picks it up via server.port
ENV PORT=8080
EXPOSE ${PORT}

ENTRYPOINT java -Dserver.port=${PORT} -jar app.jar
