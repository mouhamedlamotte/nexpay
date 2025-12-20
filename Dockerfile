ARG NODE_VERSION=20.18.0
ARG BUILD_VERSION="1.0.0"

###################################################################
# Stage 1: Install dependencies for both apps                     #
###################################################################
FROM node:${NODE_VERSION}-alpine AS deps

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV HUSKY=0
ENV CI=1

RUN npm install -g pnpm@latest


WORKDIR /workspace-install

# Copy package files from both apps
COPY api/package.json api/pnpm-lock.yaml ./api/
COPY web/package.json web/pnpm-lock.yaml ./web/

# Install dependencies for API
WORKDIR /workspace-install/api
RUN pnpm fetch
COPY api/ ./
RUN pnpm install --frozen-lockfile

# Install dependencies for Web
WORKDIR /workspace-install/web
RUN pnpm fetch
COPY web/ ./
RUN pnpm install --frozen-lockfile

###################################################################
# Stage 2: Build both applications                                #
###################################################################
FROM deps AS builder

ARG BUILD_VERSION
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_READ_API_KEY

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# Build API (NestJS)
WORKDIR /workspace-install/api
RUN npx prisma generate
RUN pnpm build

# Build Web (Next.js)
WORKDIR /workspace-install/web
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_READ_API_KEY=${NEXT_PUBLIC_READ_API_KEY}

RUN echo "⚙️ Building with NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}"
RUN pnpm run build

###################################################################
# Stage 3: Production dependencies only                           #
###################################################################
FROM builder AS post-builder

# Clean and reinstall production deps for API
WORKDIR /workspace-install/api
RUN rm -rf node_modules
RUN pnpm install --prod --frozen-lockfile
RUN npx prisma generate

# Clean and reinstall production deps for Web
WORKDIR /workspace-install/web
RUN rm -rf node_modules
RUN pnpm install --prod --frozen-lockfile

###################################################################
# Stage 4: Final production image                                 #
###################################################################
FROM node:${NODE_VERSION}-alpine AS runner

ENV TZ=UTC \
    NODE_ENV=production \
    APP_PORT=9000 \
    WEB_PORT=9001 \
    PNPM_HOME="/pnpm" \
    PATH="$PNPM_HOME:$PATH"

RUN set -ex; \
    corepack enable; \
    apk add --no-cache \
        curl \
        openssl \
        netcat-openbsd \
        supervisor

# Create user and directories
RUN set -ex; \
    addgroup -g 1001 -S nodejs; \
    adduser -S nodejs -u 1001; \
    mkdir -p /app/api /app/web /app/logs /app/media /var/log/supervisor; \
    chown -R nodejs:nodejs /app /var/log/supervisor

WORKDIR /app

# Copy API application
COPY --from=post-builder --chown=nodejs:nodejs /workspace-install/api/node_modules ./api/node_modules
COPY --from=post-builder --chown=nodejs:nodejs /workspace-install/api/dist ./api/dist
COPY --from=post-builder --chown=nodejs:nodejs /workspace-install/api/prisma ./api/prisma
COPY --from=post-builder --chown=nodejs:nodejs /workspace-install/api/package.json ./api/package.json


# Copy Media files
COPY --from=post-builder --chown=nodejs:nodejs /workspace-install/api/media ./api/media



# Copy Web application
COPY --from=post-builder --chown=nodejs:nodejs /workspace-install/web/public ./web/public
COPY --from=post-builder --chown=nodejs:nodejs /workspace-install/web/.next/standalone ./web/
COPY --from=post-builder --chown=nodejs:nodejs /workspace-install/web/.next/static ./web/.next/static
COPY --from=post-builder --chown=nodejs:nodejs /workspace-install/web/package.json ./web/package.json

# Copy scripts
COPY --chown=nodejs:nodejs scripts/start.sh ./scripts/start.sh
COPY --chown=nodejs:nodejs scripts/db-migrate.mjs ./scripts/db-migrate.mjs

# Make scripts executable
RUN chmod +x ./scripts/start.sh

# Supervisor configuration
COPY <<EOF /etc/supervisord.conf
[supervisord]
nodaemon=true
user=root
logfile=/dev/stdout
logfile_maxbytes=0
pidfile=/var/run/supervisord.pid

[program:backend]
command=node /app/api/dist/main.js
directory=/app/api
user=nodejs
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
environment=NODE_ENV="production",PORT="%(ENV_APP_PORT)s"

[program:frontend]
command=node /app/web/server.js
directory=/app/web
user=nodejs
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
environment=NODE_ENV="production",PORT="%(ENV_WEB_PORT)s"
EOF

ENV BUILD_VERSION=${BUILD_VERSION}

EXPOSE 9000 9001

ENTRYPOINT ["scripts/start.sh"]