#!/bin/bash
# install.sh

set -e

echo "╔════════════════════════════════════════╗"
echo "║   🚀 Nexpay Installation       ║"
echo "╔════════════════════════════════════════╗"
echo ""

# Vérifications
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Installez-le depuis https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé."
    exit 1
fi

echo "✅ Docker et Docker Compose détectés"
echo ""

# Configuration
echo "📝 Configuration de l'installation"
echo ""

read -p "Nom de domaine (ex: pay.votre-domaine.com): " APP_DOMAIN
read -p "Email admin (pour SSL): " ADMIN_EMAIL
read -p "Nom de l'application [Nexpay]: " APP_NAME
APP_NAME=${APP_NAME:-Nexpay}

echo ""
echo "🔐 Génération des secrets de sécurité..."

# Copier .env.example
cp .env.example .env

# Générer les secrets
JWT_SECRET=$(openssl rand -base64 32)
DB_PASSWORD=lamotte


# Générer le hash pour Traefik
echo ""
read -s -p "Mot de passe pour le dashboard Traefik: " TRAEFIK_PASSWORD
echo ""
TRAEFIK_AUTH=$(echo $(htpasswd -nb admin "$TRAEFIK_PASSWORD") | sed -e 's/\$/\$\$/g')

# Remplacer dans .env
sed -i "s|APP_DOMAIN=.*|APP_DOMAIN=$APP_DOMAIN|" .env
sed -i "s|ADMIN_EMAIL=.*|ADMIN_EMAIL=$ADMIN_EMAIL|" .env
sed -i "s|APP_NAME=.*|APP_NAME=$APP_NAME|" .env
sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env
sed -i "s|DB_PASSWORD=.*|DB_PASSWORD=$DB_PASSWORD|" .env
sed -i "s|TRAEFIK_AUTH=.*|TRAEFIK_AUTH=$TRAEFIK_AUTH|" .env

echo "✅ Secrets générés"
echo ""

# Créer le fichier acme.json pour Let's Encrypt
touch traefik/acme.json
chmod 600 traefik/acme.json

echo "🐳 Lancement des containers Docker..."
docker compose up -d --remove-orphans --build

echo ""
echo "⏳ Attente du démarrage des services (30s)..."
sleep 30

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   ✅ Installation terminée !           ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "🌐 URLs disponibles:"
echo "   - Dashboard Admin:  https://$APP_DOMAIN/admin"
echo "   - API:              https://$APP_DOMAIN/api/v1"
echo "   - Checkout:         https://$APP_DOMAIN/checkout"
echo "   - Traefik:          https://$APP_DOMAIN/traefik"
echo ""
echo "🔑 Identifiants Traefik:"
echo "   - Utilisateur: admin"
echo "   - Mot de passe: (celui que vous avez choisi)"
echo ""
echo "📚 Prochaines étapes:"
echo "   1. Accéder à https://$APP_DOMAIN/admin"
echo "   2. Créer votre premier projet"
echo "   3. Configurer les providers (Wave, Orange Money, etc.)"
echo "   4. Générer des API keys"
echo ""
echo "📖 Documentation complète: https://github.com/votre-repo/docs"
echo ""
echo "💡 Pour voir les logs: docker compose logs -f"
echo "💡 Pour arrêter: docker compose down"
echo ""