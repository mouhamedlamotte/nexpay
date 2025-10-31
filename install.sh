#!/bin/bash
## Nexpay Installation Script
## Usage: curl -fsSL https://raw.githubusercontent.com/mouhamedlamotte/nexpay/main/install.sh | bash -s -- yourdomain.com

set -e # Exit on error
set -o pipefail

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
INSTALL_DIR="/opt/nexpay"
CDN_URL="https://raw.githubusercontent.com/mouhamedlamotte/nexpay/main"
DATE=$(date +"%Y%m%d-%H%M%S")
LOG_FILE="$INSTALL_DIR/installation-${DATE}.log"

# Récupérer le domaine passé en paramètre
DOMAIN_ARG="$1"

# Vérifier si root
if [ $EUID != 0 ]; then
    echo -e "${RED}❌ Veuillez exécuter ce script avec sudo${NC}"
    exit 1
fi

# Banner
echo -e "${PURPLE}"
cat << "EOF"
╔════════════════════════════════════════╗
║   🚀 Nexpay Installation               ║
║   Payment Gateway Self-Hosted          ║
╚════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Vérifier que le domaine est fourni
if [ -z "$DOMAIN_ARG" ]; then
    echo ""
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ❌ ERREUR: DOMAINE REQUIS                                ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Un nom de domaine est obligatoire pour installer Nexpay.${NC}"
    echo ""
    echo -e "${BLUE}Usage:${NC}"
    echo "  curl -fsSL https://raw.githubusercontent.com/mouhamedlamotte/nexpay/main/install.sh | bash -s -- votre-domaine.com"
    echo ""
    echo -e "${BLUE}Exemple:${NC}"
    echo "  curl -fsSL https://raw.githubusercontent.com/mouhamedlamotte/nexpay/main/install.sh | bash -s -- pay.example.com"
    echo ""
    echo -e "${BLUE}Prérequis:${NC}"
    echo "  • Vous devez posséder un nom de domaine"
    echo "  • Le domaine doit pointer vers l'IP de ce serveur (enregistrement DNS de type A)"
    echo "  • Le certificat SSL sera automatiquement généré via Let's Encrypt"
    echo ""
    exit 1
fi

# Créer le dossier d'installation AVANT le logging
mkdir -p "$INSTALL_DIR"

# Fonction de logging
exec > >(tee -a "$LOG_FILE") 2>&1

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Fonction pour vérifier si un domaine pointe vers ce serveur
check_domain_dns() {
    local domain=$1
    local server_ip=$2
    
    log_info "Vérification DNS pour: $domain"
    
    # Essayer avec dig en premier
    if command -v dig &> /dev/null; then
        RESOLVED_IP=$(dig +short "$domain" A | tail -n1)
    # Sinon essayer avec nslookup
    elif command -v nslookup &> /dev/null; then
        RESOLVED_IP=$(nslookup "$domain" | grep -A1 "Name:" | grep "Address:" | awk '{print $2}' | tail -n1)
    else
        log_error "Ni 'dig' ni 'nslookup' ne sont disponibles"
        return 1
    fi
    
    if [ -z "$RESOLVED_IP" ]; then
        log_error "Impossible de résoudre le domaine: $domain"
        return 1
    fi
    
    log_info "Domaine $domain pointe vers: $RESOLVED_IP"
    log_info "Adresse IP du serveur: $server_ip"
    
    if [ "$RESOLVED_IP" = "$server_ip" ]; then
        log_success "✓ Le domaine pointe correctement vers ce serveur"
        return 0
    else
        log_error "✗ Le domaine ne pointe PAS vers ce serveur"
        echo ""
        echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║  ⚠️  ERREUR DE CONFIGURATION DNS                          ║${NC}"
        echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${YELLOW}Le domaine '$domain' pointe vers: $RESOLVED_IP${NC}"
        echo -e "${YELLOW}Mais ce serveur a l'IP: $server_ip${NC}"
        echo ""
        echo -e "${BLUE}📋 Pour corriger cela:${NC}"
        echo "   1. Connectez-vous à votre registrar de domaine (OVH, Cloudflare, etc.)"
        echo "   2. Créez un enregistrement DNS de type A:"
        echo "      Nom: $domain (ou @ pour le domaine racine)"
        echo "      Type: A"
        echo "      Valeur: $server_ip"
        echo "      TTL: 300 (ou minimum disponible)"
        echo ""
        echo "   3. Attendez la propagation DNS (5-30 minutes généralement)"
        echo "   4. Vérifiez avec: dig +short $domain"
        echo "   5. Relancez l'installation une fois le DNS configuré"
        echo ""
        return 1
    fi
}

