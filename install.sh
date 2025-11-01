#!/bin/bash
################################################################################
#                                                                              #
#   ███╗   ██╗███████╗██╗  ██╗██████╗  █████╗ ██╗   ██╗                      #
#   ████╗  ██║██╔════╝╚██╗██╔╝██╔══██╗██╔══██╗╚██╗ ██╔╝                      #
#   ██╔██╗ ██║█████╗   ╚███╔╝ ██████╔╝███████║ ╚████╔╝                       #
#   ██║╚██╗██║██╔══╝   ██╔██╗ ██╔═══╝ ██╔══██║  ╚██╔╝                        #
#   ██║ ╚████║███████╗██╔╝ ██╗██║     ██║  ██║   ██║                         #
#   ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝   ╚═╝                         #
#                                                                              #
#   Nexpay Installation Script v2.0                                           #
#   Professional Self-Hosted Payment Gateway                                  #
#                                                                              #
################################################################################

set -e
set -o pipefail

################################################################################
# CONFIGURATION
################################################################################

readonly SCRIPT_VERSION="2.0.0"
readonly INSTALL_DIR="/opt/nexpay"
readonly REPO_URL="https://github.com/mouhamedlamotte/nexpay.git"
readonly MIN_DISK_SPACE=10
readonly DATE=$(date +"%Y%m%d-%H%M%S")
readonly LOG_FILE="$INSTALL_DIR/installation-${DATE}.log"

################################################################################
# COULEURS & STYLES
################################################################################

# Couleurs principales
readonly C_RESET='\033[0m'
readonly C_BOLD='\033[1m'
readonly C_DIM='\033[2m'

# Palette moderne
readonly C_PRIMARY='\033[38;5;39m'      # Bleu vif
readonly C_SUCCESS='\033[38;5;46m'      # Vert néon
readonly C_WARNING='\033[38;5;214m'     # Orange
readonly C_ERROR='\033[38;5;196m'       # Rouge vif
readonly C_INFO='\033[38;5;147m'        # Violet clair
readonly C_ACCENT='\033[38;5;51m'       # Cyan
readonly C_MUTED='\033[38;5;245m'       # Gris

# Icônes
readonly ICON_SUCCESS="✓"
readonly ICON_ERROR="✗"
readonly ICON_WARNING="⚠"
readonly ICON_INFO="ℹ"
readonly ICON_ROCKET="🚀"
readonly ICON_LOCK="🔒"
readonly ICON_GEAR="⚙"
readonly ICON_CHECK="✔"
readonly ICON_ARROW="→"

################################################################################
# FONCTIONS UTILITAIRES - AFFICHAGE
################################################################################

# Fonction pour centrer le texte
center_text() {
    local text="$1"
    local width=${2:-80}
    local padding=$(( (width - ${#text}) / 2 ))
    printf "%${padding}s%s%${padding}s\n" "" "$text" ""
}

# Ligne de séparation stylée
print_separator() {
    local char="${1:-─}"
    local width="${2:-80}"
    printf "${C_MUTED}%${width}s${C_RESET}\n" | tr ' ' "$char"
}

# Ligne double pour sections importantes
print_double_separator() {
    printf "${C_PRIMARY}%80s${C_RESET}\n" | tr ' ' '═'
}

# Box avec titre
print_box() {
    local title="$1"
    local color="${2:-$C_PRIMARY}"
    echo ""
    echo -e "${color}╔════════════════════════════════════════════════════════════════════════════╗${C_RESET}"
    echo -e "${color}║$(center_text "$title" 76)║${C_RESET}"
    echo -e "${color}╚════════════════════════════════════════════════════════════════════════════╝${C_RESET}"
    echo ""
}

################################################################################
# FONCTIONS UTILITAIRES - LOGGING
################################################################################

log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    case "$level" in
        INFO)
            echo -e "${C_INFO}${ICON_INFO}${C_RESET}  ${C_BOLD}${message}${C_RESET}"
            ;;
        SUCCESS)
            echo -e "${C_SUCCESS}${ICON_SUCCESS}${C_RESET}  ${message}"
            ;;
        WARNING)
            echo -e "${C_WARNING}${ICON_WARNING}${C_RESET}  ${C_BOLD}${message}${C_RESET}"
            ;;
        ERROR)
            echo -e "${C_ERROR}${ICON_ERROR}${C_RESET}  ${C_BOLD}${message}${C_RESET}"
            ;;
        STEP)
            echo ""
            echo -e "${C_ACCENT}${ICON_ARROW}${C_RESET}  ${C_BOLD}${C_PRIMARY}${message}${C_RESET}"
            print_separator "─" 80
            ;;
    esac

    # Log vers fichier
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE" 2>/dev/null || true
}

