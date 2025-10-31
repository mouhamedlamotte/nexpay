# NexPay - Plateforme de Paiement Mobile

NexPay est une solution de paiement mobile auto-hébergée qui permet d'accepter des paiements via Wave, Orange Money et d'autres fournisseurs de paiement mobile populaires en Afrique.

## Fonctionnalités

- 🚀 **Auto-hébergé** - Contrôle total de votre infrastructure de paiement
- 💳 **Multi-providers** - Support de Wave, Orange Money et autres
- 🔐 **Sécurisé** - Authentification API, webhooks sécurisés, vérification des signatures
- 📊 **Dashboard complet** - Gestion des transactions, statistiques en temps réel
- 🔔 **Webhooks** - Notifications en temps réel des événements de paiement
- 🎯 **Multi-projets** - Gérez plusieurs projets avec une seule instance
- 🌐 **API REST** - Intégration facile avec votre application

## Prérequis

- Un serveur Linux (Ubuntu 20.04+ recommandé)
- Docker et Docker Compose installés
- Un nom de domaine pointant vers votre serveur
- Accès root ou sudo sur le serveur

## Installation

L'installation de NexPay est simple et automatisée grâce à notre script d'installation. Traefik est déjà configuré pour gérer automatiquement les certificats SSL et le reverse proxy.

### Installation en une commande

\`\`\`bash
curl -fsSL https://raw.githubusercontent.com/mouhamedlamotte/nexpay/main/install.sh | bash -s -- pay.yourdomain.com
\`\`\`

Remplacez `pay.yourdomain.com` par votre propre domaine.

### Ce que fait le script d'installation

1. Vérifie les prérequis (Docker, Docker Compose)
2. Clone le repository NexPay
3. Configure les variables d'environnement
4. Configure Traefik pour le reverse proxy et SSL
5. Démarre tous les services Docker
6. Affiche les informations de connexion

### Après l'installation

Une fois l'installation terminée, vous pouvez accéder à votre instance NexPay à l'adresse :

\`\`\`
https://pay.yourdomain.com
\`\`\`

## Configuration

### Variables d'environnement

Le script d'installation crée automatiquement un fichier `.env` avec les variables nécessaires. Vous pouvez les modifier selon vos besoins :

\`\`\`env
# Base de données
DATABASE_URL=postgresql://user:password@postgres:5432/nexpay

# JWT Secret
JWT_SECRET=your-secret-key

# URL de l'application
APP_URL=https://pay.yourdomain.com

# Configuration email (optionnel)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
\`\`\`

### Configuration des providers

1. Connectez-vous au dashboard NexPay
2. Accédez à la section **Providers**
3. Cliquez sur **Configure** pour chaque provider

![Configuration des providers](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20from%202025-10-31%2011-02-57-fibOOuVN9k9HWdaHELCmMQgGyBhrG5.png)

#### Exemple : Configuration Wave

- **Api Key** : Votre clé API Wave obtenue depuis le portail développeur Wave

#### Exemple : Configuration Orange Money

- **Client Id** : Votre identifiant client Orange Money
- **Client Secret** : Votre secret client Orange Money
- **Name** : Nom d'affichage du provider
- **Code** : Code unique du provider (ex: `om`)

### Configuration des webhooks providers

Pour recevoir les notifications de paiement des providers, vous devez configurer les webhooks chez chaque provider :

**URL du webhook à configurer chez le provider :**
\`\`\`
https://pay.yourdomain.com/api/v1/webhook/<provider>
\`\`\`

Exemples :
- Wave : `https://pay.yourdomain.com/api/v1/webhook/wave`
- Orange Money : `https://pay.yourdomain.com/api/v1/webhook/om`

### Configuration des webhooks NexPay

Pour recevoir les notifications de NexPay dans votre application, configurez un webhook dans le dashboard :

![Configuration des webhooks](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20from%202025-10-30%2018-00-08-gSa3QGljAge6ACctwIdBilhtUkf2KY.png)

1. Accédez à **Paramètres du compte** > **Webhooks**
2. Cliquez sur **Nouveau webhook**
3. Renseignez :
   - **Webhook URL** : L'URL de votre application qui recevra les événements
   - **Header Name** : Nom du header pour la vérification (ex: `x-webhook-secret`)
   - **Secret** : Clé secrète pour vérifier l'authenticité des webhooks

### Configuration des URLs de redirection

Configurez les URLs de redirection après paiement :

![Configuration des redirections](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20from%202025-10-30%2017-59-59-6dJGPwAF7wunaYbxz6bAI54JPv8Djs.png)

- **Success URL** : Redirection après paiement réussi
- **Failure URL** : Redirection après échec de paiement
- **Cancel URL** : Redirection si l'utilisateur annule

## Utilisation du Dashboard

### Vue d'ensemble

Le dashboard vous donne un aperçu complet de votre activité :

![Dashboard NexPay](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20from%202025-10-31%2011-02-48-RpXkQDVhGpKTHwyiEFoJoMwl0FVZXP.png)

- **Volume Total** : Montant total des transactions
- **Transactions** : Nombre de transactions
- **Taux de Réussite** : Pourcentage de transactions réussies
- **Performance par Provider** : Répartition par fournisseur
- **Statistiques Rapides** : Montant moyen, nouveaux clients
- **Transactions récentes** : Liste des dernières transactions

### Processus de paiement

#### 1. Sélection du mode de paiement

![Sélection du mode de paiement](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20from%202025-10-31%2011-04-25-SPUwIQNtpnpPWQlRphnm7YZN3bcyjO.png)

