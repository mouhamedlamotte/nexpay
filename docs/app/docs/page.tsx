import Link from "next/link"
import { ArrowRight, Book, Code, Webhook, Settings } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function DocsPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Documentation NexPay</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Tout ce dont vous avez besoin pour intégrer NexPay dans votre application et commencer à accepter des
          paiements.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <Link href="/docs/getting-started">
          <Card className="p-6 hover:border-primary/50 transition-colors cursor-pointer h-full">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Book className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Démarrage</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Apprenez comment installer, configurer et déployer NexPay sur votre serveur.
            </p>
            <div className="flex items-center text-sm text-primary">
              Commencer ici <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </Card>
        </Link>

        <Link href="/docs/api">
          <Card className="p-6 hover:border-secondary/50 transition-colors cursor-pointer h-full">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
              <Code className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Référence API</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Documentation API complète avec des exemples pour tous les endpoints.
            </p>
            <div className="flex items-center text-sm text-secondary">
              Voir la documentation API <ArrowRight className="ml-2 h-4 w-4" />
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
              Configurez les webhooks pour recevoir des notifications de paiement en temps réel.
            </p>
            <div className="flex items-center text-sm text-accent">
              En savoir plus sur les webhooks <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </Card>
        </Link>

        <Link href="/docs/dashboard">
          <Card className="p-6 hover:border-primary/50 transition-colors cursor-pointer h-full">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Guide du Tableau de Bord</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Gérez les providers, les projets et les configurations depuis le tableau de bord.
            </p>
            <div className="flex items-center text-sm text-primary">
              Explorer le tableau de bord <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </Card>
        </Link>
      </div>

      <div className="border-t border-border pt-12">
        <h2 className="text-2xl font-bold mb-6">Sujets Populaires</h2>
        <div className="space-y-4">
          <Link
            href="/docs/getting-started#installation"
            className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
          >
            <h3 className="font-semibold mb-1">Installation & Configuration</h3>
            <p className="text-sm text-muted-foreground">
              Déployez NexPay sur votre serveur et configurez les variables d'environnement
            </p>
          </Link>
          <Link
            href="/docs/providers"
            className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
          >
            <h3 className="font-semibold mb-1">Configuration des Providers</h3>
            <p className="text-sm text-muted-foreground">
              Configurez Orange Money, Wave et d'autres providers de paiement
            </p>
          </Link>
          <Link
            href="/docs/api#payment-sessions"
            className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
          >
            <h3 className="font-semibold mb-1">Sessions de Paiement</h3>
            <p className="text-sm text-muted-foreground">
              Créez des pages de paiement hébergées avec les sessions de paiement
            </p>
          </Link>
          <Link
            href="/docs/webhooks#verification"
            className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
          >
            <h3 className="font-semibold mb-1">Vérification des Webhooks</h3>
            <p className="text-sm text-muted-foreground">Sécurisez vos webhooks avec la vérification de signature</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
