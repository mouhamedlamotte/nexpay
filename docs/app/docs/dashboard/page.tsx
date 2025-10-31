import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="max-w-4xl prose prose-invert">
      <h1>Guide du Tableau de Bord</h1>
      <p className="lead">
        Apprenez à utiliser le tableau de bord NexPay pour gérer votre infrastructure de paiement, configurer les
        providers et surveiller les transactions.
      </p>

      <h2 id="overview">Vue d'ensemble</h2>
      <p>
        Le tableau de bord NexPay est votre hub central pour gérer tous les aspects de votre passerelle de paiement.
        Depuis ici, vous pouvez :
      </p>
      <ul>
        <li>Configurer les providers de paiement</li>
        <li>Gérer plusieurs projets</li>
        <li>Configurer les webhooks et les URLs de redirection</li>
        <li>Surveiller les transactions et les paiements</li>
        <li>Générer des clés API</li>
      </ul>

      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20from%202025-10-31%2011-02-48-RpXkQDVhGpKTHwyiEFoJoMwl0FVZXP.png"
        alt="Tableau de Bord NexPay"
        className="rounded-lg border border-border"
      />

      <h2 id="projects">Projets</h2>
      <p>
        Les projets vous permettent d'organiser les paiements pour différentes applications ou environnements. Chaque
        projet a ses propres :
      </p>
      <ul>
        <li>Clés API</li>
        <li>Configurations de webhooks</li>
        <li>URLs de redirection</li>
        <li>Historique des transactions</li>
      </ul>

      <Alert className="my-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Tous les projets partagent les mêmes configurations de providers. Vous n'avez besoin de configurer Orange
          Money, Wave, etc. qu'une seule fois.
        </AlertDescription>
      </Alert>

      <h3>Création d'un Projet</h3>
      <ol>
        <li>
          Accédez à <strong>Projets</strong> dans la barre latérale
        </li>
        <li>
          Cliquez sur <strong>Nouveau Projet</strong>
        </li>
        <li>Entrez un nom et une description du projet</li>
        <li>Ajoutez optionnellement des métadonnées (paires clé-valeur)</li>
        <li>
          Cliquez sur <strong>Créer le Projet</strong>
        </li>
      </ol>

      <h3>Paramètres du Projet</h3>
      <p>Chaque projet a les paramètres suivants :</p>
      <ul>
        <li>
          <strong>Général :</strong> Nom, description et métadonnées
        </li>
        <li>
          <strong>Clés API :</strong> Générer et gérer les clés API
        </li>
        <li>
          <strong>Webhooks :</strong> Configurer les endpoints de webhooks
        </li>
        <li>
          <strong>Redirections :</strong> Définir les URLs de succès, d'échec et d'annulation
        </li>
      </ul>

      <h2 id="providers">Providers</h2>
      <p>
        La section Providers vous permet de configurer les providers de paiement qui seront disponibles pour tous vos
        projets.
      </p>

      <h3>Configuration d'un Provider</h3>
      <ol>
        <li>
          Accédez à <strong>Providers</strong>
        </li>
        <li>Trouvez le provider que vous souhaitez configurer (Orange Money, Wave, etc.)</li>
        <li>
          Cliquez sur <strong>Configurer</strong>
        </li>
        <li>Entrez vos identifiants API</li>
        <li>
          Cliquez sur <strong>Sauvegarder la Configuration</strong>
        </li>
      </ol>

      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20from%202025-10-31%2011-02-57-fibOOuVN9k9HWdaHELCmMQgGyBhrG5.png"
        alt="Configuration des Providers"
        className="rounded-lg border border-border"
      />

      <h3>Statut des Providers</h3>
      <p>Les providers peuvent avoir les statuts suivants :</p>
      <ul>
        <li>
          <strong>Actif :</strong> Configuré et prêt à accepter des paiements
        </li>
        <li>
          <strong>Inactif :</strong> Non configuré ou désactivé
        </li>
      </ul>

      <h2 id="webhooks">Webhooks</h2>
      <p>
        Configurez les webhooks pour recevoir des notifications en temps réel sur les événements de paiement dans votre
        application.
      </p>

      <h3>Configuration des Webhooks</h3>
      <ol>
        <li>
          Accédez à <strong>Paramètres → Webhooks</strong>
        </li>
        <li>
          Cliquez sur <strong>Nouveau webhook</strong>
        </li>
        <li>Entrez votre URL de webhook</li>
        <li>
          Définissez un nom d'en-tête (ex: <code>x-webhook-secret</code>)
        </li>
        <li>Générez ou entrez une clé secrète</li>
        <li>
          Cliquez sur <strong>Créer le Webhook</strong>
        </li>
      </ol>

      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20from%202025-10-31%2011-03-15-s4OG7yTTwUy0Izq5An9S7lJS4U224y.png"
        alt="Configuration des Webhooks"
        className="rounded-lg border border-border"
      />

      <Alert className="my-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Sauvegardez votre clé secrète en toute sécurité. Vous en aurez besoin pour vérifier les signatures des
          webhooks dans votre application.
        </AlertDescription>
      </Alert>

      <h2 id="redirects">URLs de Redirection</h2>
      <p>Configurez où les utilisateurs doivent être redirigés après avoir complété, annulé ou échoué un paiement.</p>

      <h3>Configuration des Redirections</h3>
      <ol>
        <li>
          Accédez à <strong>Paramètres → Callbacks de redirection</strong>
        </li>
        <li>
          Entrez vos URLs de redirection :
          <ul>
            <li>
              <strong>URL de Succès :</strong> Où rediriger après un paiement réussi
            </li>
            <li>
              <strong>URL d'Échec :</strong> Où rediriger après un paiement échoué
            </li>
            <li>
              <strong>URL d'Annulation :</strong> Où rediriger si l'utilisateur annule
            </li>
          </ul>
        </li>
        <li>
          Cliquez sur <strong>Sauvegarder les Modifications</strong>
        </li>
      </ol>

      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20from%202025-10-30%2017-59-59-6dJGPwAF7wunaYbxz6bAI54JPv8Djs.png"
        alt="Configuration des Redirections"
        className="rounded-lg border border-border"
      />

      <h3>Paramètres d'URL</h3>
      <p>NexPay ajoute les paramètres de requête suivants à vos URLs de redirection :</p>
      <ul>
        <li>
          <code>session_id</code> - L'ID de la session de paiement
        </li>
        <li>
          <code>status</code> - Statut du paiement (succeeded, failed, canceled)
        </li>
        <li>
          <code>reference</code> - Votre référence client
        </li>
      </ul>

      <h2 id="api-keys">Clés API</h2>
      <p>
        Les clés API sont utilisées pour authentifier les requêtes à l'API NexPay. Chaque projet peut avoir plusieurs
        clés API.
      </p>

      <h3>Génération d'une Clé API</h3>
      <ol>
        <li>Accédez aux paramètres de votre projet</li>
        <li>
          Allez dans l'onglet <strong>Clés API</strong>
        </li>
        <li>
          Cliquez sur <strong>Générer une Nouvelle Clé</strong>
        </li>
        <li>Donnez un nom à votre clé (ex: "Production", "Développement")</li>
        <li>Copiez et sauvegardez la clé en toute sécurité</li>
      </ol>

      <Alert className="my-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Les clés API ne sont affichées qu'une seule fois. Assurez-vous de les copier et de les stocker en toute
          sécurité.
        </AlertDescription>
      </Alert>

      <h3>Révocation des Clés API</h3>
      <p>
        Si une clé API est compromise, vous pouvez la révoquer immédiatement depuis la section Clés API. Les clés
        révoquées ne fonctionneront plus pour les requêtes API.
      </p>

      <h2 id="transactions">Transactions</h2>
      <p>Visualisez et surveillez toutes les transactions de paiement sur vos projets.</p>

      <h3>Détails des Transactions</h3>
      <p>Chaque transaction affiche :</p>
      <ul>
        <li>Montant et devise</li>
        <li>Statut du paiement</li>
        <li>Provider utilisé</li>
        <li>Informations du payeur</li>
        <li>Horodatages</li>
        <li>Métadonnées</li>
      </ul>

      <h3>Filtrage des Transactions</h3>
      <p>Filtrez les transactions par :</p>
      <ul>
        <li>Plage de dates</li>
        <li>Statut (succeeded, failed, pending)</li>
        <li>Provider</li>
        <li>Projet</li>
      </ul>
    </div>
  )
}
