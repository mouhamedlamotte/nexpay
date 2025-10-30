import { CodeBlock } from "@/components/code-block"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default function ProvidersPage() {
  return (
    <div className="max-w-4xl prose prose-invert">
      <h1>Payment Providers</h1>
      <p className="lead">
        Configure payment providers to start accepting payments. NexPay supports multiple providers with a single,
        unified configuration.
      </p>

      <h2 id="overview">Overview</h2>
      <p>
        NexPay uses a centralized provider configuration system. You configure each provider once, and all your projects
        can use the same provider credentials.
      </p>

      <Alert className="my-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Provider configurations are shared across all projects. This means you only need to set up Orange Money, Wave,
          etc. once.
        </AlertDescription>
      </Alert>

      <h2 id="configuration">Provider Configuration</h2>
      <p>To configure a payment provider:</p>
      <ol>
        <li>
          Navigate to <strong>Providers</strong> in your dashboard
        </li>
        <li>
          Click <strong>Configure</strong> next to the provider you want to set up
        </li>
        <li>Enter your API credentials from the provider</li>
        <li>Save the configuration</li>
      </ol>

      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20from%202025-10-30%2018-00-19-4h28b96RYuazJ45WmmBtA07YpoJaCH.png"
        alt="Provider Configuration"
        className="rounded-lg border border-border"
      />

      <h2 id="orange-money">Orange Money</h2>
      <p>Orange Money is a mobile money service available in West and Central Africa.</p>

      <h3>Required Credentials</h3>
      <ul>
        <li>
          <strong>Client ID:</strong> Your Orange Money API client ID
        </li>
        <li>
          <strong>Client Secret:</strong> Your Orange Money API client secret
        </li>
        <li>
          <strong>Name:</strong> Display name (e.g., "Orange Money")
        </li>
        <li>
          <strong>Code:</strong> Provider code (<code>om</code>)
        </li>
      </ul>

      <h3>Obtaining Credentials</h3>
      <ol>
        <li>
          Visit the{" "}
          <a href="https://developer.orange.com" target="_blank" rel="noreferrer noopener">
            Orange Developer Portal
          </a>
        </li>
        <li>Create an account or log in</li>
        <li>Create a new application</li>
        <li>Subscribe to the Orange Money API</li>
        <li>Copy your Client ID and Client Secret</li>
      </ol>

      <h3>Webhook Configuration</h3>
      <p>Configure Orange Money to send webhooks to NexPay:</p>
      <CodeBlock language="text" code={`Webhook URL: https://your-domain.com/api/v1/webhook/om`} />

      <h3>Testing</h3>
      <p>Orange Money provides a sandbox environment for testing:</p>
      <CodeBlock
        language="json"
        code={`{
  "client_id": "your_sandbox_client_id",
  "client_secret": "your_sandbox_client_secret"
}`}
      />

      <h2 id="wave">Wave</h2>
      <p>Wave is a mobile money platform operating in several African countries.</p>

      <h3>Required Credentials</h3>
      <ul>
        <li>
          <strong>API Key:</strong> Your Wave API key
        </li>
        <li>
          <strong>Name:</strong> Display name (e.g., "Wave")
        </li>
        <li>
          <strong>Code:</strong> Provider code (<code>wave</code>)
        </li>
      </ul>

      <h3>Obtaining Credentials</h3>
      <ol>
        <li>
          Visit the{" "}
          <a href="https://developer.wave.com" target="_blank" rel="noreferrer noopener">
            Wave Developer Portal
          </a>
        </li>
        <li>Create a business account</li>
        <li>Navigate to API settings</li>
        <li>Generate an API key</li>
      </ol>

      <h3>Webhook Configuration</h3>
      <p>Configure Wave to send webhooks to NexPay:</p>
      <CodeBlock language="text" code={`Webhook URL: https://your-domain.com/api/v1/webhook/wave`} />

      <h3>Supported Events</h3>
      <ul>
        <li>
          <code>checkout.session.completed</code> - Payment successful
        </li>
        <li>
          <code>checkout.session.payment_failed</code> - Payment failed
        </li>
      </ul>

      <h2 id="multiple-projects">Using Providers Across Projects</h2>
      <p>
        Once you've configured a provider, it's automatically available to all your projects. You don't need to
        reconfigure credentials for each project.
      </p>

      <h3>Example: Using Orange Money in Multiple Projects</h3>
      <ol>
        <li>Configure Orange Money once in the Providers section</li>
        <li>Create Project A and Project B</li>
        <li>Both projects can now accept Orange Money payments</li>
        <li>Each project can have different redirect URLs and webhooks</li>
      </ol>

      <h2 id="provider-codes">Provider Codes</h2>
      <p>Use these codes when initiating payments via the API:</p>
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
  "provider": "om",  // Use provider code here
  "userId": "user_123",
  // ... other fields
}`}
      />

      <h2 id="troubleshooting">Troubleshooting</h2>

      <h3>Provider Not Available</h3>
      <p>If a provider doesn't appear in your payment options:</p>
      <ul>
        <li>Verify the provider is configured in the Providers section</li>
        <li>Check that the provider status is "Active"</li>
        <li>Ensure your API credentials are correct</li>
      </ul>

      <h3>Webhook Not Receiving Events</h3>
      <p>If you're not receiving webhook events from a provider:</p>
      <ul>
        <li>Verify the webhook URL is correctly configured in the provider's dashboard</li>
        <li>Check that your server is accessible from the internet</li>
        <li>Ensure SSL is properly configured (providers require HTTPS)</li>
        <li>Check webhook logs in the provider's dashboard</li>
      </ul>
    </div>
  )
}
