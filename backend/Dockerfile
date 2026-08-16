# Build do backend EcoNexo para hosts em container (Render, Railway, Fly).
# Contexto de build = pasta backend/

# --- Estágio 1: compila o JAR ---
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copia só o pom primeiro: enquanto as dependências não mudam,
# o Docker reaproveita esta camada e o build fica muito mais rápido.
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# --- Estágio 2: imagem final (só JRE, sem Maven) ---
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# O free tier do Render tem 512 MB. Sem esse limite a JVM assume que pode
# usar mais do que existe e o container morre por OOM sob carga.
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseSerialGC"

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