################################################################################
# FONCTIONS UTILITAIRES - PROGRESS
################################################################################

# Barre de progression
progress_bar() {
    local current=$1
    local total=$2
    local width=50
    local percentage=$((current * 100 / total))
    local filled=$((width * current / total))
    local empty=$((width - filled))

    printf "\r${C_PRIMARY}["
    printf "%${filled}s" | tr ' ' '█'
    printf "%${empty}s" | tr ' ' '░'
    printf "]${C_RESET} ${C_BOLD}%3d%%${C_RESET}" $percentage
}

# Spinner animé
spinner() {
    local pid=$1
    local message=$2
    local delay=0.1
    local spinstr='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'

    while ps -p $pid > /dev/null 2>&1; do
        local temp=${spinstr#?}
        printf "\r${C_ACCENT}%c${C_RESET}  ${C_DIM}%s...${C_RESET}" "$spinstr" "$message"
        spinstr=$temp${spinstr%"$temp"}
        sleep $delay
    done
    printf "\r${C_SUCCESS}${ICON_SUCCESS}${C_RESET}  %s\n" "$message"
}

# Exécution avec animation
execute_with_progress() {
    local message="$1"
    shift
    local command="$@"
    
    # Affichage initial (sans emojis compliqués)
    printf "${C_INFO}[⋯]${C_RESET} ${C_DIM}%s...${C_RESET}" "$message"
    
    if eval "$command" >> "$LOG_FILE" 2>&1; then
        # Succès - efface la ligne et réécrit
        printf "\r${C_SUCCESS}[${ICON_SUCCESS}]${C_RESET} %-70s\n" "$message"
        return 0
    else
        # Erreur - efface la ligne et réécrit
        printf "\r${C_ERROR}[${ICON_ERROR}]${C_RESET} %-70s\n" "$message"
        return 1
    fi
}

################################################################################
# FONCTIONS MÉTIER
################################################################################

# Affichage du banner
show_banner() {
    clear
    echo -e "${C_PRIMARY}"
    cat << "EOF"

    ███╗   ██╗███████╗██╗  ██╗██████╗  █████╗ ██╗   ██╗
    ████╗  ██║██╔════╝╚██╗██╔╝██╔══██╗██╔══██╗╚██╗ ██╔╝
    ██╔██╗ ██║█████╗   ╚███╔╝ ██████╔╝███████║ ╚████╔╝
    ██║╚██╗██║██╔══╝   ██╔██╗ ██╔═══╝ ██╔══██║  ╚██╔╝
    ██║ ╚████║███████╗██╔╝ ██╗██║     ██║  ██║   ██║
    ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝   ╚═╝

EOF
    echo -e "${C_RESET}"
    center_text "Professional Payment Gateway Installation" 80
    center_text "Version $SCRIPT_VERSION" 80
    echo ""
    print_double_separator
}

# Vérification des prérequis
check_prerequisites() {
    log STEP "Vérification des prérequis système"

    # Root
    if [ $EUID != 0 ]; then
        log ERROR "Ce script nécessite les privilèges root"
        echo -e "${C_MUTED}Veuillez exécuter: ${C_BOLD}sudo $0 $@${C_RESET}"
        exit 1
    fi
    log SUCCESS "Privilèges root confirmés"

    # Domaine
    if [ -z "$DOMAIN_ARG" ]; then
        log ERROR "Nom de domaine requis"
        echo ""
        echo -e "${C_WARNING}Usage:${C_RESET}"
        echo -e "  ${C_BOLD}curl -fsSL https://raw.githubusercontent.com/mouhamedlamotte/nexpay/main/install.sh | bash -s -- votre-domaine.com${C_RESET}"
        echo ""
        echo -e "${C_INFO}Exemple:${C_RESET}"
        echo -e "  ${C_DIM}curl -fsSL https://raw.githubusercontent.com/mouhamedlamotte/nexpay/main/install.sh | bash -s -- pay.example.com${C_RESET}"
        echo ""
        exit 1
    fi
    log SUCCESS "Domaine fourni: ${C_BOLD}$DOMAIN_ARG${C_RESET}"
}

# Détection du système
detect_system() {
    log STEP "Détection du système d'exploitation"

    if [ ! -f /etc/os-release ]; then
        log ERROR "Impossible de détecter le système d'exploitation"
        exit 1
    fi

    OS_TYPE=$(grep -w "ID" /etc/os-release | cut -d "=" -f 2 | tr -d '"')
    OS_VERSION=$(grep -w "VERSION_ID" /etc/os-release | cut -d "=" -f 2 | tr -d '"')

    case "$OS_TYPE" in
        ubuntu|debian|raspbian|centos|fedora|rhel|arch)
            log SUCCESS "Système supporté: ${C_BOLD}$OS_TYPE $OS_VERSION${C_RESET}"
            ;;
        *)
            log ERROR "Système non supporté: $OS_TYPE"
            exit 1
            ;;
    esac

    # Espace disque
    local available=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
    if [ "$available" -lt "$MIN_DISK_SPACE" ]; then
        log WARNING "Espace disque faible: ${available}GB (${MIN_DISK_SPACE}GB recommandé)"
    else
        log SUCCESS "Espace disque: ${C_BOLD}${available}GB disponible${C_RESET}"
    fi
}

