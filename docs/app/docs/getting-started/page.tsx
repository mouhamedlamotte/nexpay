import { CodeBlock } from "@/components/code-block"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import Image from "next/image"

export default function GettingStartedPage() {
  return (
    <div className="max-w-4xl prose prose-invert">
      <h1>Démarrage</h1>
      <p className="lead">
        Apprenez comment installer, configurer et déployer NexPay sur votre propre serveur. Ce guide vous accompagnera à
        travers le processus complet de configuration.
      </p>

      <h2 id="installation">Installation</h2>
      <p>
        NexPay est une passerelle de paiement auto-hébergée que vous déployez sur votre propre infrastructure. Suivez
        ces étapes pour commencer :
      </p>

      <h3>Installation Automatique (Recommandée)</h3>
      <p>
        Utilisez le script d'installation automatique qui configure tout pour vous, y compris Traefik comme reverse
        proxy :
      </p>
      <CodeBlock
        language="bash"
        code={`curl -fsSL https://raw.githubusercontent.com/mouhamedlamotte/nexpay/main/install.sh | bash -s -- pay.votredomaine.com`}
      />

      <Alert className="my-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Remplacez <code>pay.votredomaine.com</code> par votre propre domaine. Le script installera automatiquement
          NexPay avec Traefik configuré.
        </AlertDescription>
      </Alert>

      <p>Le script d'installation va :</p>
      <ul>
        <li>Installer toutes les dépendances nécessaires</li>
        <li>Configurer Traefik comme reverse proxy (pas besoin de configurer Nginx)</li>
        <li>Générer les certificats SSL automatiquement</li>
        <li>Créer les fichiers de configuration</li>
        <li>Démarrer l'application</li>
      </ul>

      <h3>Installation Manuelle</h3>
      <p>Si vous préférez installer manuellement :</p>

      <h4>1. Cloner le Dépôt</h4>
      <CodeBlock
        language="bash"
        code={`git clone https://github.com/mouhamedlamotte/nexpay.git
cd nexpay`}
      />

      <h4>2. Installer les Dépendances</h4>
      <CodeBlock
        language="bash"
        code={`npm install
# ou
yarn install`}
      />

      <h4>3. Configurer les Variables d'Environnement</h4>
      <p>
        Créez un fichier <code>.env</code> dans le répertoire racine avec les variables suivantes :
      </p>
      <CodeBlock
        language="bash"
        code={`# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/nexpay"

# Application
PORT=9090
NODE_ENV=production
APP_URL=https://votredomaine.com

# Secret JWT
JWT_SECRET=votre-secret-jwt-super-securise

# Identifiants Admin (pour la première connexion)
ADMIN_EMAIL=admin@votredomaine.com
ADMIN_PASSWORD=votre-mot-de-passe-securise`}
      />

      <Alert className="my-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Assurez-vous d'utiliser des valeurs fortes et uniques pour JWT_SECRET et ADMIN_PASSWORD en production.
        </AlertDescription>
      </Alert>

      <h4>4. Exécuter les Migrations de Base de Données</h4>
      <CodeBlock
        language="bash"
        code={`npm run migrate
# ou
yarn migrate`}
      />

      <h4>5. Démarrer l'Application</h4>
      <CodeBlock
        language="bash"
        code={`npm run start
# ou
yarn start`}
      />

      <h2 id="domain-configuration">Configuration du Domaine</h2>
      <p>Pointez votre domaine vers votre serveur où NexPay est en cours d'exécution :</p>
      <ul>
        <li>
          <strong>Domaine Principal :</strong> <code>votredomaine.com</code> - Pour le tableau de bord et l'API
        </li>
        <li>
          <strong>Certificat SSL :</strong> Traefik génère automatiquement les certificats Let's Encrypt
        </li>
        <li>
          <strong>Reverse Proxy :</strong> Traefik est déjà configuré (pas besoin de Nginx)
        </li>
      </ul>

      <h2 id="first-login">Première Connexion</h2>
      <p>
        Après l'installation, accédez au tableau de bord à <code>https://votredomaine.com/admin</code> et connectez-vous
        avec les identifiants que vous avez définis dans les variables d'environnement.
      </p>

      <div className="my-8">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20from%202025-10-31%2011-02-48-RpXkQDVhGpKTHwyiEFoJoMwl0FVZXP.png"
          alt="Tableau de bord NexPay"
          width={1200}
          height={800}
          className="rounded-lg border border-border"
        />
        <p className="text-sm text-muted-foreground text-center mt-2">Tableau de bord NexPay</p>
      </div>

      <h2 id="next-steps">Prochaines Étapes</h2>
      <p>Maintenant que NexPay est installé, vous pouvez :</p>
      <ul>
        <li>
          <a href="/docs/providers">Configurer les providers de paiement</a> (Orange Money, Wave, etc.)
        </li>
        <li>
          <a href="/docs/dashboard#projects">Créer votre premier projet</a>
        </li>
        <li>
          <a href="/docs/webhooks">Configurer les webhooks</a> pour les notifications de paiement
        </li>
        <li>
          <a href="/docs/api">Intégrer l'API</a> dans votre application
        </li>
      </ul>
    </div>
  )
}
