#!/bin/bash
## Nexpay Installation Script
## Usage: curl -fsSL https://raw.githubusercontent.com/mouhamedlamotte/nexpay/main/install.sh | bash -s -- pay.yourdomain.com

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
╔════════════════════════════════════════╗
EOF
echo -e "${NC}"

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

# 6. Vérification du domaine ou configuration par défaut
if [ -n "$DOMAIN_ARG" ]; then
    log_info "Domaine fourni: $DOMAIN_ARG"
    
    # Vérifier que le domaine pointe vers ce serveur
    if ! check_domain_dns "$DOMAIN_ARG" "$DETECTED_IP"; then
        log_error "Installation annulée: Le domaine ne pointe pas vers ce serveur"
        exit 1
    fi
    
    APP_DOMAIN="$DOMAIN_ARG"
    USE_SSL=true
    log_success "Domaine validé: $APP_DOMAIN (SSL sera configuré)"
else
    log_warn "Aucun domaine fourni, utilisation de l'IP du serveur"
    echo ""
    echo -e "${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  ⚠️  INSTALLATION SANS DOMAINE                            ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}Vous installez Nexpay sans domaine personnalisé.${NC}"
    echo -e "${BLUE}L'application sera accessible via: http://$DETECTED_IP${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Limitations sans domaine:${NC}"
    echo "   • Pas de certificat SSL (pas de HTTPS)"
    echo "   • Webhooks de paiement non fonctionnels"
    echo "   • Non recommandé pour la production"
    echo ""
    echo -e "${GREEN}💡 Pour une installation avec domaine:${NC}"
    echo "   curl -fsSL https://raw.githubusercontent.com/mouhamedlamotte/nexpay/main/install.sh | bash -s -- votre-domaine.com"
    echo ""
    read -p "Continuer sans domaine? (oui/non): " CONFIRM
    
    if [ "$CONFIRM" != "oui" ] && [ "$CONFIRM" != "yes" ] && [ "$CONFIRM" != "o" ] && [ "$CONFIRM" != "y" ]; then
        log_info "Installation annulée par l'utilisateur"
        exit 0
    fi
    
    APP_DOMAIN="$DETECTED_IP"
    USE_SSL=false
    log_info "Configuration avec IP: $APP_DOMAIN (sans SSL)"
fi


# 5. Création de la structure des dossiers
log_info "Création de la structure..."
mkdir -p $INSTALL_DIR/{config/traefik/dynamic,database,api,web,logs,backups}
cd $INSTALL_DIR

# 6. Clonage du repository
log_info "Téléchargement de Nexpay depuis GitHub..."

REPO_URL="https://github.com/mouhamedlamotte/nexpay.git"
TEMP_DIR=$(mktemp -d)

# Clone dans un dossier temporaire
git clone --depth 1 --branch main "$REPO_URL" "$TEMP_DIR"