# Installation des dépendances
install_dependencies() {
    log STEP "Installation des dépendances système"

    case "$OS_TYPE" in
        ubuntu|debian|raspbian)
            execute_with_progress "Mise à jour des paquets" "apt-get update -y"
            execute_with_progress "Installation des outils" \
                "apt-get install -y curl wget git jq openssl apache2-utils dnsutils"
            ;;
        centos|fedora|rhel)
            execute_with_progress "Installation des outils" \
                "dnf install -y curl wget git jq openssl httpd-tools bind-utils"
            ;;
        arch)
            execute_with_progress "Installation des outils" \
                "pacman -Sy --noconfirm curl wget git jq openssl apache-tools bind-tools"
            ;;
    esac

    log SUCCESS "Dépendances système installées"
}

# Vérification des ports
check_ports() {
    log STEP "Vérification des ports réseau"

    local ports_busy=0
    local traefik_running=false

    # Vérifier si le container Traefik de Nexpay tourne déjà
    if docker ps --filter "name=traefik" --filter "status=running" --format '{{.Names}}' 2>/dev/null | grep -q '^traefik$'; then
        traefik_running=true
        log INFO "Traefik de Nexpay déjà en cours d'exécution (réinstallation)"
    fi

    # Vérifier le port 80
    if lsof -Pi :80 -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ':80 '; then
        if [ "$traefik_running" = true ]; then
            log SUCCESS "Port 80 utilisé par Traefik Nexpay (OK pour réinstallation)"
        else
            local port80_process=$(lsof -Pi :80 -sTCP:LISTEN 2>/dev/null | grep LISTEN | awk '{print $1}' | head -1)
            log ERROR "Le port 80 est déjà utilisé par: ${C_BOLD}$port80_process${C_RESET}"
            lsof -Pi :80 -sTCP:LISTEN 2>/dev/null | grep LISTEN || netstat -tuln | grep ':80 '
            ports_busy=1
        fi
    else
        log SUCCESS "Port 80 disponible"
    fi

    # Vérifier le port 443
    if lsof -Pi :443 -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ':443 '; then
        if [ "$traefik_running" = true ]; then
            log SUCCESS "Port 443 utilisé par Traefik Nexpay (OK pour réinstallation)"
        else
            local port443_process=$(lsof -Pi :443 -sTCP:LISTEN 2>/dev/null | grep LISTEN | awk '{print $1}' | head -1)
            log ERROR "Le port 443 est déjà utilisé par: ${C_BOLD}$port443_process${C_RESET}"
            lsof -Pi :443 -sTCP:LISTEN 2>/dev/null | grep LISTEN || netstat -tuln | grep ':443 '
            ports_busy=1
        fi
    else
        log SUCCESS "Port 443 disponible"
    fi

    if [ $ports_busy -eq 1 ]; then
        echo ""
        log ERROR "Traefik nécessite les ports 80 et 443 libres"
        echo ""
        echo -e "${C_WARNING}Services à arrêter potentiellement:${C_RESET}"
        echo -e "  ${C_DIM}• Apache:  sudo systemctl stop apache2${C_RESET}"
        echo -e "  ${C_DIM}• Nginx:   sudo systemctl stop nginx${C_RESET}"
        echo -e "  ${C_DIM}• Autre:   sudo lsof -i :80 -i :443${C_RESET}"
        echo ""
        exit 1
    fi

    if [ "$traefik_running" = true ]; then
        log WARNING "Réinstallation détectée - Traefik sera redémarré"
    else
        log SUCCESS "Tous les ports requis sont disponibles"
    fi
}

