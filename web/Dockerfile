# syntax = docker/dockerfile:1

FROM node:22-slim AS base

ARG PORT=9001
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_READ_API_KEY

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_READ_API_KEY=$NEXT_PUBLIC_READ_API_KEY

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Dependencies
FROM base AS dependencies

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build
FROM base AS build

ARG NEXT_PUBLIC_API_URL   # ✅ Re-déclaré ici (chaque stage doit le connaître)
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# 🧠 Log de contrôle (utile en build)
RUN echo "⚙️ Building with NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL"
RUN pnpm run build

# Run
FROM base AS run

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_READ_API_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_READ_API_KEY=$NEXT_PUBLIC_READ_API_KEY
ENV NODE_ENV=production
ENV PORT=$PORT

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE $PORT

CMD ["node", "server.js"]
