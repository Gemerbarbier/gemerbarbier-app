# Stage 1: Build frontend
FROM node:24-alpine AS frontend-builder

WORKDIR /app/gemerbarbier-fe

COPY gemerbarbier-fe/package*.json ./
RUN npm ci

COPY gemerbarbier-fe/ ./
RUN npm run build

# Stage 2: Build Spring Boot backend
FROM maven:3.9.9-eclipse-temurin-24 AS backend-builder

WORKDIR /app/gemerbarbier-be

COPY gemerbarbier-be/pom.xml ./
RUN mvn dependency:go-offline -B

COPY gemerbarbier-be/ ./

# Copy built frontend assets into Spring Boot static resources
COPY --from=frontend-builder /app/gemerbarbier-fe/dist ./src/main/resources/static

RUN mvn clean package -DskipTests -B

# Stage 3: Runtime image
FROM eclipse-temurin:24-jre-alpine

WORKDIR /app

COPY --from=backend-builder /app/gemerbarbier-be/target/*.jar app.jar

EXPOSE 8080

ENV SERVER_PORT=8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
