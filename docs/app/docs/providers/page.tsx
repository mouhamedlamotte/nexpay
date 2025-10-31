import { CodeBlock } from "@/components/code-block"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default function ProvidersPage() {
  return (
    <div className="max-w-4xl prose prose-invert">
      <h1>Providers de Paiement</h1>
      <p className="lead">
        Configurez les providers de paiement pour commencer à accepter des paiements. NexPay prend en charge plusieurs
        providers avec une configuration unique et unifiée.
      </p>

      <h2 id="overview">Vue d'ensemble</h2>
      <p>
        NexPay utilise un système de configuration centralisé des providers. Vous configurez chaque provider une fois,
        et tous vos projets peuvent utiliser les mêmes identifiants de provider.
      </p>

      <Alert className="my-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Les configurations des providers sont partagées entre tous les projets. Cela signifie que vous n'avez besoin
          de configurer Orange Money, Wave, etc. qu'une seule fois.
        </AlertDescription>
      </Alert>

      <h2 id="configuration">Configuration des Providers</h2>
      <p>Pour configurer un provider de paiement :</p>
      <ol>
        <li>
          Accédez à <strong>Providers</strong> dans votre tableau de bord
        </li>
        <li>
          Cliquez sur <strong>Configurer</strong> à côté du provider que vous souhaitez configurer
        </li>
        <li>Entrez vos identifiants API du provider</li>
        <li>Sauvegardez la configuration</li>
      </ol>

      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20from%202025-10-31%2011-02-57-fibOOuVN9k9HWdaHELCmMQgGyBhrG5.png"
        alt="Configuration des Providers"
        className="rounded-lg border border-border"
      />

      <h2 id="orange-money">Orange Money</h2>
      <p>Orange Money est un service de mobile money disponible en Afrique de l'Ouest et Centrale.</p>

      <h3>Identifiants Requis</h3>
      <ul>
        <li>
          <strong>Client ID :</strong> Votre identifiant client API Orange Money
        </li>
        <li>
          <strong>Client Secret :</strong> Votre secret client API Orange Money
        </li>
        <li>
          <strong>Name :</strong> Nom d'affichage (ex: "Orange Money")
        </li>
        <li>
          <strong>Code :</strong> Code du provider (<code>om</code>)
        </li>
      </ul>

      <h3>Obtention des Identifiants</h3>
      <ol>
        <li>
          Visitez le{" "}
          <a href="https://developer.orange-sonatel.com/" target="_blank" rel="noreferrer noopener">
            Portail Développeur Orange
          </a>
        </li>
        <li>Créez un compte ou connectez-vous</li>
        <li>Créez une nouvelle application</li>
        <li>Abonnez-vous à l'API Orange Money</li>
        <li>Copiez votre Client ID et Client Secret</li>
      </ol>

      <h3>Configuration du Webhook</h3>
      <p>Configurez Orange Money pour envoyer des webhooks à NexPay :</p>
      <CodeBlock language="text" code={`URL du Webhook: https://votre-domaine.com/api/v1/webhook/om`} />

      <h3>Tests</h3>
      <p>Orange Money fournit un environnement sandbox pour les tests :</p>
      <CodeBlock
        language="json"
        code={`{
  "client_id": "votre_client_id_sandbox",
  "client_secret": "votre_client_secret_sandbox"
}`}
      />

      <h2 id="wave">Wave</h2>
      <p>Wave est une plateforme de mobile money opérant dans plusieurs pays africains.</p>

      <h3>Identifiants Requis</h3>
      <ul>
        <li>
          <strong>API Key :</strong> Votre clé API Wave
        </li>
        <li>
          <strong>Name :</strong> Nom d'affichage (ex: "Wave")
        </li>
        <li>
          <strong>Code :</strong> Code du provider (<code>wave</code>)
        </li>
      </ul>

      <h3>Obtention des Identifiants</h3>
      <ol>
        <li>
          Visitez le{" "}
          <a href="https://business.wave.com/" target="_blank" rel="noreferrer noopener">
            Portail Développeur Wave
          </a>
        </li>
        <li>Créez un compte professionnel</li>
        <li>Accédez aux paramètres API</li>
        <li>Générez une clé API</li>
      </ol>

      <h3>Configuration du Webhook</h3>
      <p>Configurez Wave pour envoyer des webhooks à NexPay :</p>
      <CodeBlock language="text" code={`URL du Webhook: https://votre-domaine.com/api/v1/webhook/wave`} />

      <h2 id="multiple-projects">Utilisation des Providers sur Plusieurs Projets</h2>
      <p>
        Une fois que vous avez configuré un provider, il est automatiquement disponible pour tous vos projets. Vous
        n'avez pas besoin de reconfigurer les identifiants pour chaque projet.
      </p>

      <h3>Exemple : Utilisation d'Orange Money sur Plusieurs Projets</h3>
      <ol>
        <li>Configurez Orange Money une fois dans la section Providers</li>
        <li>Créez le Projet A et le Projet B</li>s
        <li>Les deux projets peuvent maintenant accepter les paiements Orange Money</li>
        <li>Chaque projet peut avoir des URLs de redirection et des webhooks différents</li>
      </ol>

      <h2 id="provider-codes">Codes des Providers</h2>
      <p>Utilisez ces codes lors de l'initiation de paiements via l'API :</p>
      <ul>
        <li>
          <code>om</code> - Orange Money
        </li>
        <li>
          <code>wave</code> - Wave
        </li>
      </ul>

      <CodeBlock
        language="json"
        code={`{
  "amount": 5000,
  "currency": "XOF",
  "provider": "om",  // Utilisez le code du provider ici
  "userId": "user_123",
  // ... autres champs
}`}
      />

      <h2 id="troubleshooting">Dépannage</h2>

      <h3>Provider Non Disponible</h3>
      <p>Si un provider n'apparaît pas dans vos options de paiement :</p>
      <ul>
        <li>Vérifiez que le provider est configuré dans la section Providers</li>
        <li>Vérifiez que le statut du provider est "Actif"</li>
        <li>Assurez-vous que vos identifiants API sont corrects</li>
      </ul>

      <h3>Webhook Ne Reçoit Pas d'Événements</h3>
      <p>Si vous ne recevez pas d'événements webhook d'un provider :</p>
      <ul>
        <li>Vérifiez que l'URL du webhook est correctement configurée dans le tableau de bord du provider</li>
        <li>Vérifiez que votre serveur est accessible depuis Internet</li>
        <li>Assurez-vous que SSL est correctement configuré (les providers nécessitent HTTPS)</li>
        <li>Vérifiez les logs des webhooks dans le tableau de bord du provider</li>
      </ul>
    </div>
  )
}
