FROM alpine:3.19
RUN apk add --no-cache gcc g++ musl-dev
WORKDIR /code
ENTRYPOINT ["sh", "-c", "g++ /code/main.cpp -o /tmp/main && /tmp/main"]
