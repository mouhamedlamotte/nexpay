import { CodeBlock } from "@/components/code-block"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function APIReferencePage() {
  return (
    <div className="max-w-4xl prose prose-invert">
      <h1>API Reference</h1>
      <p className="lead">
        Complete reference for the NexPay API. All API requests require authentication using an API key.
      </p>

      <h2 id="authentication">Authentication</h2>
      <p>
        NexPay uses API keys to authenticate requests. You can generate API keys from your dashboard under Project
        Settings.
      </p>

      <Alert className="my-6">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Include your API key in the <code>Authorization</code> header as a Bearer token for all API requests.
        </AlertDescription>
      </Alert>

      <CodeBlock
        language="bash"
        code={`curl https://your-domain.com/api/v1/payment/initiate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
      />

      <h2 id="base-url">Base URL</h2>
      <CodeBlock language="text" code={`https://your-domain.com/api/v1`} />

      <h2 id="endpoints">Endpoints</h2>

      <h3 id="health-check">Health Check</h3>
      <p>Check if the API is running and healthy.</p>
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
          <TabsTrigger value="response">Response</TabsTrigger>
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

      <h3 id="initiate-payment">Initiate Payment</h3>
      <p>Create a new payment transaction with a specific provider.</p>
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
          <TabsTrigger value="request">Request</TabsTrigger>
          <TabsTrigger value="response">Response</TabsTrigger>
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
    "productName": "Premium Plan"
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
      "logoUrl": "https://your-domain.com/api/v1/media/images/logos/om.png"
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
        "thumb": "https://your-domain.com/api/v1/media/images/thumbs/om.png"
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
            code={`curl -X POST https://your-domain.com/api/v1/payment/initiate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
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
            code={`const response = await fetch('https://your-domain.com/api/v1/payment/initiate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
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

      <h3 id="payment-sessions">Payment Sessions</h3>
      <p>Payment sessions provide a hosted checkout page where users can select their preferred payment method.</p>

      <h4>Create Payment Session</h4>
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
          <TabsTrigger value="request">Request</TabsTrigger>
          <TabsTrigger value="response">Response</TabsTrigger>
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
  "successUrl": "https://yourapp.com/success",
  "cancelUrl": "https://yourapp.com/cancel",
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
    "checkoutUrl": "https://your-domain.com/checkout/session_xyz123",
    "status": "opened",
    "expiresAt": "2025-10-30T18:46:25.053Z"
  }
}`}
          />
        </TabsContent>
      </Tabs>

      <h4>Get Payment Session</h4>
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
        code={`curl https://your-domain.com/api/v1/payment/session/session_xyz123 \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
      />

      <h2 id="errors">Error Handling</h2>
      <p>NexPay uses conventional HTTP response codes to indicate success or failure:</p>
      <ul>
        <li>
          <code>200</code> - Success
        </li>
        <li>
          <code>201</code> - Created
        </li>
        <li>
          <code>400</code> - Bad Request (invalid parameters)
        </li>
        <li>
          <code>401</code> - Unauthorized (invalid API key)
        </li>
        <li>
          <code>404</code> - Not Found
        </li>
        <li>
          <code>500</code> - Internal Server Error
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
