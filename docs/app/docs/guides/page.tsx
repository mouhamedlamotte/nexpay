import { CodeBlock } from "@/components/code-block"
import Link from "next/link"

export default function GuidesPage() {
  return (
    <div className="max-w-4xl prose prose-invert">
      <h1>Integration Guides</h1>
      <p className="lead">Step-by-step guides for common integration scenarios and use cases.</p>

      <h2 id="quick-integration">Quick Integration Guide</h2>
      <p>This guide walks you through integrating NexPay into a web application in under 15 minutes.</p>

      <h3>Step 1: Install NexPay</h3>
      <p>
        First, make sure NexPay is installed and running on your server. See the{" "}
        <Link href="/docs/getting-started">Getting Started</Link> guide.
      </p>

      <h3>Step 2: Configure a Provider</h3>
      <p>
        Set up at least one payment provider (Orange Money or Wave) from your dashboard. See{" "}
        <Link href="/docs/providers">Provider Configuration</Link>.
      </p>

      <h3>Step 3: Create a Project</h3>
      <p>Create a new project in your dashboard and generate an API key.</p>

      <h3>Step 4: Initiate a Payment</h3>
      <p>Use the API to create a payment session:</p>
      <CodeBlock
        language="javascript"
        code={`const response = await fetch('https://your-domain.com/api/v1/payment/session/initiate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
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
    projectId: 'your_project_id',
    successUrl: 'https://yourapp.com/success',
    cancelUrl: 'https://yourapp.com/cancel'
  })
});

const { data } = await response.json();
// Redirect user to data.checkoutUrl
window.location.href = data.checkoutUrl;`}
      />

      <h3>Step 5: Handle Webhooks</h3>
      <p>Set up a webhook endpoint to receive payment notifications:</p>
      <CodeBlock
        language="javascript"
        code={`app.post('/webhooks/nexpay', (req, res) => {
  const signature = req.headers['x-webhook-secret'];
  
  if (signature !== process.env.NEXPAY_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = req.body;
  
  if (event.type === 'payment.succeeded') {
    // Update order status in your database
    await updateOrderStatus(event.data.client_reference, 'paid');
  }

  res.status(200).json({ received: true });
});`}
      />

      <h2 id="direct-payment">Direct Payment Integration</h2>
      <p>
        For more control, you can initiate payments directly with a specific provider instead of using payment sessions.
      </p>

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
    provider: 'om', // Specify provider directly
    userId: 'user_123',
    name: 'John Doe',
    phone: '+22177123456',
    email: 'john@example.com',
    client_reference: 'order_789',
    projectId: 'your_project_id'
  })
});

const { data } = await response.json();
// data.checkout_urls contains payment links
// data.qr_code contains QR code for mobile payment`}
      />

      <h2 id="testing">Testing Your Integration</h2>
      <p>Before going live, test your integration thoroughly:</p>

      <h3>1. Use Provider Sandbox</h3>
      <p>Configure your providers with sandbox/test credentials.</p>

      <h3>2. Test Payment Flow</h3>
      <ul>
        <li>Initiate a test payment</li>
        <li>Complete the payment on the provider's test platform</li>
        <li>Verify webhook is received</li>
        <li>Check redirect URLs work correctly</li>
      </ul>

      <h3>3. Test Error Scenarios</h3>
      <ul>
        <li>Insufficient funds</li>
        <li>Canceled payments</li>
        <li>Network timeouts</li>
        <li>Invalid API keys</li>
      </ul>

      <h2 id="production">Going to Production</h2>
      <p>When you're ready to accept real payments:</p>

      <ol>
        <li>Replace sandbox credentials with production credentials</li>
        <li>Update webhook URLs to production endpoints</li>
        <li>Ensure SSL is properly configured</li>
        <li>Set up monitoring and alerting</li>
        <li>Test with a small real payment</li>
      </ol>

      <h2 id="best-practices">Best Practices</h2>

      <h3>Security</h3>
      <ul>
        <li>Never expose API keys in client-side code</li>
        <li>Always verify webhook signatures</li>
        <li>Use HTTPS for all API requests</li>
        <li>Rotate API keys periodically</li>
      </ul>

      <h3>Error Handling</h3>
      <ul>
        <li>Implement retry logic for failed API requests</li>
        <li>Log all payment attempts for debugging</li>
        <li>Show user-friendly error messages</li>
        <li>Have a fallback for webhook failures</li>
      </ul>

      <h3>User Experience</h3>
      <ul>
        <li>Show clear payment instructions</li>
        <li>Display payment status in real-time</li>
        <li>Provide multiple payment options</li>
        <li>Send confirmation emails</li>
      </ul>
    </div>
  )
}
