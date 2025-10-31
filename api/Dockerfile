# Étape de production
FROM node:20-alpine AS production
WORKDIR /app

# Création d'un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Création des répertoires logs et media avec permissions
RUN mkdir -p /app/logs /app/media && \
    chown -R nodejs:nodejs /app/logs /app/media

# Copie des fichiers nécessaires
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/media ./media

# Passage à l'utilisateur non-root
USER nodejs

EXPOSE 9000

CMD ["node", "dist/main"]
