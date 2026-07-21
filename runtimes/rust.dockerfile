FROM rust:1.77-alpine
WORKDIR /code
RUN apk add --no-cache gcc musl-dev
ENTRYPOINT ["sh", "-c", "rustc /code/main.rs -o /tmp/main && /tmp/main"]