# 1. Détection du système
log_info "Détection du système d'exploitation..."
OS_TYPE=$(grep -w "ID" /etc/os-release | cut -d "=" -f 2 | tr -d '"')
OS_VERSION=$(grep -w "VERSION_ID" /etc/os-release | cut -d "=" -f 2 | tr -d '"')

case "$OS_TYPE" in
    ubuntu|debian|raspbian|centos|fedora|rhel|arch)
        log_success "OS supporté: $OS_TYPE $OS_VERSION"
        ;;
    *)
        log_error "OS non supporté: $OS_TYPE"
        exit 1
        ;;
esac

# 2. Vérification de l'espace disque
log_info "Vérification de l'espace disque..."
TOTAL_SPACE=$(df -BG / | awk 'NR==2 {print $2}' | sed 's/G//')
AVAILABLE_SPACE=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')

if [ "$AVAILABLE_SPACE" -lt 10 ]; then
    log_warn "Espace disque faible: ${AVAILABLE_SPACE}GB disponible (10GB recommandé)"
    sleep 3
fi

# 3. Installation des dépendances de base
log_info "Installation des dépendances..."

case "$OS_TYPE" in
    ubuntu|debian|raspbian)
        apt-get update -y >/dev/null 2>&1
        apt-get install -y curl wget git jq openssl apache2-utils dnsutils >/dev/null 2>&1
        ;;
    centos|fedora|rhel)
        dnf install -y curl wget git jq openssl httpd-tools bind-utils >/dev/null 2>&1
        ;;
    arch)
        pacman -Sy --noconfirm curl wget git jq openssl apache-tools bind-tools >/dev/null 2>&1
        ;;
esac

log_success "Dépendances installées"

# 4. Installation de Docker
log_info "Vérification de Docker..."

if ! command -v docker &> /dev/null; then
    log_warn "Docker non détecté. Installation en cours..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    log_success "Docker installé"
else
    log_success "Docker déjà installé"
fi

# Vérifier Docker Compose
if ! docker compose version &> /dev/null; then
    log_error "Docker Compose V2 requis mais non trouvé"
    exit 1
fi

# 5. Détection de l'IP du serveur
DETECTED_IP=$(hostname -I | awk '{print $1}')

if [ -z "$DETECTED_IP" ]; then
    log_error "Impossible de détecter l'adresse IP du serveur"
    exit 1
fi

log_success "Adresse IP du serveur détectée: $DETECTED_IP"

# 6. Validation du domaine
log_info "Domaine fourni: $DOMAIN_ARG"

# Vérifier que le domaine pointe vers ce serveur
if ! check_domain_dns "$DOMAIN_ARG" "$DETECTED_IP"; then
    log_error "Installation annulée: Le domaine ne pointe pas vers ce serveur"
    exit 1
fi

APP_DOMAIN="$DOMAIN_ARG"
USE_SSL=true
log_success "Domaine validé: $APP_DOMAIN (SSL sera configuré automatiquement)"

# 7. Création de la structure des dossiers
log_info "Création de la structure..."
mkdir -p $INSTALL_DIR/{config/traefik/dynamic,database,api,web,logs,backups}
cd $INSTALL_DIR

# 8. Clonage du repository
log_info "Téléchargement de Nexpay depuis GitHub..."

REPO_URL="https://github.com/mouhamedlamotte/nexpay.git"
TEMP_DIR=$(mktemp -d)

# Clone dans un dossier temporaire
git clone --depth 1 --branch main "$REPO_URL" "$TEMP_DIR"

