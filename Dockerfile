FROM node:20.20-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Prisma generate only needs a valid URL format at build time.
ARG DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build
ENV DATABASE_URL=${DATABASE_URL}

RUN npx prisma generate && npm run build
RUN npm prune --omit=dev

FROM node:20.20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

COPY docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["/entrypoint.sh"]
