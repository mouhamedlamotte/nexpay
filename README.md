# NexPay - Aggregateur de Paiement Mobile open source

![NexPay](https://raw.githubusercontent.com/mouhamedlamotte/nexpay/main/images/dashboard.png)

NexPay est une solution de paiement mobile auto-hébergée qui permet d'accepter des paiements via Wave, Orange Money et d'autres fournisseurs de paiement mobile populaires en Afrique.

## Fonctionnalités

- 🚀 **Auto-hébergé** - Contrôle total de votre infrastructure de paiement
- 💳 **Multi-providers** - Support de Wave, Orange Money et autres
- 🔐 **Sécurisé** - Authentification API à deux niveaux (lecture/écriture), webhooks sécurisés
- 📊 **Dashboard complet** - Gestion des transactions, statistiques en temps réel
- 🔔 **Webhooks** - Notifications en temps réel des événements de paiement
- 🎯 **Multi-projets** - Gérez plusieurs projets avec une seule instance
- 🌐 **API REST** - Intégration facile avec votre application
- 🧪 **Mode test intégré** - Testez les providers directement depuis le dashboard

## Prérequis

- Un serveur Linux (Ubuntu 20.04+ recommandé)
- Docker et Docker Compose installés
- Port 80 et 443 libres (pour la production)
- Un nom de domaine pointant vers votre serveur (pour la production)
- Accès root ou sudo sur le serveur

## Installation

### Installation en développement (local)

Pour tester NexPay en local, suivez ces étapes simples :

1. **Cloner le repository**

```bash
git clone https://github.com/mouhamedlamotte/nexpay.git
cd nexpay
```

2. **Copier le fichier d'environnement**

```bash
cp .env.example .env
```

3. **Démarrer les services**

```bash
docker-compose -f docker-compose-dev.yml up -d
```

4. **Accéder à l'application**

Ouvrez votre navigateur à l'adresse : `http://localhost:9090`

**Identifiants par défaut :**

- Email : `admin@admin.com`
- Mot de passe : `password`

⚠️ **IMPORTANT** : Changez immédiatement le mot de passe et l'email lors de votre première connexion !

### Fichier .env.example

```env
# APP
APP_DOMAIN=localhost
APP_NAME=Nexpay

# AUTH
JWT_SECRET=t9iKTtUazAN0Q2DM/hpRyRT/JtI8L208rWXsHmZ9gvI=
ADMIN_EMAIL=admin@admin.com
ADMIN_PASSWORD=password

# DB
DB_NAME=nexpay
DB_USER=nexpay
DB_PASSWORD=password

# CACHE
REDIS_PASSWORD=redispassword

# TRAEFIK
TRAEFIK_ENABLE_SSL=false

# API KEYS
X_WRITE_KEY=write
X_READ_KEY=read

# SECRETS
ENCRYPTION_KEY=0072ac7fffc1cfce186b308af5f874fe7f5795adcf1c3d3592a7c2c159e01811
```

### Installation en production

L'installation en production est automatisée grâce à notre script d'installation. Traefik est configuré pour gérer automatiquement les certificats SSL et le reverse proxy.

#### Installation en une commande

```bash
curl -fsSL https://raw.githubusercontent.com/mouhamedlamotte/nexpay/main/install.sh | bash -s -- pay.yourdomain.com
```

Remplacez `pay.yourdomain.com` par votre propre domaine.

#### Ce que fait le script d'installation

1. Vérifie les prérequis (Docker, Docker Compose)
2. Clone le repository NexPay
3. Configure les variables d'environnement
4. Configure Traefik pour le reverse proxy et SSL
5. Démarre tous les services Docker avec `docker compose -f docker-compose-prod.yml up -d`
6. Affiche les informations de connexion

#### Informations post-installation

Une fois l'installation terminée, les secrets sont dispo dans `/opt/credentials.txt`

- **URL d'accès** : `https://pay.yourdomain.com`
- **Email admin** : L'email configuré
- **Mot de passe admin** : Le mot de passe généré
- **Clé API de lecture** : Pour les opérations de lecture côté client
- **Clé API d'écriture** : Pour initier des paiements (à garder secrète)
- **Autres secrets** : Nécessaires pour la configuration

⚠️ **SAUVEGARDER CES INFO EN LIEUX SUR ET SUPPRIMER CE FICHIER**

## Configuration

### Variables d'environnement

Le script d'installation crée automatiquement un fichier `.env` dans `/opt/nexpay/`. Pour modifier les variables :

```bash
cd /opt/nexpay
nano .env
# Modifiez les variables nécessaires
docker compose -f docker-compose-prod.yml restart
```

### Rotation des clés API

⚠️ **Note importante** : NexPay ne permet pas actuellement la rotation automatique des clés API. Les clés API sont définies dans les variables d'environnement.

Pour modifier les clés API manuellement :

```bash
cd /opt/nexpay
nano .env
# Modifiez X_WRITE_KEY et X_READ_KEY
docker-compose -f docker-compose-prod.yml restart
```

### Configuration des providers

La configuration des providers se fait maintenant sur une page dédiée par provider : `/<providerCode>`

Chaque page de configuration contient deux onglets :

1. **Secrets Configuration** : Configuration des clés API du provider
2. **Webhook Configuration** : Configuration des webhooks pour recevoir les notifications

![NexPay](https://raw.githubusercontent.com/mouhamedlamotte/nexpay/main/images/providers/0.png)

#### Configuration Wave

**Onglet Secrets Configuration**

- **API Key** : Votre clé API Wave obtenue depuis le portail développeur Wave

**Onglet Webhook Configuration**

Deux types d'authentification sont disponibles :

1. **Shared Secret** : Authentification simple avec une clé secrète partagée

   - Entrez le secret obtenu depuis votre dashboard Wave
   - Minimum 20 caractères requis
2. **HMAC** : Authentification cryptographique avancée (recommandé)

   - Sécurité renforcée avec vérification d'intégrité
   - Entrez le secret HMAC depuis votre dashboard Wave

**URL du webhook à configurer chez Wave** :

```
https://pay.yourdomain.com/api/v1/webhook/wave
```

#### Configuration Orange Money

**Onglet Secrets Configuration**

- **Client ID** : Votre identifiant client Orange Money
- **Client Secret** : Votre secret client Orange Money
- **Name** : Nom d'affichage du provider
- **Code** : Code unique du provider (ex: `om`)

**Onglet Webhook Configuration (Auto-configuration disponible)**

Orange Money bénéficie d'une fonctionnalité d'auto-configuration :

- Si vous ne fournissez pas de secret, il sera **généré automatiquement**
- Le webhook sera configuré automatiquement chez Orange Money
- Le secret généré sera enregistré automatiquement

Si vous préférez fournir votre propre secret :

- Entrez un secret d'au moins 20 caractères
- Configurez manuellement l'URL du webhook chez Orange Money

**URL du webhook à configurer chez Orange Money** :

```
https://pay.yourdomain.com/api/v1/webhook/om
```

#### Activation et test des providers

**Conditions d'activation** :

Un provider ne peut être activé que si :

- ✅ Les secrets sont configurés
- ✅ Le webhook est configuré

Une fois ces deux conditions remplies, un bouton **"Test Payment"** apparaît.

**Tester un provider** :

1. Cliquez sur le bouton **"Test Payment"**
2. Si le test réussit, une modal s'affiche avec :
   - Un **QR code** à scanner
   - Un **lien de checkout** direct
   - La référence de paiement
   - La date d'expiration

![NexPay](https://raw.githubusercontent.com/mouhamedlamotte/nexpay/main/images/providers/4.png)

3. Le provider est maintenant activé et prêt à être utilisé

### Configuration des webhooks NexPay

Pour recevoir les notifications de NexPay dans votre application, configurez un webhook dans le dashboard.

**Nouvelle fonctionnalité** : Le secret webhook est désormais **optionnel**. Si vous ne fournissez pas de secret, il sera généré automatiquement.

1. Accédez à **Paramètres du compte** > **Webhooks**
2. Cliquez sur **Nouveau webhook**
3. Renseignez :
   - **Webhook URL** : L'URL de votre application qui recevra les événements
   - **Header Name** : Nom du header pour la vérification (ex: `x-webhook-secret`)
   - **Secret** : Clé secrète pour vérifier l'authenticité (optionnel - auto-généré si vide)

![NexPay](https://raw.githubusercontent.com/mouhamedlamotte/nexpay/main/images/webhook.png)

⚠️ **Attention** : le secret n'est visible que une seule fois apres la creation du webhook, copiez-le et sauvegardez-le dans un endroit sécuritaire.

![NexPay](https://raw.githubusercontent.com/mouhamedlamotte/nexpay/main/images/one_time_view.png)



### Configuration des URLs de redirection

Configurez les URLs de redirection après paiement dans les paramètres de votre projet :

![NexPay](https://raw.githubusercontent.com/mouhamedlamotte/nexpay/main/images/callback.png)

- **Success URL** : Redirection après paiement réussi
- **Failure URL** : Redirection après échec de paiement
- **Cancel URL** : Redirection si l'utilisateur annule

## Utilisation du Dashboard

### Vue d'ensemble

Le dashboard vous donne un aperçu complet de votre activité :

![Dashord](https://raw.githubusercontent.com/mouhamedlamotte/nexpay/main/images/dashboard.png)

- **Volume Total** : Montant total des transactions
- **Transactions** : Nombre de transactions
- **Taux de Réussite** : Pourcentage de transactions réussies
- **Performance par Provider** : Répartition par fournisseur
- **Statistiques Rapides** : Montant moyen, nouveaux clients
- **Transactions récentes** : Liste des dernières transactions

### Processus de paiement

#### 1. Sélection du mode de paiement

![Checkout](https://raw.githubusercontent.com/mouhamedlamotte/nexpay/main/images/checkout.png)

Le client choisit son mode de paiement préféré (Wave, Orange Money, etc.)

#### 2. Paiement via QR Code ou lien direct

![NexPay](https://raw.githubusercontent.com/mouhamedlamotte/nexpay/main/images/scan.png)

Le client peut :

- Scanner le QR code avec son application de paiement
- Cliquer sur le lien direct pour ouvrir l'application
- Voir la référence de paiement et la date d'expiration

## Utilisation de l'API

### Authentification

NexPay utilise maintenant un système d'authentification à deux niveaux avec des clés API spécialisées.

Toutes les requêtes API nécessitent une clé API dans le header `x-api-key` :

```bash
x-api-key: YOUR_API_KEY
```

### Types de clés API

NexPay fournit deux types de clés API :

#### 1. Clé API de lecture (Read Key)

**Usage** :

- Récupérer une session de paiement
- Vérifier le statut d'une session de paiement
- Utilisée sur la page checkout de NexPay

**Sécurité** :
✅ Cette clé peut être utilisée côté client
✅ Peut être exposée publiquement (dans le code JavaScript frontend)
✅ Ne permet pas d'initier des paiements

**Exemple** :

```bash
GET /api/v1/payment/session/{sessionId}
x-api-key: YOUR_READ_KEY
```

#### 2. Clé API d'écriture (Write Key)

**Usage** :

- Initier un paiement direct
- Créer une session de paiement
- Toutes les opérations d'écriture

**Sécurité** :
⚠️ **NE JAMAIS EXPOSER CETTE CLÉ**
⚠️ À utiliser uniquement côté serveur
⚠️ Ne jamais inclure dans le code frontend

**Exemple** :

```bash
POST /api/v1/payment/initiate
x-api-key: YOUR_WRITE_KEY
Content-Type: application/json
```

### Différence entre paiement direct et session de paiement

NexPay propose deux méthodes pour accepter des paiements, chacune adaptée à des cas d'usage spécifiques.

#### Paiement direct (Initiate Payment)

**Quand l'utiliser** :

- Applications mobiles où l'utilisateur choisit déjà le provider
- Intégrations personnalisées avec sélection de provider
- Flux où vous contrôlez l'interface de sélection du mode de paiement

**Avantages** :

- Contrôle total de l'expérience utilisateur
- Pas de redirection vers la page checkout de NexPay
- Plus rapide pour l'utilisateur

**Endpoint** :

```bash
POST /api/v1/payment/initiate
x-api-key: YOUR_WRITE_KEY
Content-Type: application/json

{
  "amount": 10,
  "currency": "XOF",
  "provider_code": "om",
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
```

**Réponse** :

```json
{
  "statusCode": 200,
  "message": "Payment data successfully initialized",
  "data": {
    "amount": 10,
    "provider": {
      "id": "cmhkkw9sp0000p62174i881pb",
      "name": "Orange Money",
      "code": "om",
      "logoUrl": "https://pay.your-domain.com/api/v1/media/images/logos/om.png"
    },
    "currency": "XOF",
    "reference": "NEXPAY_TX_13C9FAED3CC0467E",
    "payer": {
      "userId": "cmhlcwue70009nq210l2h5tz4",
      "email": "kamal@admin.com",
      "phone": "+22177000000",
      "name": "Moustoifa Kamal Ben Moussa"
    },
    "checkout_urls": [
      {
        "name": "MaxIt",
        "url": "https://sugu.orange-sonatel.com/mp/dme8tVWrilaBBh5MYbhc",
        "thumb": "https://pay.your-domain.com/api/v1/media/images/thumbs/maxit.png"
      },
      {
        "name": "Orange Money",
        "url": "https://orange-money-prod-flowlinks.web.app/om/dme8tVWrilaBBh5MYbhc",
        "thumb": "https://pay.your-domain.com/api/v1/media/images/thumbs/om.png"
      }
    ],
    "qr_code": {
      "data": "iVBORw0KGgoAAAANSUhEUgAAAMgAAA..."
    },
    "expiration": "2025-11-06T00:22:51.115Z"
  }
}
```

**Ce que vous recevez** :

- Référence de paiement unique
- QR code encodé en base64
- URLs de checkout (pour ouvrir l'application de paiement)
- Informations du payeur
- Date d'expiration

**Exemple d'intégration** :

```javascript
// Afficher le QR code
const img = document.createElement('img');
img.src = `data:image/png;base64,${response.data.qr_code.data}`;
document.body.appendChild(img);

// Ou rediriger vers l'URL de paiement
window.location.href = response.data.checkout_urls[0].url;
```

#### Session de paiement (Initiate Payment Session)

**Quand l'utiliser** :

- Sites e-commerce standards
- Quand vous voulez déléguer la sélection du provider à NexPay
- Pour bénéficier de l'interface checkout optimisée de NexPay

**Avantages** :

- Interface de checkout professionnelle fournie par NexPay
- Gestion automatique de tous les providers configurés
- Expérience utilisateur optimisée et testée
- Moins de code à maintenir

**Endpoint** :

```bash
POST /api/v1/payment/session/initiate
x-api-key: YOUR_WRITE_KEY
Content-Type: application/json

{
  "amount": 10000,
  "currency": "XOF",
  "customer": {
    "name": "Mouhamed Baba",
    "email": "customer@example.com",
    "phone": "+221771234567"
  },
  "success_url": "https://yourapp.com/success",
  "cancel_url": "https://yourapp.com/cancel",
  "metadata": {
    "order_id": "ORDER-123"
  }
}
```

**Réponse** :

```json
{
  "statusCode": 200,
  "message": "Le test est passé avec succès.",
  "data": {
    "sessionId": "cmhmmiaef000qnq213t3az6ip",
    "checkoutUrl": "https://pay.your-domain.com/checkout/cmhmmiaef000qnq213t3az6ip",
    "status": "opened",
    "expiresAt": "2025-11-06T00:22:50.529Z"
  }
}
```

**Ce que vous recevez** :

- ID de session unique
- URL de checkout hébergée par NexPay
- Statut de la session
- Date d'expiration

**Exemple d'intégration** :

```javascript
// Rediriger l'utilisateur vers la page de checkout
window.location.href = response.data.checkoutUrl;

// Ou ouvrir dans une nouvelle fenêtre/modal
window.open(response.data.checkoutUrl, '_blank');
```

### Vérifier le statut d'une session

Utilisez la **clé API de lecture** pour vérifier le statut (utilisable côté client) :

```bash
GET /api/v1/payment/session/{sessionId}
x-api-key: YOUR_READ_KEY
```

**Réponse** :

```json
{
  "statusCode": 200,
  "data": {
    "sessionId": "cmhmmiaef000qnq213t3az6ip",
    "status": "succeeded",
    "amount": 10000,
    "currency": "XOF",
    "provider": {
      "name": "Wave",
      "code": "wave"
    },
    "customer": {
      "name": "Mouhamed Baba",
      "email": "customer@example.com",
      "phone": "+221771234567"
    }
  }
}
```

## Webhooks

### Structure d'un événement webhook

```json
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
```

### Types d'événements

- `payment.succeeded` : Paiement réussi
- `payment.failed` : Paiement échoué
- `payment.pending` : Paiement en attente
- `payment.cancelled` : Paiement annulé

### Vérification de la signature

Vérifiez toujours la signature des webhooks pour garantir leur authenticité :

```javascript
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
  
  switch(event.type) {
    case 'payment.succeeded':
      // Marquer la commande comme payée
      break;
    case 'payment.failed':
      // Notifier l'utilisateur
      break;
  }
  
  res.status(200).send('OK');
});
```

## Gestion multi-projets

NexPay permet de gérer plusieurs projets avec une seule instance :

- **Configuration unique des providers** : Les providers (Wave, Orange Money) sont configurés une seule fois et partagés entre tous les projets
- **Configuration dynamique par projet** : Chaque projet peut avoir ses propres webhooks, URLs de redirection et paramètres
- **Isolation des données** : Les transactions et statistiques sont isolées par projet
- **API Keys par projet** : Chaque projet a ses propres clés de lecture et d'écriture

## Documentation API

⚠️ **Note importante** : La documentation Swagger n'est plus disponible en production pour des raisons de sécurité.

Pour accéder à la documentation complète de l'API :

- Utilisez l'environnement de développement local
- Consultez la documentation en ligne sur le site officiel

## Sécurité

### Bonnes pratiques

✅ **Clés API** :

- Ne jamais exposer la clé d'écriture côté client
- Utiliser la clé de lecture uniquement pour les opérations de consultation
- Stocker les clés dans des variables d'environnement

✅ **Webhooks** :

- Toujours vérifier la signature des webhooks
- Utiliser HTTPS pour tous les endpoints webhook
- Générer des secrets forts (minimum 32 caractères)

✅ **Production** :

- Changer immédiatement le mot de passe admin par défaut
- Utiliser des mots de passe forts pour la base de données
- Activer SSL/TLS (automatique avec Traefik en production)
- Restreindre l'accès au serveur via firewall

### Fonctionnalités de sécurité intégrées

- ✅ Authentification API à deux niveaux (lecture/écriture)
- ✅ Vérification des signatures webhook (HMAC ou Shared Secret)
- ✅ HTTPS obligatoire en production (géré par Traefik)
- ✅ Certificats SSL automatiques (Let's Encrypt)
- ✅ Variables d'environnement sécurisées
- ✅ Isolation des projets
- ✅ Chiffrement des données sensibles

## Mise à jour

### Environnement de développement

```bash
cd /path/to/nexpay
git pull origin main
docker-compose -f docker-compose-dev.yml down
docker-compose -f docker-compose-dev.yml up -d --build
```

### Environnement de production

```bash
cd /opt/nexpay
git pull origin main
docker-compose -f docker-compose-prod.yml down
docker-compose -f docker-compose-prod.yml up -d --build
```

## Sauvegarde

Il est recommandé de sauvegarder régulièrement :

### 1. Base de données

**Développement** :

```bash
docker-compose -f docker-compose-dev.yml exec postgres pg_dump -U nexpay nexpay > backup.sql
```

**Production** :

```bash
docker-compose -f docker-compose-prod.yml exec postgres pg_dump -U nexpay nexpay > backup.sql
```

### 2. Variables d'environnement

```bash
cp .env .env.backup
```

### 3. Restauration

```bash
docker-compose exec postgres psql -U nexpay nexpay < backup.sql
```

## Dépannage

### Les paiements ne fonctionnent pas

1. Vérifiez que les providers sont correctement configurés (onglets Secrets et Webhook)
2. Vérifiez que les webhooks sont configurés chez les providers
3. Testez le provider avec le bouton "Test Payment"
4. Consultez les logs :
   ```bash
   docker-compose -f docker-compose-dev.yml logs -f
   # ou
   docker-compose -f docker-compose-prod.yml logs -f
   ```

### Problème de certificat SSL (Production)

Traefik gère automatiquement les certificats SSL. Si vous rencontrez des problèmes :

1. Vérifiez que votre domaine pointe bien vers votre serveur
2. Vérifiez les logs Traefik :
   ```bash
   docker-compose -f docker-compose-prod.yml logs traefik
   ```
3. Attendez quelques minutes pour la génération du certificat
4. Vérifiez que les ports 80 et 443 sont ouverts :
   ```bash
   sudo ufw status
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

### Impossible d'accéder au dashboard

1. Vérifiez que tous les services sont démarrés :
   ```bash
   docker-compose ps
   ```
2. Vérifiez les logs :
   ```bash
   docker-compose logs -f
   ```
3. Vérifiez les ports (80/443 en production, 80 en dev)
4. Testez la connectivité :
   ```bash
   curl http://localhost:9090  # Dev
   curl https://pay.yourdomain.com  # Prod
   ```

### Erreurs d'authentification API

1. Vérifiez que vous utilisez le bon header : `x-api-key` (et non `Authorization: Bearer`)
2. Vérifiez que vous utilisez la bonne clé (lecture ou écriture)
3. Vérifiez que la clé n'a pas été modifiée dans le `.env`

### Le webhook ne fonctionne pas

1. Vérifiez que l'URL du webhook est accessible publiquement
2. Testez la signature avec le secret configuré
3. Vérifiez les logs du provider
4. Testez avec un outil comme webhook.site

## Exemples d'intégration

### Intégration JavaScript/Node.js (Paiement direct)

```javascript
const axios = require('axios');

async function initiatePayment() {
  try {
    const response = await axios.post(
      'https://pay.yourdomain.com/api/v1/payment/initiate',
      {
        amount: 5000,
        currency: 'XOF',
        provider_code: 'wave',
        customer: {
          name: 'Jean Dupont',
          email: 'jean@example.com',
          phone: '+221771234567'
        },
        metadata: {
          order_id: 'CMD-2024-001'
        }
      },
      {
        headers: {
          'x-api-key': process.env.NEXPAY_WRITE_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Payment initiated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}
```

### Intégration JavaScript/Node.js (Session de paiement)

```javascript
async function createPaymentSession() {
  try {
    const response = await axios.post(
      'https://pay.yourdomain.com/api/v1/payment/session/initiate',
      {
        amount: 5000,
        currency: 'XOF',
        customer: {
          name: 'Jean Dupont',
          email: 'jean@example.com',
          phone: '+221771234567'
        },
        success_url: 'https://monsite.com/success',
        cancel_url: 'https://monsite.com/cancel',
        metadata: {
          order_id: 'CMD-2024-001'
        }
      },
      {
        headers: {
          'x-api-key': process.env.NEXPAY_WRITE_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    // Rediriger vers la page de checkout
    window.location.href = response.data.data.checkoutUrl;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}
```

### Vérification côté client (avec clé de lecture)

```javascript
// Sûr à utiliser côté client
async function checkPaymentStatus(sessionId) {
  try {
    const response = await axios.get(
      `https://pay.yourdomain.com/api/v1/payment/session/${sessionId}`,
      {
        headers: {
          'x-api-key': 'YOUR_READ_KEY' // Peut être exposé
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Polling pour vérifier le statut
const pollInterval = setInterval(async () => {
  const status = await checkPaymentStatus(sessionId);
  
  if (status.data.status === 'succeeded') {
    clearInterval(pollInterval);
    // Afficher succès
  } else if (status.data.status === 'failed') {
    clearInterval(pollInterval);
    // Afficher échec
  }
}, 3000);
```

### Intégration Python

```python
import requests
import os

NEXPAY_API_URL = "https://pay.yourdomain.com/api/v1"
WRITE_KEY = os.getenv("NEXPAY_WRITE_KEY")

def create_payment_session(amount, customer):
    headers = {
        "x-api-key": WRITE_KEY,
        "Content-Type": "application/json"
    }
  
    payload = {
        "amount": amount,
        "currency": "XOF",
        "customer": customer,
        "success_url": "https://monsite.com/success",
        "cancel_url": "https://monsite.com/cancel"
    }
  
    response = requests.post(
        f"{NEXPAY_API_URL}/payment/session/initiate",
        json=payload,
        headers=headers
    )
  
    return response.json()

# Utilisation
customer = {
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "phone": "+221771234567"
}

result = create_payment_session(5000, customer)
print(f"Checkout URL: {result['data']['checkoutUrl']}")
```

### Intégration PHP

```php
<?php

function createPaymentSession($amount, $customer) {
    $writeKey = getenv('NEXPAY_WRITE_KEY');
    $apiUrl = 'https://pay.yourdomain.com/api/v1/payment/session/initiate';
  
    $data = [
        'amount' => $amount,
        'currency' => 'XOF',
        'customer' => $customer,
        'success_url' => 'https://monsite.com/success',
        'cancel_url' => 'https://monsite.com/cancel',
        'metadata' => [
            'order_id' => 'CMD-2024-001'
        ]
    ];
  
    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'x-api-key: ' . $writeKey,
        'Content-Type: application/json'
    ]);
  
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
  
    if ($httpCode === 200) {
        $result = json_decode($response, true);
        return $result;
    }
  
    return null;
}

// Utilisation
$customer = [
    'name' => 'Jean Dupont',
    'email' => 'jean@example.com',
    'phone' => '+221771234567'
];

$result = createPaymentSession(5000, $customer);

if ($result) {
    // Rediriger vers la page de checkout
    header('Location: ' . $result['data']['checkoutUrl']);
    exit;
}
?>
```

### Webhook Handler (Express.js)

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const WEBHOOK_SECRET = process.env.NEXPAY_WEBHOOK_SECRET;

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return signature === expectedSignature;
}

app.post('/webhook/nexpay', (req, res) => {
  const signature = req.headers['x-webhook-secret'];
  
  // Vérifier la signature
  if (!verifyWebhookSignature(req.body, signature, WEBHOOK_SECRET)) {
    console.error('Invalid webhook signature');
    return res.status(401).send('Invalid signature');
  }
  
  const event = req.body;
  
  // Traiter l'événement selon son type
  switch (event.type) {
    case 'payment.succeeded':
      handlePaymentSuccess(event.data);
      break;
  
    case 'payment.failed':
      handlePaymentFailure(event.data);
      break;
  
    case 'payment.pending':
      handlePaymentPending(event.data);
      break;
  
    case 'payment.cancelled':
      handlePaymentCancelled(event.data);
      break;
  
    default:
      console.log('Unknown event type:', event.type);
  }
  
  // Toujours répondre 200 OK
  res.status(200).send('OK');
});

function handlePaymentSuccess(data) {
  console.log('Payment succeeded:', data.client_reference);
  
  // Récupérer l'order_id depuis les métadonnées
  const orderId = data.metadata.order_id;
  
  // Mettre à jour la commande dans votre base de données
  // updateOrderStatus(orderId, 'paid');
  
  // Envoyer un email de confirmation
  // sendConfirmationEmail(data.payer.email, orderId);
  
  // Logger pour audit
  console.log({
    orderId,
    amount: data.amount,
    provider: data.provider.name,
    payer: data.payer.name,
    timestamp: data.resolvedAt
  });
}

function handlePaymentFailure(data) {
  console.log('Payment failed:', data.client_reference);
  
  const orderId = data.metadata.order_id;
  
  // Mettre à jour le statut
  // updateOrderStatus(orderId, 'failed');
  
  // Notifier l'utilisateur
  // sendPaymentFailureEmail(data.payer.email, orderId);
}

function handlePaymentPending(data) {
  console.log('Payment pending:', data.client_reference);
  // Traiter le paiement en attente
}

function handlePaymentCancelled(data) {
  console.log('Payment cancelled:', data.client_reference);
  // Traiter l'annulation
}

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

### Webhook Handler (Python/Flask)

```python
from flask import Flask, request, jsonify
import hmac
import hashlib
import json
import os

app = Flask(__name__)
WEBHOOK_SECRET = os.getenv('NEXPAY_WEBHOOK_SECRET')

def verify_webhook_signature(payload, signature, secret):
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        json.dumps(payload).encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
  
    return hmac.compare_digest(signature, expected_signature)

@app.route('/webhook/nexpay', methods=['POST'])
def nexpay_webhook():
    signature = request.headers.get('x-webhook-secret')
    payload = request.get_json()
  
    # Vérifier la signature
    if not verify_webhook_signature(payload, signature, WEBHOOK_SECRET):
        return jsonify({'error': 'Invalid signature'}), 401
  
    event_type = payload.get('type')
    data = payload.get('data')
  
    # Traiter l'événement
    if event_type == 'payment.succeeded':
        handle_payment_success(data)
    elif event_type == 'payment.failed':
        handle_payment_failure(data)
    elif event_type == 'payment.pending':
        handle_payment_pending(data)
    elif event_type == 'payment.cancelled':
        handle_payment_cancelled(data)
  
    return jsonify({'status': 'ok'}), 200

def handle_payment_success(data):
    print(f"Payment succeeded: {data['client_reference']}")
    order_id = data['metadata']['order_id']
    # Mettre à jour la commande
    # update_order_status(order_id, 'paid')

def handle_payment_failure(data):
    print(f"Payment failed: {data['client_reference']}")
    # Traiter l'échec

def handle_payment_pending(data):
    print(f"Payment pending: {data['client_reference']}")
    # Traiter le statut en attente

def handle_payment_cancelled(data):
    print(f"Payment cancelled: {data['client_reference']}")
    # Traiter l'annulation

if __name__ == '__main__':
    app.run(port=3000)
```

### Webhook Handler (PHP)

```php
<?php

$webhookSecret = getenv('NEXPAY_WEBHOOK_SECRET');

function verifyWebhookSignature($payload, $signature, $secret) {
    $expectedSignature = hash_hmac('sha256', json_encode($payload), $secret);
    return hash_equals($signature, $expectedSignature);
}

// Récupérer les données
$signature = $_SERVER['HTTP_X_WEBHOOK_SECRET'] ?? '';
$payload = json_decode(file_get_contents('php://input'), true);

// Vérifier la signature
if (!verifyWebhookSignature($payload, $signature, $webhookSecret)) {
    http_response_code(401);
    die('Invalid signature');
}

$eventType = $payload['type'];
$data = $payload['data'];

// Traiter l'événement
switch ($eventType) {
    case 'payment.succeeded':
        handlePaymentSuccess($data);
        break;
    
    case 'payment.failed':
        handlePaymentFailure($data);
        break;
    
    case 'payment.pending':
        handlePaymentPending($data);
        break;
    
    case 'payment.cancelled':
        handlePaymentCancelled($data);
        break;
}

function handlePaymentSuccess($data) {
    error_log("Payment succeeded: " . $data['client_reference']);
  
    $orderId = $data['metadata']['order_id'];
  
    // Mettre à jour la commande dans la base de données
    // $db->query("UPDATE orders SET status = 'paid' WHERE id = ?", [$orderId]);
  
    // Envoyer un email de confirmation
    // sendConfirmationEmail($data['payer']['email'], $orderId);
}

function handlePaymentFailure($data) {
    error_log("Payment failed: " . $data['client_reference']);
    // Traiter l'échec
}

function handlePaymentPending($data) {
    error_log("Payment pending: " . $data['client_reference']);
    // Traiter le statut en attente
}

function handlePaymentCancelled($data) {
    error_log("Payment cancelled: " . $data['client_reference']);
    // Traiter l'annulation
}

// Répondre 200 OK
http_response_code(200);
echo 'OK';
?>
```

## Architecture et déploiement

### Architecture des services

NexPay utilise une architecture microservices avec Docker Compose :

- **Frontend** : Application React pour le dashboard et checkout
- **Backend** : API REST Node.js/NestJS
- **Database** : PostgreSQL pour les données persistantes
- **Cache** : Redis pour les sessions et cache
- **Reverse Proxy** : Traefik pour SSL et routing (production uniquement)

### Configuration Docker

#### docker-compose-dev.yml

Utilisé pour le développement local :

- Pas de SSL (HTTP uniquement)
- Ports exposés directement
- Rechargement à chaud activé
- Logs verbeux

```bash
docker-compose -f docker-compose-dev.yml up -d
```

#### docker-compose-prod.yml

Utilisé pour la production :

- SSL automatique via Traefik et Let's Encrypt
- Reverse proxy configuré
- Optimisations de performance
- Logs structurés

```bash
docker-compose -f docker-compose-prod.yml up -d
```

### Monitoring et logs

#### Voir les logs en temps réel

```bash
# Tous les services
docker-compose -f docker-compose-prod.yml logs -f

# Un service spécifique
docker-compose -f docker-compose-prod.yml logs -f backend
docker-compose -f docker-compose-prod.yml logs -f postgres
docker-compose -f docker-compose-prod.yml logs -f traefik
```

#### Vérifier l'état des services

```bash
docker-compose -f docker-compose-prod.yml ps
```

#### Redémarrer un service

```bash
# Redémarrer tous les services
docker-compose -f docker-compose-prod.yml restart

# Redémarrer un service spécifique
docker-compose -f docker-compose-prod.yml restart backend
```

### Performance et optimisation

#### Optimisation de la base de données

```bash
# Accéder au conteneur PostgreSQL
docker-compose exec postgres psql -U nexpay

-- Analyser les performances
EXPLAIN ANALYZE SELECT * FROM transactions WHERE status = 'succeeded';

-- Créer des index si nécessaire
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
```

#### Nettoyage du cache Redis

```bash
# Accéder à Redis
docker-compose exec redis redis-cli -a redispassword

# Vider le cache
FLUSHALL

# Voir les clés
KEYS *
```

## FAQ

### Questions générales

**Q: Puis-je utiliser NexPay gratuitement ?**
R: Oui, NexPay est open source. Vous ne payez que les frais des providers (Wave, Orange Money, etc.)

**Q: Quels pays sont supportés ?**
R: NexPay supporte tous les pays où Wave et Orange Money sont disponibles (principalement l'Afrique de l'Ouest et Centrale).

**Q: Puis-je ajouter d'autres providers ?**
R: Oui, l'architecture de NexPay permet d'ajouter facilement de nouveaux providers. Consultez la documentation de contribution.

**Q: Combien de transactions puis-je traiter ?**
R: Il n'y a pas de limite imposée par NexPay. Les limites dépendent de vos providers et de votre infrastructure serveur.

### Questions techniques

**Q: Pourquoi y a-t-il deux types de clés API ?**
R: Pour améliorer la sécurité. La clé de lecture peut être utilisée côté client en toute sécurité, tandis que la clé d'écriture doit rester secrète côté serveur.

**Q: Puis-je changer les clés API ?**
R: Oui, mais manuellement. Modifiez les variables `X_WRITE_KEY` et `X_READ_KEY` dans le fichier `.env` et redémarrez les services.

**Q: Comment gérer plusieurs environnements (dev, staging, prod) ?**
R: Déployez plusieurs instances de NexPay avec des configurations différentes. Utilisez des sous-domaines différents (dev.pay.domain.com, pay.domain.com).

**Q: Les webhooks sont-ils fiables ?**
R: Oui, mais implémentez toujours une logique de vérification du statut côté serveur en cas d'échec de webhook.

**Q: Que faire si un webhook échoue ?**
R: NexPay réessaie automatiquement les webhooks échoués. Vous pouvez aussi consulter l'historique dans le dashboard.

### Questions de sécurité

**Q: Mes données sont-elles sécurisées ?**R: Oui, avec une configuration appropriée :

- SSL/TLS automatique en production
- Chiffrement des données sensibles
- Authentification forte
- Isolation des projets

**Q: Dois-je être PCI-DSS compliant ?**
R: Non, NexPay ne traite pas directement les cartes bancaires. Les paiements sont gérés par Wave, Orange Money, etc.

**Q: Comment protéger mes clés API ?**R:

- Ne jamais commiter les clés dans Git
- Utiliser des variables d'environnement
- Ne jamais exposer la clé d'écriture côté client
- Restreindre l'accès au serveur

## Ressources et support

### Documentation officielle

- **Site web** : https://nexpay.thenexcom.com
- **GitHub** : https://github.com/mouhamedlamotte/nexpay
- **Changelog** : Consultez les releases GitHub pour les nouveautés

### Communauté

- **Issues GitHub** : Pour reporter des bugs ou demander des fonctionnalités
- **Discussions GitHub** : Pour poser des questions et échanger avec la communauté

### Support professionnel

Pour un support personnalisé, des formations ou des développements sur mesure, contactez :

- **Email** : support@nexpay.com
- **Site** : https://mouhamedlamotte.thenexcom.com

## Contribuer

Les contributions sont les bienvenues ! Voici comment participer :

1. **Fork** le repository
2. **Créer une branche** pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. **Commiter** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir une Pull Request**

### Guidelines

- Écrivez du code propre et documenté
- Ajoutez des tests pour les nouvelles fonctionnalités
- Suivez les conventions de code du projet
- Décrivez clairement vos changements dans la PR

## Roadmap

### Version actuelle (v2.0)

✅ Configuration des providers par page dédiée
✅ Test de providers intégré
✅ Auto-configuration des webhooks Orange Money
✅ Deux types de clés API (lecture/écriture)
✅ Génération automatique des secrets webhook
✅ Mode développement local

### Prochaines versions

🔜 **v2.1**

- Rotation automatique des clés API
- Dashboard de monitoring avancé
- Support de Free Money
- Support de PayDunya

🔜 **v2.2**

- API GraphQL
- Webhooks retry configurable
- Multi-devise étendu
- Mode sandbox pour tests

🔜 **v3.0**

- Support des paiements récurrents (abonnements)
- Gestion des remboursements
- Facturation automatique
- Rapports comptables avancés

## Licence

NexPay est un logiciel open source sous licence MIT. Consultez le fichier [LICENSE](https://github.com/mouhamedlamotte/nexpay/blob/main/LICENSE) pour plus d'informations.

## Remerciements

NexPay a été développé pour faciliter l'intégration des paiements mobiles en Afrique. Merci à tous les contributeurs et à la communauté pour leur soutien.

### Technologies utilisées

- **Backend** : Node.js, NestJS, TypeScript
- **Frontend** : React, TailwindCSS
- **Database** : PostgreSQL
- **Cache** : Redis
- **Infrastructure** : Docker, Traefik
- **Providers** : Wave API, Orange Money API

---

**Développé avec ❤️ par [Mouhamed Lamotte](https://mouhamedlamotte.thenexcom.com)**

*Dernière mise à jour : Novembre 2025*