Le client choisit son mode de paiement préféré (Wave, Orange Money, etc.)

#### 2. Paiement via QR Code ou lien direct

![Paiement Wave](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20from%202025-10-31%2011-04-32-bVC98TKMEgo9wkEsxiCVwgrZ8xfbLB.png)

Le client peut :
- Scanner le QR code avec son application de paiement
- Cliquer sur le lien direct pour ouvrir l'application
- Voir la référence de paiement et la date d'expiration

## Utilisation de l'API

### Authentification

Toutes les requêtes API nécessitent une clé API dans le header :

\`\`\`bash
Authorization: Bearer YOUR_API_KEY
\`\`\`

### Initier un paiement

\`\`\`bash
POST /api/v1/payment/initiate
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "amount": 10000,
  "currency": "XOF",
  "customer": {
    "name": "Mouhamed Baba",
    "email": "customer@example.com",
    "phone": "+221771234567"
  },
  "metadata": {
    "order_id": "ORDER-123",
    "custom_field": "value"
  }
}
\`\`\`

### Créer une session de paiement

\`\`\`bash
POST /api/v1/payment/session/initiate
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "amount": 10000,
  "currency": "XOF",
  "customer": {
    "name": "Mouhamed Baba",
    "email": "customer@example.com",
    "phone": "+221771234567"
  },
  "success_url": "https://yourapp.com/success",
  "cancel_url": "https://yourapp.com/cancel"
}
\`\`\`

### Vérifier le statut d'une session

\`\`\`bash
GET /api/v1/payment/session/{sessionId}
Authorization: Bearer YOUR_API_KEY
\`\`\`

## Webhooks

### Structure d'un événement webhook

\`\`\`json
{
  "type": "payment.succeeded",
  "data": {
    "amount": "100800",
    "client_reference": "nexpay-ref-30-10-2025",
    "status": "SUCCEEDED",
    "resolvedAt": "2025-10-30T17:29:58.109Z",
    "payer": {
      "name": "Mouhamed baba",
      "email": "lamottejmohamed@gmail.com",
      "phone": "+22177123456"
    },
    "provider": {
      "name": "Wave",
      "code": "wave"
    },
    "project": {
      "id": "proj_123",
      "name": "the nexcom"
    },
    "metadata": {
      "order_id": "ORDER-123"
    }
  }
}
\`\`\`

### Types d'événements

- `payment.succeeded` : Paiement réussi
- `payment.failed` : Paiement échoué
- `payment.pending` : Paiement en attente
- `payment.cancelled` : Paiement annulé

### Vérification de la signature

Vérifiez toujours la signature des webhooks pour garantir leur authenticité :

\`\`\`javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return signature === expectedSignature;
}

// Dans votre endpoint webhook
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-secret'];
  const isValid = verifyWebhookSignature(req.body, signature, YOUR_SECRET);
  
  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }
  
  // Traiter l'événement
  const event = req.body;
  console.log('Event received:', event.type);
  
  res.status(200).send('OK');
});
\`\`\`

## Gestion multi-projets

NexPay permet de gérer plusieurs projets avec une seule instance :

- **Configuration unique des providers** : Les providers (Wave, Orange Money) sont configurés une seule fois et partagés entre tous les projets
- **Configuration dynamique par projet** : Chaque projet peut avoir ses propres webhooks, URLs de redirection et paramètres
- **Isolation des données** : Les transactions et statistiques sont isolées par projet
- **API Keys par projet** : Chaque projet a sa propre clé API

## Support et Documentation

- **Documentation complète** : Consultez la documentation en ligne à `https://pay.yourdomain.com/docs`
- **API Reference** : Documentation détaillée de tous les endpoints API
- **Exemples d'intégration** : Code samples en JavaScript, Python, PHP

## Sécurité

- ✅ Authentification API par clé
- ✅ Vérification des signatures webhook
- ✅ HTTPS obligatoire (géré par Traefik)
- ✅ Certificats SSL automatiques (Let's Encrypt)
- ✅ Variables d'environnement sécurisées
- ✅ Isolation des projets

## Mise à jour

Pour mettre à jour NexPay vers la dernière version :

\`\`\`bash
cd /path/to/nexpay
git pull origin main
docker-compose down
docker-compose up -d --build
\`\`\`

## Sauvegarde

Il est recommandé de sauvegarder régulièrement :

1. **Base de données** : 
\`\`\`bash
docker-compose exec postgres pg_dump -U user nexpay > backup.sql
\`\`\`

2. **Variables d'environnement** :
\`\`\`bash
cp .env .env.backup
\`\`\`

## Dépannage

### Les paiements ne fonctionnent pas

1. Vérifiez que les providers sont correctement configurés
2. Vérifiez que les webhooks sont configurés chez les providers
3. Consultez les logs : `docker-compose logs -f`

### Problème de certificat SSL

Traefik gère automatiquement les certificats SSL. Si vous rencontrez des problèmes :

1. Vérifiez que votre domaine pointe bien vers votre serveur
2. Vérifiez les logs Traefik : `docker-compose logs traefik`
3. Attendez quelques minutes pour la génération du certificat

### Impossible d'accéder au dashboard

1. Vérifiez que tous les services sont démarrés : `docker-compose ps`
2. Vérifiez les logs : `docker-compose logs -f`
3. Vérifiez que le port 80 et 443 sont ouverts sur votre serveur

## Licence

NexPay est un logiciel open source. Consultez le fichier LICENSE pour plus d'informations.

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request sur GitHub.

---

Développé avec ❤️ pour faciliter les paiements mobiles en Afrique
