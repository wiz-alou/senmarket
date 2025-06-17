// ================================================
// PAGE D'INSCRIPTION - src/app/auth/register/page.tsx
// SenMarket - Créer un compte Premium 📝
// ================================================

import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { RegisterForm } from '@/components/forms/register-form'
import { SocialAuth } from '@/components/auth/social-auth'
import { AuthLayout } from '@/components/layout/auth-layout'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { RegistrationBenefits } from '@/components/auth/registration-benefits'

// === METADATA SEO ===
export const metadata: Metadata = {
  title: 'Créer un compte | SenMarket',
  description: 'Rejoignez SenMarket et commencez à vendre dès aujourd\'hui. Inscription gratuite avec vérification SMS instantanée.',
  keywords: [
    'inscription senmarket',
    'créer compte marketplace sénégal',
    'vendre en ligne sénégal',
    'inscription gratuite dakar'
  ],
  robots: {
    index: true,
    follow: true,
  },
}

// === COMPOSANT PRINCIPAL ===
export default function RegisterPage() {
  return (
    <AuthLayout
      title="Rejoignez SenMarket"
      subtitle="Le marketplace #1 du Sénégal vous attend"
      imageSrc="/images/auth/register-senegal.jpg"
      imageAlt="Marché vibrant de Dakar"
    >
      {/* === FORMULAIRE D'INSCRIPTION === */}
      <div className="space-y-6">
        {/* En-tête */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gradient">
            Créer un Compte
          </h1>
          <p className="text-muted-foreground">
            Rejoignez plus de 50,000 Sénégalais qui font confiance à SenMarket
          </p>
        </div>

        {/* Étapes d'inscription */}
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center font-medium">
                1
              </div>
              <span className="text-primary font-medium">Informations</span>
            </div>
            <div className="flex-1 h-px bg-muted mx-2"></div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center font-medium">
                2
              </div>
              <span className="text-muted-foreground">Vérification SMS</span>
            </div>
            <div className="flex-1 h-px bg-muted mx-2"></div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center font-medium">
                3
              </div>
              <span className="text-muted-foreground">Profil complet</span>
            </div>
          </div>
        </div>

        {/* Authentification sociale */}
        <Suspense fallback={<LoadingSpinner />}>
          <SocialAuth mode="register" />
        </Suspense>

        {/* Séparateur */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-muted" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Ou créez votre compte avec votre téléphone
            </span>
          </div>
        </div>

        {/* Formulaire principal */}
        <Suspense fallback={
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        }>
          <RegisterForm />
        </Suspense>

        {/* Liens utiles */}
        <div className="space-y-4 text-center text-sm">
          {/* Lien de connexion */}
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <span>Déjà un compte ?</span>
            <Link 
              href="/auth/login"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Se connecter
            </Link>
          </div>

          {/* Support d'inscription */}
          <div className="pt-4 border-t border-muted">
            <p className="text-xs text-muted-foreground mb-2">
              Problème d'inscription ?
            </p>
            <div className="flex items-center justify-center gap-4 text-xs">
              <Link 
                href="/support/inscription"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Guide d'inscription
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link 
                href="/contact"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Aide en direct
              </Link>
            </div>
          </div>
        </div>

        {/* Badges de confiance */}
        <div className="space-y-3">
          {/* Badge de sécurité */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-green-50 border border-green-200 rounded-lg p-3">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-green-800">
              Inscription 100% gratuite et sécurisée
            </span>
          </div>

          {/* Badge Sénégal */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
            <span className="text-lg">🇸🇳</span>
            <span className="text-blue-800">
              Plateforme 100% sénégalaise - Support en français et wolof
            </span>
          </div>
        </div>
      </div>

      {/* === AVANTAGES DE L'INSCRIPTION === */}
      <Suspense fallback={<LoadingSpinner />}>
        <RegistrationBenefits />
      </Suspense>

      {/* === TÉMOIGNAGES RAPIDES === */}
      <div className="mt-8 space-y-4">
        <h3 className="font-semibold text-center text-muted-foreground">
          Ce que disent nos membres
        </h3>
        
        <div className="space-y-3">
          {[
            {
              name: "Aminata D.",
              location: "Dakar",
              comment: "J'ai vendu ma voiture en 2 jours ! SenMarket c'est vraiment pratique.",
              rating: 5
            },
            {
              name: "Moussa S.",
              location: "Thiès", 
              comment: "Paiement Orange Money direct, c'est révolutionnaire au Sénégal !",
              rating: 5
            },
            {
              name: "Fatou K.",
              location: "Saint-Louis",
              comment: "Interface simple, pas de complications. Exactement ce qu'il nous fallait.",
              rating: 5
            }
          ].map((testimonial, index) => (
            <div key={index} className="bg-muted/30 rounded-lg p-4 border border-muted/50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-ocean rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {testimonial.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{testimonial.name}</span>
                    <span className="text-xs text-muted-foreground">• {testimonial.location}</span>
                    <div className="flex items-center">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <svg key={i} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    "{testimonial.comment}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* === STATISTIQUES === */}
      <div className="mt-8 bg-gradient-ocean text-white rounded-xl p-6">
        <h3 className="font-semibold text-center mb-4">
          Rejoignez une communauté qui grandit
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold mb-1">50K+</div>
            <div className="text-xs opacity-90">Utilisateurs actifs</div>
          </div>
          <div>
            <div className="text-2xl font-bold mb-1">150K+</div>
            <div className="text-xs opacity-90">Annonces publiées</div>
          </div>
          <div>
            <div className="text-2xl font-bold mb-1">25K+</div>
            <div className="text-xs opacity-90">Ventes réussies</div>
          </div>
          <div>
            <div className="text-2xl font-bold mb-1">16</div>
            <div className="text-xs opacity-90">Régions couvertes</div>
          </div>
        </div>
      </div>

      {/* === DONNÉES LÉGALES === */}
      <div className="mt-8 pt-6 border-t border-muted text-center">
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          En créant un compte, vous acceptez nos{' '}
          <Link href="/legal/terms" className="text-primary hover:underline">
            Conditions d'utilisation
          </Link>
          {' '}et notre{' '}
          <Link href="/legal/privacy" className="text-primary hover:underline">
            Politique de confidentialité
          </Link>
          . Vous confirmez également avoir au moins 18 ans.
        </p>
        
        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div className="flex items-center justify-center gap-1">
            🔒 Données cryptées
          </div>
          <div className="flex items-center justify-center gap-1">
            📱 SMS gratuit
          </div>
          <div className="flex items-center justify-center gap-1">
            💰 Aucun frais caché
          </div>
          <div className="flex items-center justify-center gap-1">
            🇸🇳 Support local
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}