cat > configure-domain.sh << 'DOMAIN_SCRIPT'
#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

if [ $EUID != 0 ]; then
    echo -e "${RED}❌ Veuillez exécuter ce script avec sudo${NC}"
    exit 1
fi

source .env

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🌐 Configuration du domaine          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Configuration actuelle:${NC}"
echo "  • Domaine: $APP_DOMAIN"
echo "  • SSL: $SSL_CONFIGURED"
echo ""

PS3="Choisissez une option: "
options=(
    "Configurer un nouveau domaine (avec SSL)"
    "Configurer un nouveau domaine (sans SSL)" 
    "Ajouter/Renouveler le SSL pour le domaine actuel"
    "Supprimer le SSL"
    "Quitter"
)

select opt in "${options[@]}"
do
    case $opt in
        "Configurer un nouveau domaine (avec SSL)")
            echo ""
            read -p "Entrez votre nom de domaine (ex: pay.example.com): " NEW_DOMAIN
            
            if [ -z "$NEW_DOMAIN" ]; then
                echo -e "${RED}❌ Domaine vide, annulation${NC}"
                exit 1
            fi
            
            if ! [[ "$NEW_DOMAIN" =~ ^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$ ]]; then
                echo -e "${RED}❌ Format de domaine invalide${NC}"
                exit 1
            fi
            
            echo ""
            read -p "Email pour Let's Encrypt (ex: admin@$NEW_DOMAIN): " LE_EMAIL
            
            if [ -z "$LE_EMAIL" ]; then
                LE_EMAIL="admin@$NEW_DOMAIN"
            fi
            
            echo ""
            echo -e "${YELLOW}⚠️  PRÉREQUIS:${NC}"
            echo "  1. Votre domaine $NEW_DOMAIN doit pointer vers ce serveur"
            echo "  2. Les ports 80 et 443 doivent être accessibles depuis Internet"
            echo ""
            read -p "Les prérequis sont-ils remplis ? (o/N): " CONFIRM
            
            if ! [[ "$CONFIRM" =~ ^[Oo]$ ]]; then
                echo -e "${RED}❌ Annulé${NC}"
                exit 1
            fi
            
            # Backup
            cp .env .env.backup-$(date +%Y%m%d-%H%M%S)
            
            # Arrêter les services
            echo -e "${BLUE}🛑 Arrêt des services Nexpay...${NC}"
            docker compose down
            
            # Installer certbot si nécessaire
            if ! command -v certbot &> /dev/null; then
                echo -e "${BLUE}📦 Installation de Certbot...${NC}"
                apt-get update -qq && apt-get install -y certbot >/dev/null 2>&1
            fi
            
            # Générer le certificat
            echo -e "${BLUE}🔒 Génération du certificat SSL...${NC}"
            
            if certbot certonly --standalone -d "$NEW_DOMAIN" --email "$LE_EMAIL" --agree-tos --non-interactive; then
                echo -e "${GREEN}✅ Certificat généré avec succès${NC}"
                
                # Créer le dossier des certificats
                mkdir -p config/traefik/certs
                
                # Copier les certificats
                cp /etc/letsencrypt/live/$NEW_DOMAIN/fullchain.pem config/traefik/certs/$NEW_DOMAIN.crt
                cp /etc/letsencrypt/live/$NEW_DOMAIN/privkey.pem config/traefik/certs/$NEW_DOMAIN.key
                chmod 644 config/traefik/certs/$NEW_DOMAIN.crt
                chmod 600 config/traefik/certs/$NEW_DOMAIN.key
                
                # Mettre à jour .env
                sed -i "s|^APP_DOMAIN=.*|APP_DOMAIN=$NEW_DOMAIN|" .env
                sed -i "s|^ADMIN_EMAIL=.*|ADMIN_EMAIL=$LE_EMAIL|" .env
                sed -i "s|^USE_SSL=.*|USE_SSL=true|" .env
                sed -i "s|^SSL_CONFIGURED=.*|SSL_CONFIGURED=true|" .env
                
                # Redémarrer les services
                echo -e "${BLUE}🔄 Redémarrage des services...${NC}"
                docker compose up -d
                
                echo ""
                echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
                echo -e "${GREEN}║   ✅ Configuration terminée !          ║${NC}"
                echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
                echo ""
                echo -e "${GREEN}🌐 Votre application est accessible sur:${NC}"
                echo "  • HTTPS: https://$NEW_DOMAIN:9091"
                echo "  • API:   https://$NEW_DOMAIN:9091/api/v1"
                echo ""
                echo -e "${YELLOW}📝 Note: Le certificat expire dans 90 jours${NC}"
                echo -e "${YELLOW}    Configurez un renouvellement automatique:${NC}"
                echo "    echo '0 0 1 * * certbot renew --post-hook \"cd /opt/nexpay && ./configure-domain.sh renew\"' | crontab -"
                echo ""
            else
                echo -e "${RED}❌ Échec de la génération du certificat${NC}"
                echo -e "${YELLOW}Vérifiez que:${NC}"
                echo "  1. Votre domaine pointe bien vers ce serveur"
                echo "  2. Les ports 80 et 443 sont accessibles"
                echo "  3. Aucun autre service n'utilise ces ports"
                exit 1
            fi
            break
            ;;
            
        "Configurer un nouveau domaine (sans SSL)")
            echo ""
            read -p "Entrez votre nom de domaine ou IP: " NEW_DOMAIN
            
            if [ -z "$NEW_DOMAIN" ]; then
                echo -e "${RED}❌ Domaine vide, annulation${NC}"
                exit 1
            fi
            
            # Backup
            cp .env .env.backup-$(date +%Y%m%d-%H%M%S)
            
            # Mettre à jour .env
            sed -i "s|^APP_DOMAIN=.*|APP_DOMAIN=$NEW_DOMAIN|" .env
            sed -i "s|^USE_SSL=.*|USE_SSL=false|" .env
            sed -i "s|^SSL_CONFIGURED=.*|SSL_CONFIGURED=false|" .env
            
            # Redémarrer les services
            echo -e "${BLUE}🔄 Redémarrage des services...${NC}"
            docker compose restart
            
            echo ""
            echo -e "${GREEN}✅ Domaine configuré: $NEW_DOMAIN${NC}"
            echo -e "${BLUE}🌐 Application accessible sur: http://$NEW_DOMAIN:9090${NC}"
            echo ""
            break
            ;;
            
        "Ajouter/Renouveler le SSL pour le domaine actuel")
            if [ -z "$APP_DOMAIN" ] || [ "$APP_DOMAIN" = "localhost" ]; then
                echo -e "${RED}❌ Domaine invalide: $APP_DOMAIN${NC}"
                exit 1
            fi
            
            echo ""
            read -p "Email pour Let's Encrypt (actuel: $ADMIN_EMAIL): " LE_EMAIL
            
            if [ -z "$LE_EMAIL" ]; then
                LE_EMAIL="$ADMIN_EMAIL"
            fi
            
            echo ""
            echo -e "${YELLOW}⚠️  Le domaine $APP_DOMAIN doit pointer vers ce serveur${NC}"
            read -p "Continuer ? (o/N): " CONFIRM
            
            if ! [[ "$CONFIRM" =~ ^[Oo]$ ]]; then
                exit 1
            fi
            
            # Arrêter les services
            docker compose down
            
            # Générer/Renouveler le certificat
            if certbot certonly --standalone -d "$APP_DOMAIN" --email "$LE_EMAIL" --agree-tos --non-interactive --force-renewal; then
                mkdir -p config/traefik/certs
                cp /etc/letsencrypt/live/$APP_DOMAIN/fullchain.pem config/traefik/certs/$APP_DOMAIN.crt
                cp /etc/letsencrypt/live/$APP_DOMAIN/privkey.pem config/traefik/certs/$APP_DOMAIN.key
                chmod 644 config/traefik/certs/$APP_DOMAIN.crt
                chmod 600 config/traefik/certs/$APP_DOMAIN.key
                
                sed -i "s|^USE_SSL=.*|USE_SSL=true|" .env
                sed -i "s|^SSL_CONFIGURED=.*|SSL_CONFIGURED=true|" .env
                sed -i "s|^ADMIN_EMAIL=.*|ADMIN_EMAIL=$LE_EMAIL|" .env
                
                docker compose up -d
                
                echo -e "${GREEN}✅ Certificat SSL configuré pour $APP_DOMAIN${NC}"
            else
                echo -e "${RED}❌ Échec de la configuration SSL${NC}"
                docker compose up -d
                exit 1
            fi
            break
            ;;
            
        "Supprimer le SSL")
            sed -i "s|^USE_SSL=.*|USE_SSL=false|" .env
            sed -i "s|^SSL_CONFIGURED=.*|SSL_CONFIGURED=false|" .env
            
            docker compose restart
            
            echo -e "${GREEN}✅ SSL désactivé${NC}"
            echo -e "${BLUE}🌐 Application accessible sur: http://$APP_DOMAIN:9090${NC}"
            break
            ;;
            
        "Quitter")
            break
            ;;
            
        *) 
            echo -e "${RED}Option invalide${NC}"
            ;;
    esac
done
DOMAIN_SCRIPT

chmod +x configure-domain.sh