FROM alpine:3.19
RUN apk add --no-cache gcc musl-dev
WORKDIR /code
ENTRYPOINT ["sh", "-c", "gcc /code/main.c -o /tmp/main && /tmp/main"]