# Installation de Docker
install_docker() {
    log STEP "Configuration de Docker"

    if command -v docker &> /dev/null; then
        local docker_version=$(docker --version | cut -d ' ' -f3 | cut -d ',' -f1)
        log SUCCESS "Docker déjà installé: ${C_BOLD}v$docker_version${C_RESET}"
    else
        log INFO "Installation de Docker en cours..."

        if curl -fsSL https://get.docker.com | sh >> "$LOG_FILE" 2>&1; then
            execute_with_progress "Activation de Docker" "systemctl enable docker"
            execute_with_progress "Démarrage de Docker" "systemctl start docker"
            log SUCCESS "Docker installé avec succès"
        else
            log ERROR "Échec de l'installation de Docker"
            exit 1
        fi
    fi

    # Docker Compose V2
    if docker compose version &> /dev/null; then
        local compose_version=$(docker compose version --short)
        log SUCCESS "Docker Compose: ${C_BOLD}v$compose_version${C_RESET}"
    else
        log ERROR "Docker Compose V2 requis mais non trouvé"
        exit 1
    fi
}

# Validation DNS
validate_dns() {
    log STEP "Validation de la configuration DNS"

    local domain=$1
    local server_ip=$(hostname -I | awk '{print $1}')

    if [ -z "$server_ip" ]; then
        log ERROR "Impossible de détecter l'adresse IP du serveur"
        exit 1
    fi

    log INFO "IP du serveur: ${C_BOLD}$server_ip${C_RESET}"
    log INFO "Vérification DNS pour: ${C_BOLD}$domain${C_RESET}"

    local resolved_ip=""
    if command -v dig &> /dev/null; then
        resolved_ip=$(dig +short "$domain" A | tail -n1)
    elif command -v nslookup &> /dev/null; then
        resolved_ip=$(nslookup "$domain" | grep -A1 "Name:" | grep "Address:" | awk '{print $2}' | tail -n1)
    else
        log ERROR "Impossible de vérifier le DNS (dig/nslookup manquant)"
        exit 1
    fi

    if [ -z "$resolved_ip" ]; then
        log ERROR "Le domaine $domain ne résout vers aucune IP"
        show_dns_help "$domain" "$server_ip"
        exit 1
    fi

    if [ "$resolved_ip" = "$server_ip" ]; then
        log SUCCESS "DNS correctement configuré: ${C_BOLD}$domain${C_RESET} → ${C_BOLD}$server_ip${C_RESET}"
    else
        log ERROR "Configuration DNS incorrecte"
        echo ""
        echo -e "${C_WARNING}Le domaine pointe vers: ${C_BOLD}$resolved_ip${C_RESET}"
        echo -e "${C_WARNING}Ce serveur a l'IP:      ${C_BOLD}$server_ip${C_RESET}"
        show_dns_help "$domain" "$server_ip"
        exit 1
    fi
}

