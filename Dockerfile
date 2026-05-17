# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then npm ci; else npm install; fi

FROM node:22-alpine AS build
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

RUN addgroup -S nodejs -g 1001 && adduser -S app -u 1001 -G nodejs

COPY --from=build --chown=app:nodejs /app/dist ./dist
COPY --from=build --chown=app:nodejs /app/server.mjs ./server.mjs
COPY --from=build --chown=app:nodejs /app/package.json ./package.json

USER app
EXPOSE 3000

CMD ["node", "server.mjs"]
