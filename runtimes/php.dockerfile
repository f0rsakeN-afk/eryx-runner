FROM php:8.3-cli-alpine
WORKDIR /code
ENTRYPOINT ["php", "/code/main.php"]
