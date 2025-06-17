// ================================================
// PAGE DE CONNEXION - src/app/auth/login/page.tsx
// SenMarket - Authentification Premium 🔐
// ================================================

import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { LoginForm } from '@/components/forms/login-form'
import { SocialAuth } from '@/components/auth/social-auth'
import { AuthLayout } from '@/components/layout/auth-layout'
import { LoadingSpinner } from '@/components/common/loading-spinner'

// === METADATA SEO ===
export const metadata: Metadata = {
  title: 'Connexion | SenMarket',
  description: 'Connectez-vous à votre compte SenMarket pour accéder à vos annonces et gérer vos ventes.',
  robots: {
    index: false,
    follow: true,
  },
}

// === COMPOSANT PRINCIPAL ===
export default function LoginPage() {
  return (
    <AuthLayout
      title="Bon retour !"
      subtitle="Connectez-vous pour retrouver vos annonces"
      imageSrc="/images/auth/login-senegal.jpg"
      imageAlt="Marché coloré du Sénégal"
    >
      {/* === FORMULAIRE DE CONNEXION === */}
      <div className="space-y-6">
        {/* En-tête */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gradient">
            Se Connecter
          </h1>
          <p className="text-muted-foreground">
            Accédez à votre espace personnel SenMarket
          </p>
        </div>

        {/* Authentification sociale */}
        <Suspense fallback={<LoadingSpinner />}>
          <SocialAuth mode="login" />
        </Suspense>

        {/* Séparateur */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-muted" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Ou continuez avec votre téléphone
            </span>
          </div>
        </div>

        {/* Formulaire principal */}
        <Suspense fallback={
          <div className="space-y-4">
            <div className="h-12 bg-muted rounded-lg animate-pulse" />
            <div className="h-12 bg-muted rounded-lg animate-pulse" />
            <div className="h-12 bg-muted rounded-lg animate-pulse" />
          </div>
        }>
          <LoginForm />
        </Suspense>

        {/* Liens utiles */}
        <div className="space-y-4 text-center text-sm">
          {/* Mot de passe oublié */}
          <Link 
            href="/auth/forgot-password"
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Mot de passe oublié ?
          </Link>

          {/* Lien d'inscription */}
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <span>Pas encore de compte ?</span>
            <Link 
              href="/auth/register"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Créer un compte
            </Link>
          </div>

          {/* Support */}
          <div className="pt-4 border-t border-muted">
            <p className="text-xs text-muted-foreground mb-2">
              Besoin d'aide ?
            </p>
            <div className="flex items-center justify-center gap-4 text-xs">
              <Link 
                href="/support"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Centre d'aide
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link 
                href="/contact"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Contacter le support
              </Link>
            </div>
          </div>
        </div>

        {/* Badge de sécurité */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>
            Connexion sécurisée avec chiffrement SSL
          </span>
        </div>
      </div>

      {/* === AVANTAGES DE LA CONNEXION === */}
      <div className="mt-8 space-y-4">
        <h3 className="font-semibold text-center text-muted-foreground">
          Pourquoi se connecter ?
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          {[
            {
              icon: "📝",
              title: "Gérer vos annonces",
              description: "Créer, modifier et suivre vos annonces"
            },
            {
              icon: "💰", 
              title: "Paiements sécurisés",
              description: "Orange Money, Wave et Free Money"
            },
            {
              icon: "📊",
              title: "Statistiques détaillées", 
              description: "Vues, contacts et performances"
            },
            {
              icon: "⭐",
              title: "Annonces premium",
              description: "Boostez la visibilité de vos ventes"
            }
          ].map((benefit, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <span className="text-lg" role="img" aria-label={benefit.title}>
                {benefit.icon}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-foreground">
                  {benefit.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* === DONNÉES LÉGALES === */}
      <div className="mt-8 pt-6 border-t border-muted text-center">
        <p className="text-xs text-muted-foreground leading-relaxed">
          En vous connectant, vous acceptez nos{' '}
          <Link href="/legal/terms" className="text-primary hover:underline">
            Conditions d'utilisation
          </Link>
          {' '}et notre{' '}
          <Link href="/legal/privacy" className="text-primary hover:underline">
            Politique de confidentialité
          </Link>
          .
        </p>
        
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            🇸🇳 Fait au Sénégal
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            🔒 Données protégées
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            📱 Support 7j/7
          </span>
        </div>
      </div>
    </AuthLayout>
  )
}