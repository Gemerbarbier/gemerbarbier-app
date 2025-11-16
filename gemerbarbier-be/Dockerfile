# Stage 1: Build Next.js static files
FROM node:24-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build
RUN npm run export

# Stage 2: Build Spring Boot backend with Maven
FROM maven:3.9.9-eclipse-temurin-24 AS backend-builder

WORKDIR /app/backend
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B

COPY backend/ .
# Copy static frontend files into Spring Boot resources
COPY --from=frontend-builder /app/frontend/out ./src/main/resources/static

RUN mvn package -DskipTests -B

# Stage 3: Run the Spring Boot app
FROM eclipse-temurin:24-jre-alpine

WORKDIR /app
COPY --from=backend-builder /app/backend/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
