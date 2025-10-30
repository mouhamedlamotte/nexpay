import { CodeBlock } from "@/components/code-block"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Info } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function WebhooksPage() {
  return (
    <div className="max-w-4xl prose prose-invert">
      <h1>Webhooks</h1>
      <p className="lead">
        Webhooks allow you to receive real-time notifications about payment events. NexPay supports both provider
        webhooks and application webhooks.
      </p>

      <h2 id="overview">Overview</h2>
      <p>NexPay uses webhooks in two ways:</p>
      <ul>
        <li>
          <strong>Provider Webhooks:</strong> Receive notifications from payment providers (Orange Money, Wave, etc.)
        </li>
        <li>
          <strong>Application Webhooks:</strong> Send notifications to your application about payment events
        </li>
      </ul>

      <h2 id="provider-webhooks">Provider Webhooks</h2>
      <p>
        Configure your payment providers to send webhook notifications to NexPay. This allows NexPay to track payment
        status in real-time.
      </p>

      <h3>Webhook URLs</h3>
      <p>Each provider has a dedicated webhook endpoint:</p>
      <CodeBlock
        language="text"
        code={`Orange Money: https://your-domain.com/api/v1/webhook/om
Wave: https://your-domain.com/api/v1/webhook/wave`}
      />

      <Alert className="my-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Configure these URLs in your provider's dashboard (Orange Money, Wave, etc.) to receive payment notifications.
        </AlertDescription>
      </Alert>

      <h3>Orange Money Webhook</h3>
      <p>Example webhook payload from Orange Money:</p>
      <CodeBlock
        language="json"
        code={`{
  "amount": {
    "value": 5000,
    "unit": "XOF"
  },
  "reference": "NEXPAY_TX_A819BE",
  "transactionId": "MP250827.1838.C30884",
  "status": "SUCCESS"
}`}
      />

      <h3>Wave Webhook</h3>
      <p>Example webhook payload from Wave:</p>
      <CodeBlock
        language="json"
        code={`{
  "id": "EV_QvEZuDSQbLdI",
  "type": "checkout.session.completed",
  "data": {
    "id": "cos-18qq25rgr100a",
    "amount": "5000",
    "client_reference": "order_789",
    "payment_status": "succeeded"
  }
}`}
      />

      <h2 id="application-webhooks">Application Webhooks</h2>
      <p>Configure NexPay to send webhook notifications to your application when payment events occur.</p>

      <h3>Configuration</h3>
      <p>Set up application webhooks from your dashboard:</p>
      <ol>
        <li>
          Navigate to <strong>Settings → Webhooks</strong>
        </li>
        <li>
          Click <strong>New Webhook</strong>
        </li>
        <li>
          Enter your webhook URL (e.g., <code>https://yourapp.com/webhooks/nexpay</code>)
        </li>
        <li>
          Set a header name (e.g., <code>x-webhook-secret</code>)
        </li>
        <li>Generate and save a secret key for verification</li>
      </ol>

      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20from%202025-10-30%2018-00-08-gSa3QGljAge6ACctwIdBilhtUkf2KY.png"
        alt="Webhook Configuration"
        className="rounded-lg border border-border"
      />

      <h3>Event Types</h3>
      <p>NexPay sends the following webhook events:</p>
      <ul>
        <li>
          <code>payment.succeeded</code> - Payment completed successfully
        </li>
        <li>
          <code>payment.failed</code> - Payment failed
        </li>
        <li>
          <code>payment.pending</code> - Payment is pending
        </li>
      </ul>

      <h3>Webhook Payload</h3>
      <p>Example webhook payload sent to your application:</p>
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
      "name": "My Project"
    },
    "metadata": {
      "orderId": "789",
      "productName": "Premium Plan"
    }
  }
}`}
      />

      <h2 id="verification">Webhook Verification</h2>
      <p>Always verify webhook signatures to ensure requests are coming from NexPay.</p>

      <Alert className="my-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Never process webhook events without verifying the signature. This prevents malicious actors from sending fake
          payment notifications.
        </AlertDescription>
      </Alert>

      <h3>Verification Process</h3>
      <p>
        NexPay includes your secret key in the header you specified during configuration. Verify this header matches
        your secret:
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
            code={`// Express.js example
app.post('/webhooks/nexpay', (req, res) => {
  const signature = req.headers['x-webhook-secret'];
  const expectedSecret = process.env.NEXPAY_WEBHOOK_SECRET;

  // Verify signature
  if (signature !== expectedSecret) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Process webhook
  const event = req.body;
  
  if (event.type === 'payment.succeeded') {
    // Handle successful payment
    console.log('Payment succeeded:', event.data);
    // Update your database, send confirmation email, etc.
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
    
    # Verify signature
    if signature != expected_secret:
        return jsonify({'error': 'Invalid signature'}), 401
    
    # Process webhook
    event = request.json
    
    if event['type'] == 'payment.succeeded':
        # Handle successful payment
        print('Payment succeeded:', event['data'])
        # Update your database, send confirmation email, etc.
    
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

// Verify signature
if ($signature !== $expectedSecret) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid signature']);
    exit;
}

// Process webhook
$event = json_decode(file_get_contents('php://input'), true);

if ($event['type'] === 'payment.succeeded') {
    // Handle successful payment
    error_log('Payment succeeded: ' . json_encode($event['data']));
    // Update your database, send confirmation email, etc.
}

http_response_code(200);
echo json_encode(['received' => true]);
?>`}
          />
        </TabsContent>
      </Tabs>

      <h2 id="best-practices">Best Practices</h2>
      <ul>
        <li>
          <strong>Respond quickly:</strong> Return a 200 status code as soon as possible
        </li>
        <li>
          <strong>Process asynchronously:</strong> Queue webhook processing for heavy operations
        </li>
        <li>
          <strong>Handle duplicates:</strong> Use <code>client_reference</code> to prevent duplicate processing
        </li>
        <li>
          <strong>Retry logic:</strong> NexPay will retry failed webhooks up to 3 times
        </li>
        <li>
          <strong>Monitor failures:</strong> Check webhook logs in your dashboard
        </li>
      </ul>
    </div>
  )
}
