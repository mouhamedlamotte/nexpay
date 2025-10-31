import { CodeBlock } from "@/components/code-block"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Info } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function WebhooksPage() {
  return (
    <div className="max-w-4xl prose prose-invert">
      <h1>Webhooks</h1>
      <p className="lead">
        Les webhooks vous permettent de recevoir des notifications en temps réel sur les événements de paiement. NexPay
        prend en charge à la fois les webhooks des providers et les webhooks d'application.
      </p>

      <h2 id="overview">Vue d'ensemble</h2>
      <p>NexPay utilise les webhooks de deux manières :</p>
      <ul>
        <li>
          <strong>Webhooks des Providers :</strong> Recevoir des notifications des providers de paiement (Orange Money,
          Wave, etc.)
        </li>
        <li>
          <strong>Webhooks d'Application :</strong> Envoyer des notifications à votre application sur les événements de
          paiement
        </li>
      </ul>

      <h2 id="provider-webhooks">Webhooks des Providers</h2>
      <p>
        Configurez vos providers de paiement pour envoyer des notifications webhook à NexPay. Cela permet à NexPay de
        suivre l'état des paiements en temps réel.
      </p>

      <h3>URLs des Webhooks</h3>
      <p>Chaque provider a un endpoint webhook dédié :</p>
      <CodeBlock
        language="text"
        code={`Orange Money: https://votre-domaine.com/api/v1/webhook/om
Wave: https://votre-domaine.com/api/v1/webhook/wave`}
      />

      <Alert className="my-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Configurez ces URLs dans le tableau de bord de votre provider (Orange Money, Wave, etc.) pour recevoir les
          notifications de paiement.
        </AlertDescription>
      </Alert>


      <h2 id="application-webhooks">Webhooks d'Application</h2>
      <p>
        Configurez NexPay pour envoyer des notifications webhook à votre application lorsque des événements de paiement
        se produisent.
      </p>

      <h3>Configuration</h3>
      <p>Configurez les webhooks d'application depuis votre tableau de bord :</p>
      <ol>
        <li>
          Accédez à <strong>Paramètres → Webhooks</strong>
        </li>
        <li>
          Cliquez sur <strong>Nouveau webhook</strong>
        </li>
        <li>
          Entrez votre URL de webhook (ex: <code>https://votreapp.com/webhooks/nexpay</code>)
        </li>
        <li>
          Définissez un nom d'en-tête (ex: <code>x-webhook-secret</code>)
        </li>
        <li>Générez et sauvegardez une clé secrète pour la vérification</li>
      </ol>

      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20from%202025-10-31%2011-03-15-s4OG7yTTwUy0Izq5An9S7lJS4U224y.png"
        alt="Configuration des Webhooks"
        className="rounded-lg border border-border"
      />

      <h3>Types d'Événements</h3>
      <p>NexPay envoie les événements webhook suivants :</p>
      <ul>
        <li>
          <code>payment.succeeded</code> - Paiement effectué avec succès
        </li>
        <li>
          <code>payment.failed</code> - Paiement échoué
        </li>
      </ul>

      <h3>Payload du Webhook</h3>
      <p>Exemple de payload webhook envoyé à votre application :</p>
      <CodeBlock
        language="json"
        code={`{
  "type": "payment.succeeded",
  "data": {
    "amount": "100800",
    "client_reference": "nexpay-ref-30-10-2025",
    "status": "SUCCEEDED",
    "resolvedAt": "2025-10-30T17:29:58.109Z",
    "payer": {
      "userId": "1f31dfd7-aec8-4adf-84ff-4a9c1981be2a",
      "userPhone": "+22177123456",
      "userEmail": "john@example.com",
      "UserName": "John Doe"
    },
    "provider": {
      "name": "Orange Money"
    },
    "project": {
      "id": "proj_abc123",
      "name": "Mon Projet"
    },
    "metadata": {
      "orderId": "789",
      "productName": "Plan Premium"
    }
  }
}`}
      />

      <h2 id="verification">Vérification des Webhooks</h2>
      <p>Vérifiez toujours les signatures des webhooks pour vous assurer que les requêtes proviennent de NexPay.</p>

      <Alert className="my-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Ne traitez jamais les événements webhook sans vérifier la signature. Cela empêche les acteurs malveillants
          d'envoyer de fausses notifications de paiement.
        </AlertDescription>
      </Alert>

      <h3>Processus de Vérification</h3>
      <p>
        NexPay inclut votre clé secrète dans l'en-tête que vous avez spécifié lors de la configuration. Vérifiez que cet
        en-tête correspond à votre secret :
      </p>

      <Tabs defaultValue="nodejs" className="my-6">
        <TabsList>
          <TabsTrigger value="nodejs">Node.js</TabsTrigger>
          <TabsTrigger value="python">Python</TabsTrigger>
          <TabsTrigger value="php">PHP</TabsTrigger>
        </TabsList>
        <TabsContent value="nodejs">
          <CodeBlock
            language="javascript"
            code={`// Exemple Express.js
app.post('/webhooks/nexpay', (req, res) => {
  const signature = req.headers['x-webhook-secret'];
  const expectedSecret = process.env.NEXPAY_WEBHOOK_SECRET;

  // Vérifier la signature
  if (signature !== expectedSecret) {
    return res.status(401).json({ error: 'Signature invalide' });
  }

  // Traiter le webhook
  const event = req.body;
  
  if (event.type === 'payment.succeeded') {
    // Gérer le paiement réussi
    console.log('Paiement réussi:', event.data);
    // Mettre à jour votre base de données, envoyer un email de confirmation, etc.
  }

  res.status(200).json({ received: true });
});`}
          />
        </TabsContent>
        <TabsContent value="python">
          <CodeBlock
            language="python"
            code={`from flask import Flask, request, jsonify
import os

app = Flask(__name__)

@app.route('/webhooks/nexpay', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('x-webhook-secret')
    expected_secret = os.environ.get('NEXPAY_WEBHOOK_SECRET')
    
    # Vérifier la signature
    if signature != expected_secret:
        return jsonify({'error': 'Signature invalide'}), 401
    
    # Traiter le webhook
    event = request.json
    
    if event['type'] == 'payment.succeeded':
        # Gérer le paiement réussi
        print('Paiement réussi:', event['data'])
        # Mettre à jour votre base de données, envoyer un email de confirmation, etc.
    
    return jsonify({'received': True}), 200`}
          />
        </TabsContent>
        <TabsContent value="php">
          <CodeBlock
            language="php"
            code={`<?php
// webhook.php

$signature = $_SERVER['HTTP_X_WEBHOOK_SECRET'] ?? '';
$expectedSecret = getenv('NEXPAY_WEBHOOK_SECRET');

// Vérifier la signature
if ($signature !== $expectedSecret) {
    http_response_code(401);
    echo json_encode(['error' => 'Signature invalide']);
    exit;
}

// Traiter le webhook
$event = json_decode(file_get_contents('php://input'), true);

if ($event['type'] === 'payment.succeeded') {
    // Gérer le paiement réussi
    error_log('Paiement réussi: ' . json_encode($event['data']));
    // Mettre à jour votre base de données, envoyer un email de confirmation, etc.
}

http_response_code(200);
echo json_encode(['received' => true]);
?>`}
          />
        </TabsContent>
      </Tabs>

      <h2 id="best-practices">Bonnes Pratiques</h2>
      <ul>
        <li>
          <strong>Répondez rapidement :</strong> Retournez un code de statut 200 dès que possible
        </li>
        <li>
          <strong>Traitement asynchrone :</strong> Mettez en file d'attente le traitement des webhooks pour les
          opérations lourdes
        </li>
        <li>
          <strong>Gérez les doublons :</strong> Utilisez <code>client_reference</code> pour éviter le traitement en
          double
        </li>
        <li>
          <strong>Logique de réessai :</strong> NexPay réessaiera les webhooks échoués jusqu'à 3 fois
        </li>
        <li>
          <strong>Surveillez les échecs :</strong> Vérifiez les logs des webhooks dans votre tableau de bord
        </li>
      </ul>
    </div>
  )
}
