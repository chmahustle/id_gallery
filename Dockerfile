# ID Gallery: сборка сайта (Vite) + API (Express) в одном контейнере.
# База — отдельный контейнер PostgreSQL (docker-compose.yml).

# —— 1. Сборка фронтенда ——
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# демо-данные решаются при сборке (переменная Vite)
ARG VITE_DEMO_DATA=true
ENV VITE_DEMO_DATA=$VITE_DEMO_DATA
RUN npm run build

# —— 2. Рабочий образ: только нужное для запуска ——
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3001 \
    USE_EMBEDDED_PG=0
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force
# сервер читает часть данных из src/ (тексты, бренды по умолчанию)
COPY server ./server
COPY src ./src
COPY public ./public
COPY --from=build /app/dist ./dist
RUN mkdir -p uploads && chown -R node:node /app
USER node
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/api/health || exit 1
CMD ["node", "--import", "tsx", "server/index.ts"]
