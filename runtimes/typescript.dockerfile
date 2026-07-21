FROM node:22-alpine
RUN npm install -g tsx
WORKDIR /code
ENTRYPOINT ["npx", "tsx", "/code/main.ts"]