# Copier les fichiers nécessaires
cp -r "$TEMP_DIR"/* $INSTALL_DIR/
rm -rf "$TEMP_DIR"

log_success "Code source téléchargé"

# 9. Configuration automatique
echo ""
log_info "Configuration automatique de Nexpay"
echo ""

# Email admin
ADMIN_EMAIL="admin@$APP_DOMAIN"
log_info "Email admin: $ADMIN_EMAIL"

# Nom de l'app
APP_NAME="Nexpay"
log_info "Nom de l'application: $APP_NAME"

# Mot de passe Traefik par défaut
TRAEFIK_PASSWORD="nexpay2024"
log_info "Mot de passe Traefik: $TRAEFIK_PASSWORD (par défaut)"

echo ""
log_warn "Configuration par défaut appliquée. Vous pourrez modifier ces paramètres plus tard dans le fichier .env"
echo ""
sleep 2

# 10. Génération des secrets
log_info "Génération des secrets de sécurité..."

JWT_SECRET=$(openssl rand -base64 32)
DB_PASSWORD=postgres
REDIS_PASSWORD=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
ADMIN_PASSWORD=$(openssl rand -hex 16)
TRAEFIK_AUTH=$(echo $(htpasswd -nb admin "$TRAEFIK_PASSWORD") | sed -e 's/\$/\$\$/g')

log_success "Secrets générés"

# 11. Création du fichier .env
log_info "Configuration de l'environnement..."

cat > .env << EOF
# Nexpay Configuration
# Generated on $(date)

# Application
APP_NAME=$APP_NAME
APP_DOMAIN=$APP_DOMAIN
APP_VERSION=1.0.0
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD
NODE_ENV=production
USE_SSL=true

# Security
JWT_SECRET=$JWT_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY

# Database
DB_NAME=nexpay
DB_USER=nexpay
DB_PASSWORD=$DB_PASSWORD
DATABASE_URL=postgresql://nexpay:postgres@nexpay-db:5432/nexpay

# Redis
REDIS_PASSWORD=$REDIS_PASSWORD

# Traefik
TRAEFIK_AUTH=$TRAEFIK_AUTH
EOF

log_success "Fichier .env créé"

# 12. Configuration SSL avec Let's Encrypt
log_info "Configuration SSL activée pour: $APP_DOMAIN"
mkdir -p config/traefik/letsencrypt
touch config/traefik/letsencrypt/acme.json
chmod 600 config/traefik/letsencrypt/acme.json
log_success "Configuration SSL prête (Let's Encrypt)"

# 13. Démarrage des containers
log_info "Démarrage de Nexpay..."
docker compose pull 2>&1 | grep -v "Pulling" || true
docker compose up -d --build

# 14. Attente du démarrage
log_info "Attente du démarrage des services..."
sleep 15

# Vérifier que les containers tournent
RUNNING_CONTAINERS=$(docker compose ps --status running 2>/dev/null | grep -c "Up" || echo "0")
if [ "$RUNNING_CONTAINERS" -ge 3 ]; then
    log_success "Tous les services sont démarrés ($RUNNING_CONTAINERS containers actifs)"
else
    log_warn "Certains services ont des problèmes"
    docker compose ps
fi

# 15. Test de santé
log_info "Test de connectivité..."
sleep 5

if curl -f http://localhost:9000/api/v1/health > /dev/null 2>&1; then
    log_success "API répond correctement"
else
    log_warn "API ne répond pas encore (peut prendre 1-2 minutes)"
fi

# 16. Affichage des informations finales
echo ""
echo -e "${PURPLE}"
cat << "EOF"
╔════════════════════════════════════════╗
║   ✅ Installation terminée !           ║
╚════════════════════════════════════════╝
EOF
echo -e "${NC}"
echo ""
echo -e "${GREEN}🌐 URLs disponibles:${NC}"
echo "   • API:     https://$APP_DOMAIN/api/v1"
echo "   • WEB:     https://$APP_DOMAIN"
echo "   • Traefik: https://$APP_DOMAIN:8080"

echo ""
echo -e "${GREEN}🔑 Identifiants par défaut:${NC}"
echo "   • Admin:    admin / $ADMIN_PASSWORD"
echo "   • Traefik:  admin / $TRAEFIK_PASSWORD"
echo ""

echo -e "${YELLOW}⚠️  SÉCURITÉ:${NC}"
echo "   1. Sauvegardez le fichier: $INSTALL_DIR/.env"
echo "   2. CHANGEZ le mot de passe admin immédiatement !"
echo "   3. CHANGEZ le mot de passe Traefik !"
echo ""

echo -e "${BLUE}🔒 Certificat SSL:${NC}"
echo "   • Le certificat SSL sera généré automatiquement par Let's Encrypt"
echo "   • Cela peut prendre 1-2 minutes"
echo "   • Vérifiez l'état: docker compose logs traefik | grep acme"
echo ""

echo -e "${BLUE}📚 Commandes utiles:${NC}"
echo "   • Voir les logs:     cd $INSTALL_DIR && docker compose logs -f"
echo "   • Redémarrer:        cd $INSTALL_DIR && docker compose restart"
echo "   • Arrêter:           cd $INSTALL_DIR && docker compose down"
echo "   • Voir les services: cd $INSTALL_DIR && docker compose ps"
echo "   • Mettre à jour:     cd $INSTALL_DIR && ./update.sh"
echo ""
echo -e "${BLUE}📖 Documentation:${NC} https://nexpay.thenexcom.com"
echo -e "${BLUE}💬 Support:${NC} https://github.com/mouhamedlamotte/nexpay/issues"
echo ""

# 17. Créer un script de mise à jour
cat > update.sh << 'UPDATE_SCRIPT'
#!/bin/bash
set -e

echo "🔄 Mise à jour de Nexpay..."

# Backup de la base de données
echo "📦 Création d'un backup..."
docker compose exec -T postgres_nexpay pg_dump -U nexpay nexpay > "backups/backup-$(date +%Y%m%d-%H%M%S).sql"

# Pull des nouvelles images
echo "⬇️  Téléchargement des mises à jour..."
docker compose pull

# Rebuild et restart
echo "🔨 Reconstruction des services..."
docker compose up -d --build

echo "✅ Mise à jour terminée"
echo "📊 Status des services:"
docker compose ps
UPDATE_SCRIPT

chmod +x update.sh

# 18. Créer un script de configuration du domaine amélioré
cat > configure-domain.sh << 'DOMAIN_SCRIPT'
#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🌐 Configuration du domaine personnalisé${NC}"
echo ""

read -p "Entrez votre nom de domaine (ex: pay.example.com): " NEW_DOMAIN

if [ -z "$NEW_DOMAIN" ]; then
    echo -e "${RED}❌ Domaine vide, annulation${NC}"
    exit 1
fi

# Détecter l'IP du serveur
SERVER_IP=$(hostname -I | awk '{print $1}')

echo ""
echo -e "${YELLOW}⏳ Vérification DNS en cours...${NC}"

# Vérifier le DNS
if command -v dig &> /dev/null; then
    RESOLVED_IP=$(dig +short "$NEW_DOMAIN" A | tail -n1)
elif command -v nslookup &> /dev/null; then
    RESOLVED_IP=$(nslookup "$NEW_DOMAIN" | grep -A1 "Name:" | grep "Address:" | awk '{print $2}' | tail -n1)
else
    echo -e "${RED}❌ Impossible de vérifier le DNS${NC}"
    exit 1
fi

if [ "$RESOLVED_IP" != "$SERVER_IP" ]; then
    echo -e "${RED}❌ Le domaine $NEW_DOMAIN ne pointe pas vers ce serveur${NC}"
    echo -e "${YELLOW}   Domaine pointe vers: $RESOLVED_IP${NC}"
    echo -e "${YELLOW}   Serveur IP: $SERVER_IP${NC}"
    echo ""
    echo "Veuillez configurer votre DNS avant de continuer."
    exit 1
fi

echo -e "${GREEN}✅ DNS correctement configuré${NC}"

# Backup du .env
cp .env .env.backup-$(date +%Y%m%d-%H%M%S)

# Modifier le domaine dans .env
sed -i "s/^APP_DOMAIN=.*/APP_DOMAIN=$NEW_DOMAIN/" .env
sed -i "s/^USE_SSL=.*/USE_SSL=true/" .env

echo -e "${GREEN}✅ Domaine configuré: $NEW_DOMAIN${NC}"
echo -e "${BLUE}🔄 Redémarrage des services...${NC}"

docker compose restart

echo ""
echo -e "${GREEN}✅ Configuration terminée!${NC}"
echo ""
echo -e "${GREEN}Votre application est maintenant accessible sur: https://$NEW_DOMAIN${NC}"
echo -e "${YELLOW}Note: Le certificat SSL peut prendre 1-2 minutes à être généré${NC}"
DOMAIN_SCRIPT

chmod +x configure-domain.sh

log_success "Script d'installation terminé!"
echo ""
echo -e "${GREEN}🎉 Nexpay est maintenant prêt à l'emploi!${NC}"
echo ""