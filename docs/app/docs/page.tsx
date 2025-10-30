import Link from "next/link"
import { ArrowRight, Book, Code, Webhook, Settings } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function DocsPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">NexPay Documentation</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Everything you need to integrate NexPay into your application and start accepting payments.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <Link href="/docs/getting-started">
          <Card className="p-6 hover:border-primary/50 transition-colors cursor-pointer h-full">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Book className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Getting Started</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Learn how to install, configure, and deploy NexPay on your server.
            </p>
            <div className="flex items-center text-sm text-primary">
              Start here <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </Card>
        </Link>

        <Link href="/docs/api">
          <Card className="p-6 hover:border-secondary/50 transition-colors cursor-pointer h-full">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
              <Code className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">API Reference</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Complete API documentation with examples for all endpoints.
            </p>
            <div className="flex items-center text-sm text-secondary">
              View API docs <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </Card>
        </Link>

        <Link href="/docs/webhooks">
          <Card className="p-6 hover:border-accent/50 transition-colors cursor-pointer h-full">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
              <Webhook className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Webhooks</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Configure webhooks to receive real-time payment notifications.
            </p>
            <div className="flex items-center text-sm text-accent">
              Learn about webhooks <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </Card>
        </Link>

        <Link href="/docs/dashboard">
          <Card className="p-6 hover:border-primary/50 transition-colors cursor-pointer h-full">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Dashboard Guide</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Manage providers, projects, and configurations from the dashboard.
            </p>
            <div className="flex items-center text-sm text-primary">
              Explore dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </Card>
        </Link>
      </div>

      <div className="border-t border-border pt-12">
        <h2 className="text-2xl font-bold mb-6">Popular Topics</h2>
        <div className="space-y-4">
          <Link
            href="/docs/getting-started#installation"
            className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
          >
            <h3 className="font-semibold mb-1">Installation & Setup</h3>
            <p className="text-sm text-muted-foreground">
              Deploy NexPay on your server and configure environment variables
            </p>
          </Link>
          <Link
            href="/docs/providers"
            className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
          >
            <h3 className="font-semibold mb-1">Provider Configuration</h3>
            <p className="text-sm text-muted-foreground">Set up Orange Money, Wave, and other payment providers</p>
          </Link>
          <Link
            href="/docs/api/sessions"
            className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
          >
            <h3 className="font-semibold mb-1">Payment Sessions</h3>
            <p className="text-sm text-muted-foreground">Create hosted checkout pages with payment sessions</p>
          </Link>
          <Link
            href="/docs/webhooks#verification"
            className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
          >
            <h3 className="font-semibold mb-1">Webhook Verification</h3>
            <p className="text-sm text-muted-foreground">Secure your webhooks with signature verification</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
