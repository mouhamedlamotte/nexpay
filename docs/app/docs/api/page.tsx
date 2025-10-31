import { CodeBlock } from "@/components/code-block"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function APIReferencePage() {
  return (
    <div className="max-w-4xl prose prose-invert">
      <h1>Référence API</h1>
      <p className="lead">
        Référence complète pour l'API NexPay. Toutes les requêtes API nécessitent une authentification par clé API.
      </p>

      <h2 id="authentication">Authentification</h2>
      <p>
        NexPay utilise des clés API pour authentifier les requêtes. Vous pouvez générer des clés API depuis votre
        tableau de bord dans les Paramètres du Projet.
      </p>

      <Alert className="my-6">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Incluez votre clé API dans l'en-tête <code>Authorization</code> en tant que token Bearer pour toutes les
          requêtes API.
        </AlertDescription>
      </Alert>

      <CodeBlock
        language="bash"
        code={`curl https://votredomaine.com/api/v1/payment/initiate \\
  -H "Authorization: Bearer VOTRE_CLE_API" \\
  -H "Content-Type: application/json"`}
      />

      <h2 id="base-url">URL de Base</h2>
      <CodeBlock language="text" code={`https://votredomaine.com/api/v1`} />

      <h2 id="endpoints">Endpoints</h2>

      <h3 id="health-check">Vérification de Santé</h3>
      <p>Vérifiez si l'API fonctionne correctement.</p>
      <div className="not-prose">
        <div className="bg-card border border-border rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-mono rounded">GET</span>
            <code className="text-sm">/health</code>
          </div>
        </div>
      </div>

      <Tabs defaultValue="response" className="my-6">
        <TabsList>
          <TabsTrigger value="response">Réponse</TabsTrigger>
        </TabsList>
        <TabsContent value="response">
          <CodeBlock
            language="json"
            code={`{
  "status": "OK",
  "message": "Service is up and running",
  "timestamp": "2025-10-30T17:43:18.925Z"
}`}
          />
        </TabsContent>
      </Tabs>

      <h3 id="initiate-payment">Initier un Paiement</h3>
      <p>Créez une nouvelle transaction de paiement avec un provider spécifique.</p>
      <div className="not-prose">
        <div className="bg-card border border-border rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs font-mono rounded">POST</span>
            <code className="text-sm">/payment/initiate</code>
          </div>
        </div>
      </div>

      <Tabs defaultValue="request" className="my-6">
        <TabsList>
          <TabsTrigger value="request">Requête</TabsTrigger>
          <TabsTrigger value="response">Réponse</TabsTrigger>
          <TabsTrigger value="curl">cURL</TabsTrigger>
          <TabsTrigger value="javascript">JavaScript</TabsTrigger>
        </TabsList>
        <TabsContent value="request">
          <CodeBlock
            language="json"
            code={`{
  "amount": 5000,
  "currency": "XOF",
  "provider": "om",
  "userId": "user_123456",
  "name": "John Doe",
  "phone": "+22177123456",
  "email": "john@example.com",
  "client_reference": "order_789",
  "projectId": "proj_abc123",
  "metadata": {
    "orderId": "789",
    "productName": "Plan Premium"
  }
}`}
          />
        </TabsContent>
        <TabsContent value="response">
          <CodeBlock
            language="json"
            code={`{
  "statusCode": 201,
  "message": "Payment successfully initiated",
  "data": {
    "amount": 5000,
    "provider": {
      "id": "prov_123",
      "name": "Orange Money",
      "code": "om",
      "logoUrl": "https://votredomaine.com/api/v1/media/images/logos/om.png"
    },
    "currency": "XOF",
    "reference": "NEXPAY_TX_A819BE1284654995",
    "payer": {
      "userId": "user_123456",
      "email": "john@example.com",
      "phone": "+22177123456",
      "name": "John Doe"
    },
    "checkout_urls": [
      {
        "name": "Orange Money",
        "url": "https://orange-money-prod-flowlinks.web.app/om/xyz123",
        "thumb": "https://votredomaine.com/api/v1/media/images/thumbs/om.png"
      }
    ],
    "qr_code": {
      "data": "iVBORw0KGgoAAAANSUhEUgAA..."
    },
    "expiration": "2025-10-30T18:47:53.185Z"
  }
}`}
          />
        </TabsContent>
        <TabsContent value="curl">
          <CodeBlock
            language="bash"
            code={`curl -X POST https://votredomaine.com/api/v1/payment/initiate \\
  -H "Authorization: Bearer VOTRE_CLE_API" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 5000,
    "currency": "XOF",
    "provider": "om",
    "userId": "user_123456",
    "name": "John Doe",
    "phone": "+22177123456",
    "email": "john@example.com",
    "client_reference": "order_789",
    "projectId": "proj_abc123"
  }'`}
          />
        </TabsContent>
        <TabsContent value="javascript">
          <CodeBlock
            language="javascript"
            code={`const response = await fetch('https://votredomaine.com/api/v1/payment/initiate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer VOTRE_CLE_API',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 5000,
    currency: 'XOF',
    provider: 'om',
    userId: 'user_123456',
    name: 'John Doe',
    phone: '+22177123456',
    email: 'john@example.com',
    client_reference: 'order_789',
    projectId: 'proj_abc123'
  })
});

const data = await response.json();
console.log(data);`}
          />
        </TabsContent>
      </Tabs>

      <h3 id="payment-sessions">Sessions de Paiement</h3>
      <p>
        Les sessions de paiement fournissent une page de paiement hébergée où les utilisateurs peuvent sélectionner leur
        méthode de paiement préférée.
      </p>

      <h4>Créer une Session de Paiement</h4>
      <div className="not-prose">
        <div className="bg-card border border-border rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs font-mono rounded">POST</span>
            <code className="text-sm">/payment/session/initiate</code>
          </div>
        </div>
      </div>

      <Tabs defaultValue="request" className="my-6">
        <TabsList>
          <TabsTrigger value="request">Requête</TabsTrigger>
          <TabsTrigger value="response">Réponse</TabsTrigger>
        </TabsList>
        <TabsContent value="request">
          <CodeBlock
            language="json"
            code={`{
  "amount": 10000,
  "currency": "XOF",
  "userId": "user_123456",
  "name": "John Doe",
  "phone": "+22177123456",
  "email": "john@example.com",
  "client_reference": "order_789",
  "projectId": "proj_abc123",
  "successUrl": "https://votreapp.com/success",
  "cancelUrl": "https://votreapp.com/cancel",
  "metadata": {
    "orderId": "789"
  }
}`}
          />
        </TabsContent>
        <TabsContent value="response">
          <CodeBlock
            language="json"
            code={`{
  "statusCode": 201,
  "message": "Payment session successfully initiated",
  "data": {
    "sessionId": "session_xyz123",
    "checkoutUrl": "https://votredomaine.com/checkout/session_xyz123",
    "status": "opened",
    "expiresAt": "2025-10-30T18:46:25.053Z"
  }
}`}
          />
        </TabsContent>
      </Tabs>

      <h4>Obtenir une Session de Paiement</h4>
      <div className="not-prose">
        <div className="bg-card border border-border rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-mono rounded">GET</span>
            <code className="text-sm">/payment/session/:id</code>
          </div>
        </div>
      </div>

      <CodeBlock
        language="bash"
        code={`curl https://votredomaine.com/api/v1/payment/session/session_xyz123 \\
  -H "Authorization: Bearer VOTRE_CLE_API"`}
      />

      <h2 id="errors">Gestion des Erreurs</h2>
      <p>NexPay utilise des codes de réponse HTTP conventionnels pour indiquer le succès ou l'échec :</p>
      <ul>
        <li>
          <code>200</code> - Succès
        </li>
        <li>
          <code>201</code> - Créé
        </li>
        <li>
          <code>400</code> - Mauvaise Requête (paramètres invalides)
        </li>
        <li>
          <code>401</code> - Non Autorisé (clé API invalide)
        </li>
        <li>
          <code>404</code> - Non Trouvé
        </li>
        <li>
          <code>500</code> - Erreur Serveur Interne
        </li>
      </ul>

      <CodeBlock
        language="json"
        code={`{
  "statusCode": 400,
  "message": "Invalid request parameters",
  "errors": [
    {
      "field": "amount",
      "message": "Amount must be greater than 0"
    }
  ]
}`}
      />
    </div>
  )
}
