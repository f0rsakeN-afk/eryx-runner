FROM node:22-alpine
WORKDIR /code
ENTRYPOINT ["node", "/code/main.js"]
