FROM golang:1.22-alpine
WORKDIR /code
RUN apk add --no-cache gcc musl-dev
ENTRYPOINT ["go", "run", "/code/main.go"]
