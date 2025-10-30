import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="max-w-4xl prose prose-invert">
      <h1>Dashboard Guide</h1>
      <p className="lead">
        Learn how to use the NexPay dashboard to manage your payment infrastructure, configure providers, and monitor
        transactions.
      </p>

      <h2 id="overview">Overview</h2>
      <p>
        The NexPay dashboard is your central hub for managing all aspects of your payment gateway. From here, you can:
      </p>
      <ul>
        <li>Configure payment providers</li>
        <li>Manage multiple projects</li>
        <li>Set up webhooks and redirect URLs</li>
        <li>Monitor transactions and payments</li>
        <li>Generate API keys</li>
      </ul>

      <h2 id="projects">Projects</h2>
      <p>
        Projects allow you to organize payments for different applications or environments. Each project has its own:
      </p>
      <ul>
        <li>API keys</li>
        <li>Webhook configurations</li>
        <li>Redirect URLs</li>
        <li>Transaction history</li>
      </ul>

      <Alert className="my-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          All projects share the same provider configurations. You only need to set up Orange Money, Wave, etc. once.
        </AlertDescription>
      </Alert>

      <h3>Creating a Project</h3>
      <ol>
        <li>
          Navigate to <strong>Projects</strong> in the sidebar
        </li>
        <li>
          Click <strong>New Project</strong>
        </li>
        <li>Enter a project name and description</li>
        <li>Optionally add metadata (key-value pairs)</li>
        <li>
          Click <strong>Create Project</strong>
        </li>
      </ol>

      <h3>Project Settings</h3>
      <p>Each project has the following settings:</p>
      <ul>
        <li>
          <strong>General:</strong> Name, description, and metadata
        </li>
        <li>
          <strong>API Keys:</strong> Generate and manage API keys
        </li>
        <li>
          <strong>Webhooks:</strong> Configure webhook endpoints
        </li>
        <li>
          <strong>Redirects:</strong> Set success, failure, and cancel URLs
        </li>
      </ul>

      <h2 id="providers">Providers</h2>
      <p>
        The Providers section allows you to configure payment providers that will be available across all your projects.
      </p>

      <h3>Configuring a Provider</h3>
      <ol>
        <li>
          Navigate to <strong>Providers</strong>
        </li>
        <li>Find the provider you want to configure (Orange Money, Wave, etc.)</li>
        <li>
          Click <strong>Configure</strong>
        </li>
        <li>Enter your API credentials</li>
        <li>
          Click <strong>Save Configuration</strong>
        </li>
      </ol>

      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20from%202025-10-30%2018-00-19-4h28b96RYuazJ45WmmBtA07YpoJaCH.png"
        alt="Provider Configuration"
        className="rounded-lg border border-border"
      />

      <h3>Provider Status</h3>
      <p>Providers can have the following statuses:</p>
      <ul>
        <li>
          <strong>Active:</strong> Configured and ready to accept payments
        </li>
        <li>
          <strong>Inactive:</strong> Not configured or disabled
        </li>
      </ul>

      <h2 id="webhooks">Webhooks</h2>
      <p>Configure webhooks to receive real-time notifications about payment events in your application.</p>

      <h3>Setting Up Webhooks</h3>
      <ol>
        <li>
          Navigate to <strong>Settings → Webhooks</strong>
        </li>
        <li>
          Click <strong>New Webhook</strong>
        </li>
        <li>Enter your webhook URL</li>
        <li>
          Set a header name (e.g., <code>x-webhook-secret</code>)
        </li>
        <li>Generate or enter a secret key</li>
        <li>
          Click <strong>Create Webhook</strong>
        </li>
      </ol>

      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20from%202025-10-30%2018-00-08-gSa3QGljAge6ACctwIdBilhtUkf2KY.png"
        alt="Webhook Configuration"
        className="rounded-lg border border-border"
      />

      <Alert className="my-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Save your secret key securely. You'll need it to verify webhook signatures in your application.
        </AlertDescription>
      </Alert>

      <h2 id="redirects">Redirect URLs</h2>
      <p>Configure where users should be redirected after completing, canceling, or failing a payment.</p>

      <h3>Configuring Redirects</h3>
      <ol>
        <li>
          Navigate to <strong>Settings → Callbacks</strong>
        </li>
        <li>
          Enter your redirect URLs:
          <ul>
            <li>
              <strong>Success URL:</strong> Where to redirect after successful payment
            </li>
            <li>
              <strong>Failure URL:</strong> Where to redirect after failed payment
            </li>
            <li>
              <strong>Cancel URL:</strong> Where to redirect if user cancels
            </li>
          </ul>
        </li>
        <li>
          Click <strong>Save Changes</strong>
        </li>
      </ol>

      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20from%202025-10-30%2017-59-59-6dJGPwAF7wunaYbxz6bAI54JPv8Djs.png"
        alt="Redirect Configuration"
        className="rounded-lg border border-border"
      />

      <h3>URL Parameters</h3>
      <p>NexPay appends the following query parameters to your redirect URLs:</p>
      <ul>
        <li>
          <code>session_id</code> - The payment session ID
        </li>
        <li>
          <code>status</code> - Payment status (succeeded, failed, canceled)
        </li>
        <li>
          <code>reference</code> - Your client reference
        </li>
      </ul>

      <h2 id="api-keys">API Keys</h2>
      <p>API keys are used to authenticate requests to the NexPay API. Each project can have multiple API keys.</p>

      <h3>Generating an API Key</h3>
      <ol>
        <li>Navigate to your project settings</li>
        <li>
          Go to the <strong>API Keys</strong> tab
        </li>
        <li>
          Click <strong>Generate New Key</strong>
        </li>
        <li>Give your key a name (e.g., "Production", "Development")</li>
        <li>Copy and save the key securely</li>
      </ol>

      <Alert className="my-6">
        <Info className="h-4 w-4" />
        <AlertDescription>API keys are only shown once. Make sure to copy and store them securely.</AlertDescription>
      </Alert>

      <h3>Revoking API Keys</h3>
      <p>
        If an API key is compromised, you can revoke it immediately from the API Keys section. Revoked keys will no
        longer work for API requests.
      </p>

      <h2 id="transactions">Transactions</h2>
      <p>View and monitor all payment transactions across your projects.</p>

      <h3>Transaction Details</h3>
      <p>Each transaction shows:</p>
      <ul>
        <li>Amount and currency</li>
        <li>Payment status</li>
        <li>Provider used</li>
        <li>Payer information</li>
        <li>Timestamps</li>
        <li>Metadata</li>
      </ul>

      <h3>Filtering Transactions</h3>
      <p>Filter transactions by:</p>
      <ul>
        <li>Date range</li>
        <li>Status (succeeded, failed, pending)</li>
        <li>Provider</li>
        <li>Project</li>
      </ul>
    </div>
  )
}