# Aide configuration DNS
show_dns_help() {
    local domain=$1
    local server_ip=$2

    echo ""
    print_box "Configuration DNS requise" "$C_WARNING"

    echo -e "${C_INFO}Pour corriger la configuration DNS:${C_RESET}"
    echo ""
    echo -e "  ${C_BOLD}1.${C_RESET} Connectez-vous à votre registrar (OVH, Cloudflare, etc.)"
    echo -e "  ${C_BOLD}2.${C_RESET} Créez un enregistrement DNS de type ${C_BOLD}A${C_RESET}:"
    echo ""
    echo -e "     ${C_MUTED}Nom:${C_RESET}    $domain"
    echo -e "     ${C_MUTED}Type:${C_RESET}   A"
    echo -e "     ${C_MUTED}Valeur:${C_RESET} $server_ip"
    echo -e "     ${C_MUTED}TTL:${C_RESET}    300"
    echo ""
    echo -e "  ${C_BOLD}3.${C_RESET} Attendez la propagation DNS (5-30 minutes)"
    echo -e "  ${C_BOLD}4.${C_RESET} Vérifiez avec: ${C_DIM}dig +short $domain${C_RESET}"
    echo -e "  ${C_BOLD}5.${C_RESET} Relancez l'installation"
    echo ""
}

# Téléchargement du code
download_source() {
    log STEP "Téléchargement du code source"

    mkdir -p "$INSTALL_DIR"
    cd "$INSTALL_DIR"

    local temp_dir=$(mktemp -d)

    if git clone --depth 1 --branch main "$REPO_URL" "$temp_dir" >> "$LOG_FILE" 2>&1; then
        log SUCCESS "Repository cloné"

        execute_with_progress "Copie des fichiers" "cp -r $temp_dir/* $INSTALL_DIR/"
        execute_with_progress "Nettoyage" "rm -rf $temp_dir"
    else
        log ERROR "Échec du clonage du repository"
        exit 1
    fi
}

# Génération de la configuration
generate_config() {
    log STEP "Génération de la configuration"

    local app_name="Nexpay"
    local admin_email="admin@$DOMAIN_ARG"

    log INFO "Application: ${C_BOLD}$app_name${C_RESET}"
    log INFO "Email admin: ${C_BOLD}$admin_email${C_RESET}"

    # Génération des secrets
    log INFO "Génération des secrets cryptographiques..."

    local jwt_secret=$(openssl rand -base64 32)
    local db_password="postgres"
    local redis_password=$(openssl rand -base64 32)
    local encryption_key=$(openssl rand -hex 32)
    local admin_password=$(openssl rand -hex 16)
    local x_write_key=$(openssl rand -hex 32)
    local x_read_key=$(openssl rand -hex 32)
    local traefik_password="nexpay2024"
    local traefik_auth=$(echo $(htpasswd -nb admin "$traefik_password") | sed -e 's/\$/\$\$/g')

    log SUCCESS "Secrets générés avec succès"

    # Création du fichier .env
    cat > .env << EOF
# Nexpay Configuration - Generated $(date)
# DO NOT COMMIT THIS FILE

# Application
APP_NAME=$app_name
APP_DOMAIN=$DOMAIN_ARG
APP_VERSION=1.0.0
ADMIN_EMAIL=$admin_email
ADMIN_PASSWORD=$admin_password
NODE_ENV=production
USE_SSL=true

# Security
JWT_SECRET=$jwt_secret
ENCRYPTION_KEY=$encryption_key
X_WRITE_KEY=$x_write_key
X_READ_KEY=$x_read_key

# Database
DB_NAME=nexpay
DB_USER=nexpay
DB_PASSWORD=$db_password
DATABASE_URL=postgresql://nexpay:postgres@nexpay-db:5432/nexpay

# Redis
REDIS_PASSWORD=$redis_password

# Traefik
TRAEFIK_AUTH=$traefik_auth
EOF

    chmod 600 .env
    log SUCCESS "Fichier de configuration créé: ${C_BOLD}.env${C_RESET}"

    # Configuration SSL
    mkdir -p config/traefik/letsencrypt

    if [ -f config/traefik/letsencrypt/acme.json ] && [ -s config/traefik/letsencrypt/acme.json ]; then
        log INFO "Certificat SSL existant détecté"
        cp config/traefik/letsencrypt/acme.json config/traefik/letsencrypt/acme.json.backup-$DATE
    else
        touch config/traefik/letsencrypt/acme.json
        chmod 600 config/traefik/letsencrypt/acme.json
    fi

    log SUCCESS "Configuration SSL préparée (Let's Encrypt)"

    # Sauvegarde des credentials
    cat > "$INSTALL_DIR/credentials.txt" << EOF
═══════════════════════════════════════════════════════════════
 NEXPAY - CREDENTIALS (CONFIDENTIEL)
═══════════════════════════════════════════════════════════════

Domaine:        https://$DOMAIN_ARG

Admin:
  Email:        $admin_email
  Password:     $admin_password

API Keys:
  Write Key:    $x_write_key
  Read Key:     $x_read_key

Traefik Dashboard:
  URL:          https://$DOMAIN_ARG/dashboard/
  User:         admin
  Password:     $traefik_password

Database:
  User:         nexpay
  Password:     $db_password

═══════════════════════════════════════════════════════════════
 IMPORTANT: Sauvegardez ce fichier en lieu sûr puis supprimez-le
═══════════════════════════════════════════════════════════════
EOF

    chmod 600 "$INSTALL_DIR/credentials.txt"
    log SUCCESS "Credentials sauvegardés: ${C_BOLD}credentials.txt${C_RESET}"
}