# Copier les fichiers nécessaires
cp -r "$TEMP_DIR"/* $INSTALL_DIR/
rm -rf "$TEMP_DIR"

log_success "Code source téléchargé"

# 7. Configuration automatique
echo ""
log_info "Configuration automatique de Nexpay"
echo ""

# Email admin
ADMIN_EMAIL="admin@nexpay.com"

log_info "Email admin: $ADMIN_EMAIL (par défaut)"

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

# 8. Génération des secrets
log_info "Génération des secrets de sécurité..."

JWT_SECRET=$(openssl rand -base64 32)
DB_PASSWORD=portgres
REDIS_PASSWORD=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
ADMIN_PASSWORD=$(openssl rand -hex 32)
TRAEFIK_AUTH=$(echo $(htpasswd -nb admin "$TRAEFIK_PASSWORD") | sed -e 's/\$/\$\$/g')

log_success "Secrets générés"



# 9. Création du fichier .env
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


# Security
JWT_SECRET=$JWT_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY

# Database
DB_NAME=nexpay
DB_USER=nexpay
DB_PASSWORD=$DB_PASSWORD

# Redis
REDIS_PASSWORD=$REDIS_PASSWORD

# Traefik
TRAEFIK_AUTH=$TRAEFIK_AUTH
EOF

log_success "Fichier .env créé"

# 10. Configuration de Traefik pour SSL
mkdir -p config/traefik/letsencrypt
touch config/traefik/letsencrypt/acme.json
chmod 600 config/traefik/letsencrypt/acme.json

# 11. Démarrage des containers
log_info "Démarrage de Nexpay..."
docker compose pull 2>&1 | grep -v "Pulling" || true
docker compose up -d --build

# 12. Attente du démarrage
log_info "Attente du démarrage des services..."
sleep 15

# Vérifier que les containers tournent
RUNNING_CONTAINERS=$(docker compose ps 2>/dev/null | grep -c "Up" || echo "0")
if [ "$RUNNING_CONTAINERS" -ge 3 ]; then
    log_success "Tous les services sont démarrés ($RUNNING_CONTAINERS containers actifs)"
else
    log_warn "Certains services ont des problèmes"
    docker compose ps
fi

# 13. Test de santé
log_info "Test de connectivité..."
sleep 5

if curl -f http://localhost:9000/api/v1/health > /dev/null 2>&1; then
    log_success "API répond correctement"
else
    log_warn "API ne répond pas encore (peut prendre 1-2 minutes)"
fi

# 14. Affichage des informations finales
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
echo "   • API:   http://$APP_DOMAIN/api/v1"
echo "   • WEB:  http://$APP_DOMAIN"

echo -e "${GREEN}🔑 Identifiants par défaut:${NC}"
echo "   • Traefik utilisateur: admin"
echo "   • Traefik mot de passe: $TRAEFIK_PASSWORD"
echo ""
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT:${NC}"
echo "   1. Sauvegardez le fichier: $INSTALL_DIR/.env"
echo "   2. Pour configurer un domaine personnalisé:"
echo "      - Éditez le fichier: nano $INSTALL_DIR/.env"
echo "      - Modifiez la variable APP_DOMAIN"
echo "      - Redémarrez: cd $INSTALL_DIR && docker compose restart"
echo "   3. Changez le mot de passe Traefik par défaut !"
echo ""
echo -e "${BLUE}📚 Commandes utiles:${NC}"
echo "   • Voir les logs:     cd $INSTALL_DIR && docker compose logs -f"
echo "   • Redémarrer:        cd $INSTALL_DIR && docker compose restart"
echo "   • Arrêter:           cd $INSTALL_DIR && docker compose down"
echo "   • Voir les services: cd $INSTALL_DIR && docker compose ps"
echo "   • Mettre à jour:     cd $INSTALL_DIR && ./update.sh"
echo ""
echo -e "${BLUE}📝 Configuration du domaine:${NC}"
echo "   Pour ajouter un domaine personnalisé plus tard:"
echo "   1. cd $INSTALL_DIR"
echo "   2. nano .env"
echo "   3. Modifier APP_DOMAIN=votre-domaine.com"
echo "   4. docker compose restart"
echo ""
echo -e "${BLUE}📖 Documentation:${NC} https://nexpay.thenexcom.com"
echo -e "${BLUE}💬 Support:${NC} https://github.com/mouhamedlamotte/nexpay/issues"
echo ""

# 15. Créer un script de mise à jour
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

# 16. Créer un script de configuration du domaine
cat > configure-domain.sh << 'DOMAIN_SCRIPT'
#!/bin/bash
set -e

echo "🌐 Configuration du domaine personnalisé"
echo ""

read -p "Entrez votre nom de domaine (ex: pay.example.com): " NEW_DOMAIN

if [ -z "$NEW_DOMAIN" ]; then
    echo "❌ Domaine vide, annulation"
    exit 1
fi

# Backup du .env
cp .env .env.backup-$(date +%Y%m%d-%H%M%S)

# Modifier le domaine dans .env
sed -i "s/^APP_DOMAIN=.*/APP_DOMAIN=$NEW_DOMAIN/" .env

echo "✅ Domaine configuré: $NEW_DOMAIN"
echo "🔄 Redémarrage des services..."

docker compose restart

echo "✅ Configuration terminée!"
echo ""
echo "Votre application est maintenant accessible sur: http://$NEW_DOMAIN"
DOMAIN_SCRIPT

chmod +x configure-domain.sh

log_success "Script d'installation terminé!"
echo ""
echo -e "${GREEN}🎉 Nexpay est maintenant prêt à l'emploi!${NC}"
echo -e "${YELLOW} MOT DE PASSE ADMIN : $ADMIN_PASSWORD , changez-le !${NC}"
echo -e "${BLUE}💡 Conseil: Exécutez ./configure-domain.sh pour configurer un domaine personnalisé${NC}"
echo ""