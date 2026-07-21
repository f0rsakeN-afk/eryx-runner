FROM eclipse-temurin:21-jdk-alpine
WORKDIR /code
ENTRYPOINT ["sh", "-c", "javac /code/Main.java && java -cp /code Main"]
