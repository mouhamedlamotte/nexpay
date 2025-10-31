import { CodeBlock } from "@/components/code-block"
import Link from "next/link"

export default function GuidesPage() {
  return (
    <div className="max-w-4xl prose prose-invert">
      <h1>Guides d'Intégration</h1>
      <p className="lead">Guides étape par étape pour les scénarios d'intégration courants et les cas d'usage.</p>

      <h2 id="quick-integration">Guide d'Intégration Rapide</h2>
      <p>Ce guide vous accompagne dans l'intégration de NexPay dans une application web en moins de 15 minutes.</p>

      <h3>Étape 1 : Installer NexPay</h3>
      <p>
        Tout d'abord, assurez-vous que NexPay est installé et fonctionne sur votre serveur. Consultez le guide{" "}
        <Link href="/docs/getting-started">Démarrage</Link>.
      </p>

      <h3>Étape 2 : Configurer un Provider</h3>
      <p>
        Configurez au moins un provider de paiement (Orange Money ou Wave) depuis votre tableau de bord. Voir{" "}
        <Link href="/docs/providers">Configuration des Providers</Link>.
      </p>

      <h3>Étape 3 : Créer un Projet</h3>
      <p>Créez un nouveau projet dans votre tableau de bord et générez une clé API.</p>

      <h3>Étape 4 : Initier un Paiement</h3>
      <p>Utilisez l'API pour créer une session de paiement :</p>
      <CodeBlock
        language="javascript"
        code={`const response = await fetch('https://votre-domaine.com/api/v1/payment/session/initiate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer VOTRE_CLE_API',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 5000,
    currency: 'XOF',
    userId: 'user_123',
    name: 'John Doe',
    phone: '+22177123456',
    email: 'john@example.com',
    client_reference: 'order_789',
    projectId: 'votre_project_id',
    successUrl: 'https://votreapp.com/success',
    cancelUrl: 'https://votreapp.com/cancel'
  })
});

const { data } = await response.json();
// Rediriger l'utilisateur vers data.checkoutUrl
window.location.href = data.checkoutUrl;`}
      />

      <h3>Étape 5 : Gérer les Webhooks</h3>
      <p>Configurez un endpoint webhook pour recevoir les notifications de paiement :</p>
      <CodeBlock
        language="javascript"
        code={`app.post('/webhooks/nexpay', (req, res) => {
  const signature = req.headers['x-webhook-secret'];
  
  if (signature !== process.env.NEXPAY_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Signature invalide' });
  }

  const event = req.body;
  
  if (event.type === 'payment.succeeded') {
    // Mettre à jour le statut de la commande dans votre base de données
    await updateOrderStatus(event.data.client_reference, 'paid');
  }

  res.status(200).json({ received: true });
});`}
      />

      <h2 id="direct-payment">Intégration de Paiement Direct</h2>
      <p>
        Pour plus de contrôle, vous pouvez initier des paiements directement avec un provider spécifique au lieu
        d'utiliser des sessions de paiement.
      </p>

      <CodeBlock
        language="javascript"
        code={`const response = await fetch('https://votre-domaine.com/api/v1/payment/initiate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer VOTRE_CLE_API',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 5000,
    currency: 'XOF',
    provider: 'om', // Spécifier le provider directement
    userId: 'user_123',
    name: 'John Doe',
    phone: '+22177123456',
    email: 'john@example.com',
    client_reference: 'order_789',
    projectId: 'votre_project_id'
  })
});

const { data } = await response.json();
// data.checkout_urls contient les liens de paiement
// data.qr_code contient le QR code pour le paiement mobile`}
      />

      <h2 id="testing">Tester Votre Intégration</h2>
      <p>Avant de passer en production, testez votre intégration de manière approfondie :</p>

      <h3>1. Utiliser le Sandbox du Provider</h3>
      <p>Configurez vos providers avec des identifiants sandbox/test.</p>

      <h3>2. Tester le Flux de Paiement</h3>
      <ul>
        <li>Initiez un paiement test</li>
        <li>Complétez le paiement sur la plateforme de test du provider</li>
        <li>Vérifiez que le webhook est reçu</li>
        <li>Vérifiez que les URLs de redirection fonctionnent correctement</li>
      </ul>

      <h3>3. Tester les Scénarios d'Erreur</h3>
      <ul>
        <li>Fonds insuffisants</li>
        <li>Paiements annulés</li>
        <li>Timeouts réseau</li>
        <li>Clés API invalides</li>
      </ul>

      <h2 id="production">Passage en Production</h2>
      <p>Lorsque vous êtes prêt à accepter de vrais paiements :</p>

      <ol>
        <li>Remplacez les identifiants sandbox par les identifiants de production</li>
        <li>Mettez à jour les URLs de webhook vers les endpoints de production</li>
        <li>Assurez-vous que SSL est correctement configuré</li>
        <li>Configurez la surveillance et les alertes</li>
        <li>Testez avec un petit paiement réel</li>
      </ol>

      <h2 id="best-practices">Bonnes Pratiques</h2>

      <h3>Sécurité</h3>
      <ul>
        <li>N'exposez jamais les clés API dans le code côté client</li>
        <li>Vérifiez toujours les signatures des webhooks</li>
        <li>Utilisez HTTPS pour toutes les requêtes API</li>
        <li>Faites tourner les clés API périodiquement</li>
      </ul>

      <h3>Gestion des Erreurs</h3>
      <ul>
        <li>Implémentez une logique de réessai pour les requêtes API échouées</li>
        <li>Enregistrez toutes les tentatives de paiement pour le débogage</li>
        <li>Affichez des messages d'erreur conviviaux</li>
        <li>Ayez un plan de secours pour les échecs de webhook</li>
      </ul>

      <h3>Expérience Utilisateur</h3>
      <ul>
        <li>Affichez des instructions de paiement claires</li>
        <li>Affichez le statut du paiement en temps réel</li>
        <li>Proposez plusieurs options de paiement</li>
        <li>Envoyez des emails de confirmation</li>
      </ul>
    </div>
  )
}
