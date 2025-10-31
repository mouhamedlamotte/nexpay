import Link from "next/link"
import { ArrowRight, Code, Zap, Shield, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="font-bold text-xl">NexPay</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Docs
              </Link>
              <Link href="/docs/api" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                API Reference
              </Link>
              <Link
                href="/docs/guides"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Guides
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/docs">Documentation</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/docs/getting-started">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary mb-4">
            Self-hosted Payment Gateway
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Accept Payments with{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              NexPay
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A powerful, self-hosted payment gateway supporting Orange Money, Wave, and more. Complete control over your
            payment infrastructure.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button size="lg" asChild>
              <Link href="/docs/getting-started">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/docs/api">View API Docs</Link>
            </Button>
          </div>
          <div className="pt-8">
            <pre className="inline-block bg-card border border-border rounded-lg px-6 py-4 text-left text-sm">
              <code className="text-muted-foreground">
                <span className="text-secondary">$</span> curl -fsSL https://raw.githubusercontent.com/mouhamedlamotte/nexpay/main/install.sh | bash -s -- pay.yourdomain.com
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Fast Integration</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Get started in minutes with our simple API and comprehensive documentation.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 hover:border-secondary/50 transition-colors">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Secure & Reliable</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Built with security in mind. Webhook verification and API key authentication.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 hover:border-accent/50 transition-colors">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
              <Globe className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Self-Hosted</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Complete control over your infrastructure. Deploy on your own servers.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Developer First</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Clean API design, detailed docs, and code examples in multiple languages.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">Quick Start</h2>
          <p className="text-muted-foreground text-center mb-12">
            Get up and running with NexPay in three simple steps
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                1
              </div>
              <h3 className="font-semibold">Install & Configure</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Deploy NexPay on your server and configure environment variables
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center text-secondary font-bold">
                2
              </div>
              <h3 className="font-semibold">Setup Providers</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Add your payment provider credentials and configure webhooks
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold">
                3
              </div>
              <h3 className="font-semibold">Start Accepting Payments</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Integrate the API into your application and start processing payments
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-primary/20 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore our comprehensive documentation and start integrating NexPay into your application today.
          </p>
          <Button size="lg" asChild>
            <Link href="/docs/getting-started">
              Read the Documentation <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <span className="font-bold text-lg">NexPay</span>
              </div>
              <p className="text-sm text-muted-foreground">Self-hosted payment gateway for modern applications.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Documentation</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/docs/getting-started" className="hover:text-foreground transition-colors">
                    Getting Started
                  </Link>
                </li>
                <li>
                  <Link href="/docs/api" className="hover:text-foreground transition-colors">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="/docs/guides" className="hover:text-foreground transition-colors">
                    Guides
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/docs/webhooks" className="hover:text-foreground transition-colors">
                    Webhooks
                  </Link>
                </li>
                <li>
                  <Link href="/docs/providers" className="hover:text-foreground transition-colors">
                    Providers
                  </Link>
                </li>
                <li>
                  <Link href="/docs/dashboard" className="hover:text-foreground transition-colors">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/docs" className="hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-foreground transition-colors">
                    Community
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
            © 2025 NexPay. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
