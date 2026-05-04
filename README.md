# NexPay — Agrégateur de paiement mobile open source

NexPay est une solution auto-hébergée qui unifie Wave, Orange Money et d'autres providers mobiles africains derrière une seule API REST. Un dashboard permet de configurer les providers, gérer plusieurs projets, consulter les transactions et piloter les webhooks.

![Dashboard](https://raw.githubusercontent.com/mouhamedlamotte/nexpay/main/images/dashboard.png)

---

## Table des matières

1. [Fonctionnalités](#fonctionnalités)
2. [Architecture](#architecture)
3. [Installation](#installation)
   - [Option A — Image pré-construite (recommandé)](#option-a--image-pré-construite-recommandé)
   - [Option B — Avec Traefik intégré (HTTPS automatique)](#option-b--avec-traefik-intégré-https-automatique)
   - [Option C — Derrière un gateway existant](#option-c--derrière-un-gateway-existant)
   - [Option D — PostgreSQL/Redis existants](#option-d--postgresqlredis-existants)
   - [Développement local](#développement-local)
4. [Variables d'environnement](#variables-denvironnement)
5. [Premiers pas après installation](#premiers-pas-après-installation)
6. [API Reference](#api-reference)
   - [Authentification](#authentification)
   - [Paiement direct](#paiement-direct)
   - [Session de paiement](#session-de-paiement)
   - [Webhooks entrants (providers)](#webhooks-entrants-providers)
7. [Webhooks sortants (vers votre app)](#webhooks-sortants-vers-votre-app)
8. [Configuration des providers](#configuration-des-providers)
9. [Gestion multi-projets](#gestion-multi-projets)
10. [Mise à jour](#mise-à-jour)

---

## Fonctionnalités

- **Multi-providers** — Wave et Orange Money inclus, architecture extensible
- **Deux modes de paiement** — Direct (contrôle total) ou Session (checkout hébergé)
- **API à deux niveaux** — clé lecture (safe client-side) et clé écriture (server-side only)
- **Webhooks sécurisés** — signature HMAC ou Shared Secret côté providers ; signature sortante configurable par projet
- **Multi-projets** — une instance NexPay, plusieurs projets isolés
- **Dashboard** — stats temps réel, historique transactions, configuration providers/webhooks
- **Auto-hébergé** — Docker, zéro dépendance externe obligatoire

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Votre app                            │
│  POST /payment/initiate   POST /payment/session/initiate    │
└───────────────────────────────┬─────────────────────────────┘
                                │  x-api-key (write key)
                                ▼
                    ┌───────────────────┐
                    │   NexPay API      │  NestJS · Port 9000
                    │   (api/)          │  JWT + API Key auth
                    └──┬────────────┬──┘
                       │            │
               ┌───────┘            └──────────┐
               ▼                               ▼
        ┌─────────────┐               ┌──────────────────┐
        │  PostgreSQL │               │  Redis (cache)   │
        └─────────────┘               └──────────────────┘
               ▲
               │  webhook callback
        ┌──────┴──────────────┐
        │  Wave / Orange Money│
        └─────────────────────┘
               │  fan-out webhooks
               ▼
        ┌─────────────────────┐
        │  Votre endpoint     │
        │  (par projet)       │
        └─────────────────────┘

┌───────────────────────────────┐
│   NexPay Web (web/)           │  Next.js 15 · Port 9001
│   Dashboard + Checkout public │
└───────────────────────────────┘
```

Services Docker :
| Service | Image | Rôle |
|---|---|---|
| `nexpay-app` | `ghcr.io/mouhamedlamotte/nexpay:latest` | API + Web (image unifiée) |
| `nexpay-db` | `postgres:17-alpine` | Base de données |
| `nexpay-cache` | `redis:7-alpine` | Cache / sessions |

---

## Installation

### Prérequis communs

- Docker ≥ 24 et Docker Compose v2
- Un fichier `.env` créé depuis `.env.example`

```bash
git clone https://github.com/mouhamedlamotte/nexpay.git
cd nexpay
cp .env.example .env
# Éditez .env selon votre cas
```

---

### Option A — Image pré-construite (recommandé)

> Déploiement le plus simple. L'API et le dashboard tournent dans un seul conteneur sans Traefik. À utiliser derrière votre propre reverse proxy (Nginx, Caddy…) ou directement en HTTP pour un usage interne.

**`docker-compose.yml`** (à la racine du projet) :

```bash
docker compose up -d
```

Ce fichier démarre :
- `nexpay-db` — PostgreSQL sur `5433`
- `nexpay-cache` — Redis sur `63791`
- `nexpay-app` — API sur `9000`, dashboard sur `9001`

**`.env` minimum :**

```env
APP_NAME=NexPay
APP_DOMAIN=localhost

JWT_SECRET=<générer avec: openssl rand -base64 32>
ENCRYPTION_KEY=<générer avec: openssl rand -hex 32>

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<mot de passe fort>

DB_NAME=nexpay
DB_USER=nexpay
DB_PASSWORD=<mot de passe fort>
DATABASE_URL=postgresql://nexpay:<DB_PASSWORD>@nexpay-db:5432/nexpay

REDIS_PASSWORD=<mot de passe fort>

X_WRITE_KEY=<votre clé écriture>
X_READ_KEY=<votre clé lecture>

API_URL=http://localhost:9000/api/v1
```

**Accès après démarrage :**
- Dashboard : `http://localhost:9001`
- API : `http://localhost:9000/api/v1`
- Swagger (dev) : `http://localhost:9000/api/v1/docs`

> **Note :** Les migrations Prisma sont exécutées automatiquement au démarrage. L'admin et les providers (Wave, Orange Money) sont seeded automatiquement.

---

### Option B — Avec Traefik intégré (HTTPS automatique)

> Pour un serveur public avec un domaine DNS pointant vers votre machine. Traefik gère SSL (Let's Encrypt) et le routing automatiquement.

**Prérequis :**
- Ports 80 et 443 libres
- Domaine DNS pointant vers le serveur

```bash
# Créer le fichier acme.json pour Let's Encrypt
mkdir -p config/traefik/letsencrypt
touch config/traefik/letsencrypt/acme.json
chmod 600 config/traefik/letsencrypt/acme.json

docker compose -f docker-compose-prod.yml up -d
```

**Variables supplémentaires dans `.env` :**

```env
APP_DOMAIN=pay.votredomaine.com
TRAEFIK_AUTH=<user:htpasswd — généré avec: echo $(htpasswd -nb admin password)>
```

**Ce que fait ce compose :**
- `traefik` — Reverse proxy HTTPS, dashboard sur `traefik.{APP_DOMAIN}`
- `nexpay-api` et `nexpay-web` buildés depuis les sources
- Réseau `nexpay-backend` isolé (internal=true) — DB et Redis inaccessibles depuis l'extérieur
- Migrations Prisma exécutées au démarrage (`npx prisma migrate deploy && npm run prod`)

**Accès :**
- Dashboard : `https://pay.votredomaine.com`
- API : `https://pay.votredomaine.com/api/v1`

> **Note :** La documentation Swagger est désactivée en production (`NODE_ENV=production`).

---

### Option C — Derrière un gateway existant

> Vous avez déjà Nginx, Caddy, Traefik ou un autre reverse proxy. Utilisez `docker-compose.yml` (Option A) puis configurez votre gateway pour proxyfier vers NexPay.

Le conteneur `nexpay-app` expose :
- Port `9000` → API NestJS
- Port `9001` → Dashboard Next.js

**Exemple Nginx :**

```nginx
server {
    listen 443 ssl;
    server_name pay.votredomaine.com;

    # SSL géré par Nginx/Certbot

    # Dashboard
    location / {
        proxy_pass http://127.0.0.1:9001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API
    location /api/ {
        proxy_pass http://127.0.0.1:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Exemple Caddy :**

```
pay.votredomaine.com {
    handle /api/* {
        reverse_proxy localhost:9000
    }
    handle {
        reverse_proxy localhost:9001
    }
}
```

**Variable à adapter dans `.env` :**
```env
APP_DOMAIN=pay.votredomaine.com
API_URL=https://pay.votredomaine.com/api/v1
```

Si votre gateway gère le HTTPS et que l'API est derrière (`trust proxy`), la variable `CORS_ORIGIN` doit correspondre à l'origine du dashboard :
```env
CORS_ORIGIN=https://pay.votredomaine.com
```

---

### Option D — PostgreSQL/Redis existants

> Vous avez déjà une instance Postgres ou Redis. Supprimez les services correspondants du compose et pointez directement vers vos serveurs.

**`docker-compose.yml` modifié** (supprimer les services `nexpay-db` et/ou `nexpay-cache`) :

```yaml
services:
  nexpay-app:
    image: ghcr.io/mouhamedlamotte/nexpay:latest
    environment:
      - DATABASE_URL=postgresql://user:password@votre-pg-host:5432/nexpay
      - REDIS_URL=redis://:votre-redis-password@votre-redis-host:6379
      # ... autres vars
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - ./media:/app/media
      - ./logs:/app/logs
```

**Prérequis côté base de données :**

```sql
-- Créer la base et l'utilisateur si besoin
CREATE DATABASE nexpay;
CREATE USER nexpay WITH ENCRYPTED PASSWORD 'votre_password';
GRANT ALL PRIVILEGES ON DATABASE nexpay TO nexpay;
```

Les migrations sont exécutées automatiquement au démarrage du conteneur.

**Format `DATABASE_URL` :**
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

**Format `REDIS_URL` :**
```
redis://:PASSWORD@HOST:PORT
# Ou sans mot de passe :
redis://HOST:PORT
```

---

### Développement local

Pour développer avec hot-reload sur les deux services :

```bash
# Démarre Traefik + PostgreSQL + Redis + API (watch) + Web
docker compose -f docker-compose-dev.yml up -d
```

- Dashboard : `http://localhost:9090`
- API docs : `http://localhost:9090/api/v1/docs`
- PostgreSQL : `localhost:54321`
- Redis : `localhost:63791`

Pour travailler directement hors Docker :

```bash
# Terminal 1 — API
cd api
pnpm install
pnpm dev       # watch mode, port 9000

# Terminal 2 — Web
cd web
pnpm install
pnpm dev       # port 9001
```

---

## Variables d'environnement

| Variable | Obligatoire | Description | Exemple |
|---|---|---|---|
| `APP_NAME` | ✅ | Nom de l'application | `NexPay` |
| `APP_DOMAIN` | ✅ | Domaine public (sans `https://`) | `pay.example.com` |
| `JWT_SECRET` | ✅ | Secret JWT dashboard | `openssl rand -base64 32` |
| `ENCRYPTION_KEY` | ✅ | Clé AES-256 en hex (64 chars) | `openssl rand -hex 32` |
| `ADMIN_EMAIL` | ✅ | Email admin initial | `admin@example.com` |
| `ADMIN_PASSWORD` | ✅ | Mot de passe admin initial | — |
| `DATABASE_URL` | ✅ | URL de connexion PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `REDIS_URL` | ✅ | URL Redis | `redis://:pass@host:6379` |
| `X_WRITE_KEY` | ✅ | Clé API écriture (server-side) | — |
| `X_READ_KEY` | ✅ | Clé API lecture (client-safe) | — |
| `API_URL` | ✅ (Option A) | URL publique de l'API (pour le web) | `https://pay.example.com/api/v1` |
| `CORS_ORIGIN` | ⚠️ Production | Origines CORS autorisées | `https://pay.example.com` |
| `TRAEFIK_AUTH` | ✅ Option B | Auth basique dashboard Traefik | `htpasswd -nb admin pass` |

> **Génération des secrets :**
> ```bash
> JWT_SECRET=$(openssl rand -base64 32)
> ENCRYPTION_KEY=$(openssl rand -hex 32)
> X_WRITE_KEY=$(openssl rand -hex 20)
> X_READ_KEY=$(openssl rand -hex 20)
> ```

---

## Premiers pas après installation

1. **Connexion** — `http(s)://votre-domaine` avec `ADMIN_EMAIL` / `ADMIN_PASSWORD`
2. **Changer le mot de passe** — La plateforme vous le demande lors de la première connexion
3. **Créer un projet** — Allez dans Projects → New Project
4. **Configurer un provider** — Allez dans Providers → Wave ou Orange Money (voir [Configuration des providers](#configuration-des-providers))
5. **Tester le provider** — Bouton "Test Payment" une fois secrets + webhook configurés
6. **Ajouter un webhook** — Settings → Webhooks → votre endpoint de réception
7. **Intégrer l'API** — Utilisez `X_WRITE_KEY` côté serveur pour initier des paiements

---

## API Reference

Base URL : `https://votre-domaine/api/v1`

### Authentification

NexPay utilise deux mécanismes d'authentification selon l'usage.

#### Dashboard (JWT)

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "votre-mot-de-passe"
}
```

Retourne un token JWT à passer dans le header `Authorization: Bearer <token>` pour toutes les routes dashboard.

#### API Paiements (x-api-key)

Toutes les requêtes de paiement requièrent :

```http
x-api-key: YOUR_KEY
```

Deux types de clés :

| Type | Variable | Usage | Sécurité |
|---|---|---|---|
| **Write Key** | `X_WRITE_KEY` | Initier des paiements, créer des sessions | Côté serveur uniquement — ne jamais exposer |
| **Read Key** | `X_READ_KEY` | Lire le statut d'une session | Sûre côté client (JavaScript frontend) |

---

### Paiement direct

Le paiement direct convient quand votre app sait déjà quel provider utiliser (app mobile, etc.). Vous gérez l'interface de paiement.

#### `POST /payment/initiate`

**Auth :** `x-api-key` (write key)

```http
POST /api/v1/payment/initiate
x-api-key: YOUR_WRITE_KEY
Content-Type: application/json

{
  "amount": 5000,
  "currency": "XOF",
  "provider": "wave",
  "phone": "+221771234567",
  "projectId": "cmhciopb000049ugoic8kqhyj",

  "userId": "user-uuid",
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "client_reference": "ORDER-123",
  "metadata": { "order_id": "ORDER-123" },
  "successUrl": "https://monsite.com/success",
  "failureUrl": "https://monsite.com/error"
}
```

**Champs obligatoires :** `amount`, `phone`, `provider`, `projectId`

**Réponse `201` :**
```json
{
  "statusCode": 201,
  "message": "Payment successfully initiated",
  "data": {
    "amount": 5000,
    "currency": "XOF",
    "reference": "NEXPAY_TX_A819BE1284654995",
    "provider": {
      "id": "...",
      "name": "Wave",
      "code": "wave",
      "logoUrl": "https://votre-domaine/api/v1/media/images/logos/wave.png"
    },
    "payer": {
      "userId": "user-uuid",
      "email": "jean@example.com",
      "phone": "+221771234567",
      "name": "Jean Dupont"
    },
    "checkout_urls": [
      {
        "name": "Wave",
        "url": "https://pay.wave.com/m/xxx",
        "thumb": "https://votre-domaine/api/v1/media/images/thumbs/wave.png"
      }
    ],
    "qr_code": {
      "data": "iVBORw0KGgo..."
    },
    "expiration": "2025-10-30T18:47:53.185Z"
  }
}
```

**Utilisation du résultat :**
```javascript
// Afficher le QR code
const img = document.createElement('img');
img.src = `data:image/png;base64,${data.qr_code.data}`;

// Ou rediriger vers l'app de paiement
window.location.href = data.checkout_urls[0].url;
```

---

### Session de paiement

La session de paiement délègue la sélection du provider au checkout hébergé de NexPay. Idéal pour les sites e-commerce standards.

**Cycle de vie d'une session :**
```
opened ──► pending ──► completed
                  └──► failed
       └──► expired (après 1 heure sans action)
```

#### `POST /payment/session/initiate`

**Auth :** `x-api-key` (write key)

```http
POST /api/v1/payment/session/initiate
x-api-key: YOUR_WRITE_KEY
Content-Type: application/json

{
  "amount": 10000,
  "currency": "XOF",
  "phone": "+221771234567",
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "userId": "user-uuid",
  "client_reference": "ORDER-123",
  "projectId": "cmhciopb000049ugoic8kqhyj",

  "successUrl": "https://monsite.com/success",
  "failureUrl": "https://monsite.com/error",
  "metadata": { "order_id": "ORDER-123" },

  "items": [
    {
      "label": "Abonnement mensuel",
      "unitPrice": 9000,
      "quantity": 1,
      "taxRate": 18,
      "discount": 0
    }
  ]
}
```

**Champs obligatoires :** `amount`, `phone`, `name`, `email`, `userId`, `client_reference`, `projectId`

**Réponse `201` :**
```json
{
  "statusCode": 201,
  "message": "Payment session successfully initiated",
  "data": {
    "sessionId": "cmhdpuj6m00069usa10370ldr",
    "checkoutUrl": "https://votre-domaine/checkout/cmhdpuj6m00069usa10370ldr",
    "status": "opened",
    "expiresAt": "2025-10-30T18:46:25.053Z"
  }
}
```

```javascript
// Rediriger vers le checkout NexPay
window.location.href = response.data.checkoutUrl;
```

---

#### `GET /payment/session/{id}`

**Auth :** `x-api-key` (read key — sûr côté client)

Retourne l'état complet de la session, les providers disponibles et les données de paiement (une fois le checkout effectué).

```http
GET /api/v1/payment/session/cmhdpuj6m00069usa10370ldr
x-api-key: YOUR_READ_KEY
```

**Réponse `200` :**
```json
{
  "statusCode": 200,
  "data": {
    "id": "cmhdpuj6m00069usa10370ldr",
    "status": "opened",
    "amount": "10000",
    "currency": "XOF",
    "expiresAt": "2025-10-30T18:46:25.053Z",
    "paymentData": null,
    "checkoutUrl": "https://votre-domaine/checkout/cmhdpuj6m00069usa10370ldr",
    "providers": [
      { "id": "...", "name": "Orange Money", "code": "om", "logoUrl": "..." },
      { "id": "...", "name": "Wave", "code": "wave", "logoUrl": "..." }
    ],
    "payer": { "name": "Jean Dupont", "email": "...", "phone": "..." },
    "project": { "id": "...", "name": "Mon Projet" }
  }
}
```

> `paymentData` est `null` jusqu'au checkout. Après `POST /checkout`, il contient les URLs de paiement et le QR code.

---

#### `POST /payment/session/{id}/checkout`

**Auth :** `x-api-key` (read key)

Déclenche l'initiation du paiement pour le provider choisi par l'utilisateur. C'est cette route que le checkout frontend appelle.

```http
POST /api/v1/payment/session/cmhdpuj6m00069usa10370ldr/checkout
x-api-key: YOUR_READ_KEY
Content-Type: application/json

{
  "provider": "om",
  "successUrl": "https://monsite.com/success",
  "failureUrl": "https://monsite.com/error"
}
```

**Champs obligatoires :** `provider`

**Réponse `201` :** Identique à la réponse de `POST /payment/initiate` (amount, checkout_urls, qr_code, expiration…)

> Si le même provider est sélectionné une deuxième fois et que les données ne sont pas expirées, les données en cache sont retournées directement sans appel provider.

---

#### `POST /payment/session/{id}/status`

**Auth :** `x-api-key` (read key)

Long-polling côté serveur : attend jusqu'à 30 secondes que le statut passe de `pending`. Utilisé par le frontend checkout pour détecter la fin du paiement.

```http
POST /api/v1/payment/session/cmhdpuj6m00069usa10370ldr/status
x-api-key: YOUR_READ_KEY
```

**Réponse `200` :**
```json
{
  "sessionId": "cmhdpuj6m00069usa10370ldr",
  "status": "completed",
  "redirectUrl": "https://monsite.com/success"
}
```

- `redirectUrl` est `null` si le statut n'est ni `completed` ni `failed`
- Si la session est toujours `pending` après 30 secondes, retourne le statut actuel avec `redirectUrl: null`

**Polling depuis le client (alternative) :**
```javascript
// Option 1 — long-polling serveur (recommandé pour les webhooks rapides)
const result = await fetch(`/api/v1/payment/session/${sessionId}/status`, {
  method: 'POST',
  headers: { 'x-api-key': READ_KEY }
});
const { status, redirectUrl } = (await result.json()).data;
if (redirectUrl) window.location.href = redirectUrl;

// Option 2 — polling client (si vous préférez contrôler l'intervalle)
const poll = setInterval(async () => {
  const res = await fetch(`/api/v1/payment/session/${sessionId}`, {
    headers: { 'x-api-key': READ_KEY }
  });
  const { status } = (await res.json()).data;
  if (status === 'completed') { clearInterval(poll); /* succès */ }
  if (status === 'failed') { clearInterval(poll); /* échec */ }
}, 3000);
```

---

#### `POST /payment/session/providers/{code}/test`

**Auth :** JWT (dashboard uniquement)

Teste les credentials d'un provider en créant une session réelle de test. Met à jour les flags `hasValidSecretConfig` et `hastSecretTestPassed` sur le provider.

```http
POST /api/v1/payment/session/providers/wave/test
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "amount": 100,
  "phone": "+221771234567",
  "projectId": "cmhciopb000049ugoic8kqhyj"
}
```

---

### Webhooks entrants (providers)

Ces endpoints reçoivent les callbacks des providers et mettent à jour le statut des transactions. Ils ne requièrent pas d'authentification applicative — la validation se fait via signature (configurée dans Providers > Settings > Webhook).

#### `POST /webhook/wave`

```json
{
  "id": "EV_QvEZuDSQbLdI",
  "type": "checkout.session.completed",
  "data": {
    "id": "cos-18qq25rgr100a",
    "amount": "5000",
    "client_reference": "NEXPAY_TX_A819BE1284654995",
    "payment_status": "succeeded"
  }
}
```

Types supportés : `checkout.session.completed`, `checkout.session.payment_failed`

#### `POST /webhook/om`

```json
{
  "amount": { "value": 5000, "unit": "XOF" },
  "reference": "NEXPAY_TX_A819BE1284654995",
  "transactionId": "MP250827.1838.C30884",
  "status": "SUCCESS"
}
```

Statuts supportés : `SUCCESS`, `FAILED`, `PENDING`

**URL à configurer chez les providers :**
```
Wave  : https://votre-domaine/api/v1/webhook/wave
OM    : https://votre-domaine/api/v1/webhook/om
```

---

## Webhooks sortants (vers votre app)

NexPay notifie votre application à chaque changement de statut de transaction. Configurez vos webhooks dans le dashboard : Settings → Webhooks.

### Structure d'un événement

```json
{
  "type": "payment.succeeded",
  "data": {
    "amount": 5000,
    "status": "SUCCEEDED",
    "client_reference": "ORDER-123",
    "resolvedAt": "2025-10-30T17:29:58.109Z",
    "payer": {
      "userId": "user-uuid",
      "userPhone": "+221771234567",
      "userEmail": "client@example.com",
      "UserName": "Jean Dupont"
    },
    "provider": { "name": "Wave" },
    "project": { "id": "proj-id", "name": "Mon Projet" },
    "metadata": { "order_id": "ORDER-123" }
  }
}
```

**Types d'événements :** `payment.succeeded`, `payment.failed`

### Vérification de la signature

Le secret configuré dans le dashboard est envoyé dans le header que vous avez défini (ex. `x-webhook-secret`). Sa valeur est le secret en clair (décrypté avant envoi).

```javascript
// Express.js
app.post('/webhook/nexpay', express.json(), (req, res) => {
  const receivedSecret = req.headers['x-webhook-secret'];

  if (receivedSecret !== process.env.NEXPAY_WEBHOOK_SECRET) {
    return res.status(401).send('Unauthorized');
  }

  const { type, data } = req.body;

  if (type === 'payment.succeeded') {
    // Marquer la commande comme payée
    // data.metadata.order_id contient votre référence
  }

  res.status(200).send('OK');
});
```

> **Important :** Toujours répondre `200 OK` rapidement. NexPay n'implémente pas de retry automatique pour le moment.

---

## Configuration des providers

### Providers disponibles

| Code | Nom | Secrets requis |
|---|---|---|
| `wave` | Wave | `api_key` |
| `om` | Orange Money | `client_id`, `client_secret`, `name`, `code` |

Les providers sont inactifs par défaut. Un provider n'est activable que si ses secrets ET son webhook sont configurés.

### Wave

**Dashboard → Providers → Wave**

1. **Onglet "Secrets"** — Entrez votre `api_key` Wave
2. **Onglet "Webhook"** — Choisissez le type d'auth et entrez le secret
   - `sharedSecret` : secret partagé simple (min. 20 caractères)
   - `hmac` : authentification cryptographique (recommandé)
3. **Test Payment** — Vérifiez l'intégration depuis le dashboard
4. **URL webhook à configurer chez Wave :**
   ```
   https://votre-domaine/api/v1/webhook/wave
   ```

### Orange Money

**Dashboard → Providers → Orange Money**

1. **Onglet "Secrets"** — Entrez `client_id`, `client_secret`, `name`, `code`
2. **Onglet "Webhook"** — Deux options :
   - `autoConfigure: true` : NexPay configure automatiquement le webhook chez OM et génère le secret
   - `autoConfigure: false` : Fournissez votre propre secret (min. 20 caractères)
3. **URL webhook à configurer chez Orange Money :**
   ```
   https://votre-domaine/api/v1/webhook/om
   ```

---

## Gestion multi-projets

Une instance NexPay gère plusieurs projets indépendants. Chaque projet a :
- Ses propres transactions et statistiques
- Ses propres webhooks sortants
- Ses propres URLs de redirection (success/failure)

Les providers (Wave, OM) sont configurés **une seule fois** et partagés entre tous les projets.

Chaque requête API de paiement doit inclure un `projectId` :

```json
{
  "amount": 5000,
  "projectId": "cmhciopb000049ugoic8kqhyj",
  ...
}
```

Récupérez l'ID de votre projet depuis `GET /api/v1/projects` (auth JWT) ou via le dashboard.

---

## Mise à jour

### Option A (image pré-construite)

```bash
docker compose pull
docker compose up -d
```

### Option B/C (build depuis les sources)

```bash
git pull origin main
docker compose -f docker-compose-prod.yml up -d --build
```

Les migrations Prisma sont exécutées automatiquement au redémarrage.

---

## Sauvegarde

```bash
# Dump PostgreSQL
docker exec nexpay-db pg_dump -U nexpay nexpay > backup_$(date +%Y%m%d).sql

# Restauration
docker exec -i nexpay-db psql -U nexpay nexpay < backup_20251030.sql

# Sauvegarder les médias (logos providers)
tar -czf media_backup.tar.gz ./media/
```

---

## Licence

MIT — [Mouhamed Lamotte](https://mouhamedlamotte.thenexcom.com)
