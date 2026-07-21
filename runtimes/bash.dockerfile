FROM alpine:3.19
RUN apk add --no-cache bash
WORKDIR /code
ENTRYPOINT ["bash", "/code/main.sh"]
