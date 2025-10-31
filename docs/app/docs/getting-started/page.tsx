import { CodeBlock } from "@/components/code-block"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default function GettingStartedPage() {
  return (
    <div className="max-w-4xl prose prose-invert">
      <h1>Getting Started</h1>
      <p className="lead">
        Learn how to install, configure, and deploy NexPay on your own server. This guide will walk you through the
        complete setup process.
      </p>

      <h2 id="installation">Installation</h2>
      <p>
        NexPay is a self-hosted payment gateway that you deploy on your own infrastructure. Follow these steps to get
        started:
      </p>

      <h3>1. Clone the Repository</h3>
      <CodeBlock
        language="bash"
        code={`git clone https://github.com/your-org/nexpay.git
cd nexpay`}
      />

      <h3>2. Install Dependencies</h3>
      <CodeBlock
        language="bash"
        code={`npm install
# or
yarn install`}
      />

      <h3>3. Configure Environment Variables</h3>
      <p>
        Create a <code>.env</code> file in the root directory with the following variables:
      </p>
      <CodeBlock
        language="bash"
        code={`# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nexpay"

# Application
PORT=9090
NODE_ENV=production
APP_DOMAIN=https://your-domain.com

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Admin Credentials (for first login)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your-secure-password`}
      />

      <Alert className="my-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Make sure to use strong, unique values for JWT_SECRET and ADMIN_PASSWORD in production.
        </AlertDescription>
      </Alert>

      <h3>4. Run Database Migrations</h3>
      <CodeBlock
        language="bash"
        code={`npm run migrate
# or
yarn migrate`}
      />

      <h3>5. Start the Application</h3>
      <CodeBlock
        language="bash"
        code={`npm run start
# or
yarn start`}
      />

      <h2 id="domain-configuration">Domain Configuration</h2>
      <p>Point your domain to your server where NexPay is running. You'll need to configure:</p>
      <ul>
        <li>
          <strong>Main Domain:</strong> <code>your-domain.com</code> - For the dashboard and API
        </li>
        <li>
          <strong>SSL Certificate:</strong> Use Let's Encrypt or your preferred SSL provider
        </li>
        <li>
          <strong>Reverse Proxy:</strong> Configure Nginx or Apache to proxy requests to NexPay
        </li>
      </ul>

      <h3>Example Nginx Configuration</h3>
      <CodeBlock
        language="nginx"
        code={`server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:9090;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`}
      />

      <h2 id="first-login">First Login</h2>
      <p>
        After installation, access the dashboard at <code>https://your-domain.com/admin</code> and log in with the
        credentials you set in the environment variables.
      </p>

      <h2 id="next-steps">Next Steps</h2>
      <p>Now that NexPay is installed, you can:</p>
      <ul>
        <li>
          <a href="/docs/providers">Configure payment providers</a> (Orange Money, Wave, etc.)
        </li>
        <li>
          <a href="/docs/dashboard#projects">Create your first project</a>
        </li>
        <li>
          <a href="/docs/webhooks">Set up webhooks</a> for payment notifications
        </li>
        <li>
          <a href="/docs/api">Integrate the API</a> into your application
        </li>
      </ul>
    </div>
  )
}
