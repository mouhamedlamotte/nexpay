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
#   Nexpay Update Script v2.0                                                 #
#                                                                              #
################################################################################

set -e
set -o pipefail

################################################################################
# CONFIGURATION
################################################################################

readonly INSTALL_DIR="/opt/nexpay"
readonly REPO_URL="https://github.com/mouhamedlamotte/nexpay.git"
readonly DATE=$(date +"%Y%m%d-%H%M%S")

################################################################################
# COULEURS & STYLES
################################################################################

readonly C_RESET='\033[0m'
readonly C_BOLD='\033[1m'
readonly C_DIM='\033[2m'

readonly C_PRIMARY='\033[38;5;39m'
readonly C_SUCCESS='\033[38;5;46m'
readonly C_WARNING='\033[38;5;214m'
readonly C_ERROR='\033[38;5;196m'
readonly C_INFO='\033[38;5;147m'
readonly C_MUTED='\033[38;5;245m'

readonly ICON_SUCCESS="✓"
readonly ICON_ERROR="✗"
readonly ICON_WARNING="⚠"
readonly ICON_INFO="ℹ"
readonly ICON_ROCKET="🚀"
readonly ICON_GEAR="⚙"

################################################################################
# FONCTIONS UTILITAIRES
################################################################################

log() {
    local level="$1"
    shift
    local message="$*"

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
            echo -e "${C_PRIMARY}${ICON_GEAR}${C_RESET}  ${C_BOLD}${message}${C_RESET}"
            ;;
    esac
}

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
    echo -e "${C_BOLD}                    MISE À JOUR${C_RESET}"
    echo ""
}

################################################################################
# FONCTIONS PRINCIPALES
################################################################################

check_prerequisites() {
    log STEP "Vérification des prérequis"

    # Vérifier root
    if [ $EUID != 0 ]; then
        log ERROR "Ce script nécessite les privilèges root"
        echo -e "${C_MUTED}Veuillez exécuter: ${C_BOLD}sudo $0${C_RESET}"
        exit 1
    fi
    log SUCCESS "Privilèges root confirmés"

    # Vérifier que Nexpay est installé
    if [ ! -d "$INSTALL_DIR" ]; then
        log ERROR "Nexpay n'est pas installé dans $INSTALL_DIR"
        exit 1
    fi
    log SUCCESS "Installation Nexpay détectée"

    # Vérifier Docker
    if ! command -v docker &> /dev/null; then
        log ERROR "Docker n'est pas installé"
        exit 1
    fi
    log SUCCESS "Docker disponible"

    # Vérifier docker compose
    if ! docker compose version &> /dev/null; then
        log ERROR "Docker Compose V2 requis"
        exit 1
    fi
    log SUCCESS "Docker Compose disponible"

    cd "$INSTALL_DIR"
}

backup_database() {
    log STEP "Sauvegarde de la base de données"

    mkdir -p backups

    local backup_file="backups/backup-${DATE}.sql"

    if docker compose -f docker-compose-prod.yml exec -T nexpay-db pg_dump -U nexpay nexpay > "$backup_file" 2>/dev/null; then
        local backup_size=$(du -h "$backup_file" | cut -f1)
        log SUCCESS "Backup créé: ${C_BOLD}$backup_file${C_RESET} (${backup_size})"
    else
        log WARNING "Backup impossible (base de données non accessible)"
        log INFO "Continuation sans backup..."
    fi
}

backup_config() {
    log STEP "Sauvegarde de la configuration"

    if [ -f .env ]; then
        cp .env ".env.backup-${DATE}"
        log SUCCESS "Configuration sauvegardée: ${C_BOLD}.env.backup-${DATE}${C_RESET}"
    else
        log WARNING "Aucun fichier .env trouvé"
    fi

    # Backup du fichier acme.json (certificats SSL)
    if [ -f config/traefik/letsencrypt/acme.json ]; then
        cp config/traefik/letsencrypt/acme.json "config/traefik/letsencrypt/acme.json.backup-${DATE}"
        log SUCCESS "Certificats SSL sauvegardés"
    fi
}

stop_services() {
    log STEP "Arrêt des services"

    if docker compose -f docker-compose-prod.yml down; then
        log SUCCESS "Services arrêtés"
    else
        log ERROR "Échec de l'arrêt des services"
        exit 1
    fi
}

download_updates() {
    log STEP "Téléchargement des mises à jour depuis GitHub"

    local temp_dir=$(mktemp -d)

    log INFO "Clonage du repository..."
    if git clone --depth 1 --branch main "$REPO_URL" "$temp_dir" 2>/dev/null; then
        log SUCCESS "Code source téléchargé"
    else
        log ERROR "Échec du téléchargement"
        rm -rf "$temp_dir"
        exit 1
    fi

    log INFO "Mise à jour des fichiers..."

    # Supprimer les anciens fichiers
    rm -rf api config web docker-compose.yml

    # Copier les nouveaux fichiers
    cp -r "$temp_dir/api" .
    cp -r "$temp_dir/config" .
    cp -r "$temp_dir/web" .
    cp "$temp_dir/docker-compose.yml" .

    # Nettoyer
    rm -rf "$temp_dir"

    log SUCCESS "Fichiers mis à jour"
}