# Démarrage des services
start_services() {
    log STEP "Démarrage des services Docker"

    cd "$INSTALL_DIR"

    log INFO "Téléchargement des images Docker..."
    docker compose pull >> "$LOG_FILE" 2>&1 &
    local pull_pid=$!
    spinner $pull_pid "Téléchargement des images"

    log INFO "Construction et démarrage des containers..."
    if docker compose up -d --build >> "$LOG_FILE" 2>&1; then
        log SUCCESS "Services démarrés"
    else
        log ERROR "Échec du démarrage des services"
        echo -e "${C_MUTED}Consultez les logs: docker compose logs${C_RESET}"
        exit 1
    fi

    # Attente du démarrage
    log INFO "Initialisation des services..."
    for i in {1..15}; do
        progress_bar $i 15
        sleep 1
    done
    echo ""

    # Vérification
    local running=$(docker compose ps --status running 2>/dev/null | grep -c "Up" || echo "0")
    if [ "$running" -ge 3 ]; then
        log SUCCESS "Tous les services sont opérationnels (${C_BOLD}$running${C_RESET} containers)"
    else
        log WARNING "Certains services n'ont pas démarré correctement"
        docker compose ps
    fi
}

# Test de santé
health_check() {
    log STEP "Test de santé de l'application"

    sleep 5

    if curl -f http://localhost:9000/api/v1/health > /dev/null 2>&1; then
        log SUCCESS "API opérationnelle"
    else
        log WARNING "API pas encore disponible (peut prendre 1-2 minutes)"
    fi
}

# Affichage final
show_completion() {
    echo ""
    print_double_separator
    echo ""
    echo -e "${C_SUCCESS}${C_BOLD}"
    center_text "✓ INSTALLATION TERMINÉE AVEC SUCCÈS" 80
    echo -e "${C_RESET}"
    print_double_separator
    echo ""

    echo -e "${C_PRIMARY}${ICON_ROCKET} URLs d'accès:${C_RESET}"
    echo -e "   ${C_MUTED}API:${C_RESET}     ${C_BOLD}https://$DOMAIN_ARG/api/v1${C_RESET}"
    echo -e "   ${C_MUTED}WEB:${C_RESET}     ${C_BOLD}https://$DOMAIN_ARG${C_RESET}"
    echo ""

    echo -e "${C_PRIMARY}${ICON_LOCK} Identifiants:${C_RESET}"
    echo -e "   ${C_MUTED}Voir le fichier:${C_RESET} ${C_BOLD}$INSTALL_DIR/credentials.txt${C_RESET}"
    echo ""

    echo -e "${C_WARNING}${ICON_WARNING} Sécurité:${C_RESET}"
    echo -e "   ${C_MUTED}1.${C_RESET} Sauvegardez ${C_BOLD}credentials.txt${C_RESET} en lieu sûr"
    echo -e "   ${C_MUTED}2.${C_RESET} Changez le mot de passe admin immédiatement"
    echo -e "   ${C_MUTED}3.${C_RESET} Le certificat SSL sera généré automatiquement (1-2 min)"
    echo ""

    echo -e "${C_INFO}${ICON_INFO} Commandes utiles:${C_RESET}"
    echo -e "   ${C_DIM}cd $INSTALL_DIR${C_RESET}"
    echo -e "   ${C_DIM}docker compose logs -f${C_RESET}        # Voir les logs"
    echo -e "   ${C_DIM}docker compose restart${C_RESET}        # Redémarrer"
    echo -e "   ${C_DIM}docker compose ps${C_RESET}             # Status des services"
    echo -e "   ${C_DIM}./update.sh${C_RESET}                   # Mettre à jour"
    echo ""

    print_separator
    echo -e "${C_MUTED}Documentation: https://nexpay.thenexcom.com${C_RESET}"
    echo -e "${C_MUTED}Support:       https://github.com/mouhamedlamotte/nexpay/issues${C_RESET}"
    print_separator
    echo ""
}

