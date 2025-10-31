import Link from "next/link"
import { ArrowRight, Code, Zap, Shield, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-bold text-xl text-primary">NEXPAY</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Documentation
              </Link>
              <Link href="/docs/api" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Référence API
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
              <Link href="/docs/getting-started">Commencer</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary mb-4">
            Passerelle de Paiement Auto-Hébergée
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Acceptez des Paiements avec{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              NEXPAY
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Une passerelle de paiement puissante et auto-hébergée supportant Orange Money, Wave et plus encore. Contrôle
            total sur votre infrastructure de paiement.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button size="lg" asChild>
              <Link href="/docs/getting-started">
                Commencer <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/docs/api">Voir la Documentation API</Link>
            </Button>
          </div>
          <div className="pt-8">
            <pre className="inline-block bg-card border border-border rounded-lg px-6 py-4 text-sm overflow-x-auto max-w-sm md:max-w-md lg:max-w-none">
              <code className="text-muted-foreground overflow-x-auto">
                <span className="text-secondary">$</span> curl -fsSL
                https://raw.githubusercontent.com/mouhamedlamotte/nexpay/main/install.sh | bash -s --
                pay.votredomaine.com
              </code>
            </pre>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Intégration Rapide</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Démarrez en quelques minutes avec notre API simple et notre documentation complète.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 hover:border-secondary/50 transition-colors">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Sécurisé & Fiable</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Conçu avec la sécurité à l'esprit. Vérification des webhooks et authentification par clé API.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 hover:border-accent/50 transition-colors">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
              <Globe className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Auto-Hébergé</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Contrôle total sur votre infrastructure. Déployez sur vos propres serveurs.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Orienté Développeur</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Design d'API propre, documentation détaillée et exemples de code en plusieurs langages.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-24">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">Démarrage Rapide</h2>
          <p className="text-muted-foreground text-center mb-12">Lancez-vous avec NexPay en trois étapes simples</p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                1
              </div>
              <h3 className="font-semibold">Installer & Configurer</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Déployez NexPay sur votre serveur et configurez les variables d'environnement
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center text-secondary font-bold">
                2
              </div>
              <h3 className="font-semibold">Configurer les Providers</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ajoutez vos identifiants de providers de paiement et configurez les webhooks
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold">
                3
              </div>
              <h3 className="font-semibold">Accepter les Paiements</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Intégrez l'API dans votre application et commencez à traiter les paiements
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto bg-linear-to-r from-primary/10 via-secondary/10 to-accent/10 border border-primary/20 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à commencer ?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explorez notre documentation complète et commencez à intégrer NexPay dans votre application dès aujourd'hui.
          </p>
          <Button size="lg" asChild>
            <Link href="/docs/getting-started">
              Lire la Documentation <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="font-bold text-lg text-primary">NEXPAY</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Passerelle de paiement auto-hébergée pour applications modernes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Documentation</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/docs/getting-started" className="hover:text-foreground transition-colors">
                    Démarrage
                  </Link>
                </li>
                <li>
                  <Link href="/docs/api" className="hover:text-foreground transition-colors">
                    Référence API
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
              <h4 className="font-semibold mb-4">Ressources</h4>
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
                    Tableau de Bord
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/docs" className="hover:text-foreground transition-colors">
                    Centre d'Aide
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-foreground transition-colors">
                    Communauté
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
            © 2025 NexPay. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  )
}
