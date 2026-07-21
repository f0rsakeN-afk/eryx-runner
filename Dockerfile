FROM oven/bun:1-alpine

WORKDIR /app

RUN apk add --no-cache curl docker-cli

COPY package.json bun.lockb* ./
RUN bun install --production

COPY runtimes ./runtimes
COPY src ./src

EXPOSE 3001

CMD ["bun", "run", "src/index.ts"]
