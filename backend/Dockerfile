FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Environment Variables (Will be picked up from EC2 if provided)
ENV PORT=8080
ENV APP_SEED_PRODUCTS_ENABLED=false

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]