# Création des scripts utilitaires
create_utility_scripts() {
    log STEP "Création des scripts utilitaires"

    # Script de mise à jour
    cat > "$INSTALL_DIR/update.sh" << 'UPDATE_SCRIPT'
#!/bin/bash
set -e

C_INFO='\033[38;5;147m'
C_SUCCESS='\033[38;5;46m'
C_RESET='\033[0m'

echo -e "${C_INFO}🔄 Mise à jour de Nexpay...${C_RESET}"

echo "📦 Création d'un backup..."
docker compose exec -T postgres_nexpay pg_dump -U nexpay nexpay > "backups/backup-$(date +%Y%m%d-%H%M%S).sql"

echo "⬇️  Téléchargement des mises à jour..."
docker compose pull

echo "🔨 Reconstruction..."
docker compose up -d --build

echo -e "${C_SUCCESS}✓ Mise à jour terminée${C_RESET}"
docker compose ps
UPDATE_SCRIPT

    chmod +x "$INSTALL_DIR/update.sh"
    log SUCCESS "Script de mise à jour créé"

    # Script de configuration du domaine
    cat > "$INSTALL_DIR/configure-domain.sh" << 'DOMAIN_SCRIPT'
#!/bin/bash
set -e

C_PRIMARY='\033[38;5;39m'
C_SUCCESS='\033[38;5;46m'
C_ERROR='\033[38;5;196m'
C_RESET='\033[0m'

echo -e "${C_PRIMARY}🌐 Configuration du domaine personnalisé${C_RESET}"
echo ""

read -p "Nom de domaine (ex: pay.example.com): " NEW_DOMAIN

if [ -z "$NEW_DOMAIN" ]; then
    echo -e "${C_ERROR}❌ Domaine requis${C_RESET}"
    exit 1
fi

SERVER_IP=$(hostname -I | awk '{print $1}')
RESOLVED_IP=$(dig +short "$NEW_DOMAIN" A | tail -n1)

if [ "$RESOLVED_IP" != "$SERVER_IP" ]; then
    echo -e "${C_ERROR}❌ DNS incorrect${C_RESET}"
    echo "Le domaine pointe vers: $RESOLVED_IP"
    echo "Serveur IP: $SERVER_IP"
    exit 1
fi

cp .env .env.backup-$(date +%Y%m%d-%H%M%S)
sed -i "s/^APP_DOMAIN=.*/APP_DOMAIN=$NEW_DOMAIN/" .env

docker compose restart

echo -e "${C_SUCCESS}✓ Domaine configuré: https://$NEW_DOMAIN${C_RESET}"
DOMAIN_SCRIPT

    chmod +x "$INSTALL_DIR/configure-domain.sh"
    log SUCCESS "Script de configuration créé"
}

################################################################################
# FONCTION PRINCIPALE
################################################################################

main() {
    # Arguments
    DOMAIN_ARG="$1"

    # Banner
    show_banner

    # Initialisation du logging
    mkdir -p "$INSTALL_DIR" 2>/dev/null || true
    exec > >(tee -a "$LOG_FILE") 2>&1

    # Étapes d'installation
    check_prerequisites
    detect_system
    install_dependencies
    install_docker
    # check_ports
    validate_dns "$DOMAIN_ARG"
    download_source
    generate_config
    create_utility_scripts
    start_services
    health_check
    show_completion

    log SUCCESS "Installation complétée - Log: ${C_BOLD}$LOG_FILE${C_RESET}"
}

################################################################################
# POINT D'ENTRÉE
################################################################################

main "$@"