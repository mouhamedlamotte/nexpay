# Étape de build
FROM node:20-alpine AS builder
WORKDIR /app

# Installation de pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copie des fichiers de dépendances
COPY package.json pnpm-lock.yaml ./

# Installation des dépendances (uniquement production + dev pour le build)
RUN pnpm install --frozen-lockfile

# Copie du code source
COPY . .

# Génération Prisma et build
RUN npx prisma generate && pnpm build


# Étape de production
FROM node:20-alpine AS production
WORKDIR /app

# Création d'un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Création du répertoire logs avec les bonnes permissions AVANT de changer d'utilisateur
RUN mkdir -p /app/logs && \
    chown -R nodejs:nodejs /app/logs

RUN mkdir -p /app/media && \
    chown -R nodejs:nodejs /app/media







# Copie uniquement des fichiers nécessaires
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

# Changement vers l'utilisateur non-root
USER nodejs

EXPOSE 9000

CMD ["node", "dist/main"]