restore_ssl_certificates() {
    log STEP "Restauration des certificats SSL"

    # Restaurer acme.json si disponible
    if [ -f "config/traefik/letsencrypt/acme.json.backup-${DATE}" ]; then
        cp "config/traefik/letsencrypt/acme.json.backup-${DATE}" config/traefik/letsencrypt/acme.json
        chmod 600 config/traefik/letsencrypt/acme.json
        log SUCCESS "Certificats SSL restaurés"
    else
        # Chercher le backup le plus récent
        local latest_backup=$(ls -t config/traefik/letsencrypt/acme.json.backup-* 2>/dev/null | head -1)
        if [ -n "$latest_backup" ]; then
            cp "$latest_backup" config/traefik/letsencrypt/acme.json
            chmod 600 config/traefik/letsencrypt/acme.json
            log SUCCESS "Certificats SSL restaurés depuis backup précédent"
        else
            touch config/traefik/letsencrypt/acme.json
            chmod 600 config/traefik/letsencrypt/acme.json
            log WARNING "Aucun certificat SSL trouvé - un nouveau sera généré"
        fi
    fi
}

rebuild_services() {
    log STEP "Reconstruction et démarrage des services"

    log INFO "Construction des images Docker..."
    if docker compose -f docker-compose-prod.yml build --no-cache 2>&1 | grep -v "^#" | grep -v "^$" | tail -5; then
        log SUCCESS "Images construites"
    else
        log ERROR "Échec de la construction"
        exit 1
    fi

    log INFO "Démarrage des services..."
    if docker compose -f docker-compose-prod.yml up -d; then
        log SUCCESS "Services démarrés"
    else
        log ERROR "Échec du démarrage"
        exit 1
    fi

    # Attendre que les services soient prêts
    log INFO "Initialisation des services..."
    sleep 10

    # Vérifier l'état
    local running=$(docker compose -f docker-compose-prod.yml ps --status running 2>/dev/null | grep -c "Up" || echo "0")
    if [ "$running" -ge 3 ]; then
        log SUCCESS "Tous les services sont opérationnels (${C_BOLD}$running${C_RESET} containers)"
    else
        log WARNING "Certains services n'ont pas démarré correctement"
    fi
}

health_check() {
    log STEP "Vérification de l'état de l'application"

    sleep 5

    if curl -f http://localhost:9000/api/v1/health > /dev/null 2>&1; then
        log SUCCESS "API opérationnelle"
    else
        log WARNING "API pas encore disponible (peut prendre 1-2 minutes)"
    fi
}

show_completion() {
    echo ""
    echo ""
    echo -e "${C_SUCCESS}${C_BOLD}"
    echo "    ═══════════════════════════════════════════════════════════"
    echo "     ✓ MISE À JOUR TERMINÉE AVEC SUCCÈS"
    echo "    ═══════════════════════════════════════════════════════════"
    echo -e "${C_RESET}"
    echo ""

    echo -e "${C_PRIMARY}📊 État des services:${C_RESET}"
    docker compose -f docker-compose-prod.yml ps
    echo ""

    echo -e "${C_INFO}${ICON_INFO} Commandes utiles:${C_RESET}"
    echo -e "   ${C_DIM}docker compose -f docker-compose-prod.yml logs -f${C_RESET}        # Voir les logs en temps réel"
    echo -e "   ${C_DIM}docker compose -f docker-compose-prod.yml restart${C_RESET}        # Redémarrer tous les services"
    echo -e "   ${C_DIM}docker compose -f docker-compose-prod.yml ps${C_RESET}             # Voir l'état des services"
    echo ""

    echo -e "${C_WARNING}${ICON_WARNING} Backups créés:${C_RESET}"
    echo -e "   ${C_DIM}Base de données: backups/backup-${DATE}.sql${C_RESET}"
    echo -e "   ${C_DIM}Configuration:   .env.backup-${DATE}${C_RESET}"
    echo ""

    local domain=$(grep "^APP_DOMAIN=" .env 2>/dev/null | cut -d'=' -f2)
    if [ -n "$domain" ]; then
        echo -e "${C_PRIMARY}${ICON_ROCKET} Accès:${C_RESET}"
        echo -e "   ${C_BOLD}https://$domain${C_RESET}"
        echo ""
    fi
}

show_rollback_info() {
    echo ""
    echo -e "${C_WARNING}${ICON_WARNING} En cas de problème:${C_RESET}"
    echo ""
    echo -e "${C_INFO}Pour revenir à la version précédente:${C_RESET}"
    echo -e "   ${C_DIM}cd $INSTALL_DIR${C_RESET}"
    echo -e "   ${C_DIM}docker compose -f docker-compose-prod.yml down${C_RESET}"
    echo -e "   ${C_DIM}cp .env.backup-${DATE} .env${C_RESET}"
    echo -e "   ${C_DIM}docker compose -f docker-compose-prod.yml up -d${C_RESET}"
    echo ""
}

################################################################################
# FONCTION PRINCIPALE
################################################################################

main() {
    show_banner

    check_prerequisites
    backup_database
    backup_config
    stop_services
    download_updates
    restore_ssl_certificates
    rebuild_services
    health_check
    show_completion
    show_rollback_info
}

################################################################################
# POINT D'ENTRÉE
################################################################################

main "$@"