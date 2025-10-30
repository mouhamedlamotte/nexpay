#!/bin/bash
## Nexpay Installation Script
## Usage: curl -fsSL https://raw.githubusercontent.com/mouhamedlamotte/nexpay/main/install.sh | bash

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
        apt-get install -y curl wget git jq openssl apache2-utils >/dev/null 2>&1
        ;;
    centos|fedora|rhel)
        dnf install -y curl wget git jq openssl httpd-tools >/dev/null 2>&1
        ;;
    arch)
        pacman -Sy --noconfirm curl wget git jq openssl apache-tools >/dev/null 2>&1
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

# 5. Création de la structure des dossiers
log_info "Création de la structure..."
mkdir -p $INSTALL_DIR/{config/traefik/dynamic,database,api,logs,backups}
cd $INSTALL_DIR

# 6. Clonage du repository
log_info "Téléchargement de Nexpay depuis GitHub..."

REPO_URL="https://github.com/mouhamedlamotte/nexpay.git"
TEMP_DIR=$(mktemp -d)

# Clone dans un dossier temporaire
git clone --depth 1 --branch main "$REPO_URL" "$TEMP_DIR" 2>&1 | grep -v "Cloning"

# Copier les fichiers nécessaires
cp -r "$TEMP_DIR"/* $INSTALL_DIR/
rm -rf "$TEMP_DIR"

log_success "Code source téléchargé"

# 7. Configuration interactive
echo ""
log_info "Configuration de Nexpay"
echo ""

# Domaine
read -p "$(echo -e ${BLUE})🌐 Nom de domaine (ex: pay.example.com): $(echo -e ${NC})" APP_DOMAIN
while [[ ! "$APP_DOMAIN" =~ ^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$ ]]; do
    log_warn "Domaine invalide"
    read -p "$(echo -e ${BLUE})🌐 Nom de domaine: $(echo -e ${NC})" APP_DOMAIN
done

# Email admin
read -p "$(echo -e ${BLUE})📧 Email admin (pour SSL): $(echo -e ${NC})" ADMIN_EMAIL
while [[ ! "$ADMIN_EMAIL" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; do
    log_warn "Email invalide"
    read -p "$(echo -e ${BLUE})📧 Email admin: $(echo -e ${NC})" ADMIN_EMAIL
done

# Nom de l'app
read -p "$(echo -e ${BLUE})💳 Nom de l'application [Nexpay]: $(echo -e ${NC})" APP_NAME
APP_NAME=${APP_NAME:-Nexpay}

# Mot de passe Traefik
read -s -p "$(echo -e ${BLUE})🔐 Mot de passe Traefik dashboard: $(echo -e ${NC})" TRAEFIK_PASSWORD
echo ""
while [ ${#TRAEFIK_PASSWORD} -lt 8 ]; do
    log_warn "Mot de passe trop court (min 8 caractères)"
    read -s -p "$(echo -e ${BLUE})🔐 Mot de passe Traefik: $(echo -e ${NC})" TRAEFIK_PASSWORD
    echo ""
done

# 8. Génération des secrets
log_info "Génération des secrets de sécurité..."

JWT_SECRET=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
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

# Ports (you can change these)
HTTP_PORT=80
HTTPS_PORT=443
TRAEFIK_DASHBOARD_PORT=8080
EOF

log_success "Fichier .env créé"

# 10. Configuration de Traefik pour SSL
touch config/traefik/acme.json
chmod 600 config/traefik/acme.json

# 11. Démarrage des containers
log_info "Démarrage de Nexpay..."
docker compose pull
docker compose up -d --build

# 12. Attente du démarrage
log_info "Attente du démarrage des services..."
sleep 10

# Vérifier que les containers tournent
if [ $(docker compose ps | grep -c "Up") -ge 3 ]; then
    log_success "Tous les services sont démarrés"
else
    log_warn "Certains services ont des problèmes"
    docker compose ps
fi

# 13. Test de santé
log_info "Test de connectivité..."
sleep 5

if curl -f http://localhost:9090/api/v1/health > /dev/null 2>&1; then
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
echo "   • Dashboard Admin:  https://$APP_DOMAIN/admin"
echo "   • API:              https://$APP_DOMAIN/api/v1"
echo "   • Checkout:         https://$APP_DOMAIN/checkout"
echo "   • Traefik Dashboard: https://$APP_DOMAIN:8080"
echo ""
echo -e "${GREEN}🔑 Identifiants Traefik:${NC}"
echo "   • Utilisateur: admin"
echo "   • Mot de passe: [celui que vous avez choisi]"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT - Sauvegardez ces fichiers:${NC}"
echo "   • $INSTALL_DIR/.env"
echo "   • $INSTALL_DIR/config/traefik/acme.json"
echo ""
echo -e "${BLUE}📚 Commandes utiles:${NC}"
echo "   • Voir les logs:     cd $INSTALL_DIR && docker compose logs -f"
echo "   • Redémarrer:        cd $INSTALL_DIR && docker compose restart"
echo "   • Arrêter:           cd $INSTALL_DIR && docker compose down"
echo "   • Mettre à jour:     cd $INSTALL_DIR && ./upgrade.sh"
echo ""
echo -e "${BLUE}📖 Documentation:${NC} https://docs.nexpay.com"
echo -e "${BLUE}💬 Support:${NC} https://github.com/mouhamedlamotte/nexpay/issues"
echo ""

# 15. Créer un script de mise à jour
cat > upgrade.sh << 'UPGRADE_SCRIPT'
#!/bin/bash
set -e

echo "🔄 Mise à jour de Nexpay..."

# Backup
docker compose exec postgres pg_dump -U nexpay nexpay > "backup-$(date +%Y%m%d-%H%M%S).sql"

# Pull & restart
docker compose -f docker-compose-prod.yml pull
docker compose up -f docker-compose-prod.yml -d --build

echo "✅ Mise à jour terminée"
UPGRADE_SCRIPT

chmod +x upgrade.sh

log_success "Script d'installation terminé!"
echo ""
echo -e "${GREEN}🎉 Nexpay est maintenant prêt à l'emploi!${NC}"
echo ""