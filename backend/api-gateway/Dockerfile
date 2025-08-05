# Etapa de construcción
FROM openjdk:17-jdk-alpine AS builder

WORKDIR /app

# Copiar solo lo necesario para la resolución de dependencias primero (mejor cacheo)
COPY ./pom.xml ./pom.xml
COPY .mvn .mvn
COPY mvnw .

# Descargar dependencias (esto se cachea si no cambias el pom.xml)
RUN ./mvnw dependency:go-offline -B

# Ahora copiar el código fuente
COPY ./src ./src

# Empaquetar la aplicación (sin correr tests)
RUN ./mvnw clean package -DskipTests -B

# Etapa final
FROM openjdk:17-jdk-alpine

WORKDIR /app
RUN mkdir ./logs

# Copiar el JAR generado
COPY --from=builder /app/target/*.jar app.jar

# Exponer el puerto (si usas $PORT en tiempo de ejecución, no hace nada en tiempo de build)
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
