# Etapa de construcción
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

COPY ./pom.xml ./pom.xml
COPY .mvn .mvn
COPY mvnw .

RUN ./mvnw dependency:go-offline -B

COPY ./src ./src
RUN ./mvnw clean package -DskipTests -B

# Etapa final
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app
RUN mkdir ./logs

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8086
ENTRYPOINT ["java", "-jar", "app.jar"]
