// ================================================
// AUTH LAYOUT - src/components/layout/auth-layout.tsx
// SenMarket - Layout d'authentification premium 🔐
// ================================================

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ExternalLink } from 'lucide-react'

// === INTERFACE PROPS ===
interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  imageSrc: string
  imageAlt: string
}

// === COMPOSANT PRINCIPAL ===
export function AuthLayout({ 
  children, 
  title, 
  subtitle, 
  imageSrc, 
  imageAlt 
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* === HEADER MINIMAL === */}
      <header className="bg-white border-b border-slate-200">
        <div className="container-fluid py-4">
          <div className="flex items-center justify-between">
            {/* Logo et retour */}
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour à l'accueil
                </Button>
              </Link>
              <div className="h-6 w-px bg-slate-300" />
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-ocean rounded-lg flex items-center justify-center text-white font-bold">
                  S
                </div>
                <div>
                  <div className="font-bold text-gradient">SenMarket</div>
                  <div className="text-xs text-muted-foreground">Marketplace du Sénégal</div>
                </div>
              </Link>
            </div>

            {/* Liens d'aide */}
            <div className="flex items-center gap-4 text-sm">
              <Link 
                href="/help" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Centre d'aide
              </Link>
              <Link 
                href="/contact" 
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                Support
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* === CONTENU PRINCIPAL === */}
      <div className="flex min-h-[calc(100vh-80px)]">
        
        {/* === COLONNE GAUCHE - FORMULAIRE === */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md space-y-8">
            {children}
          </div>
        </div>

        {/* === COLONNE DROITE - IMAGE === */}
        <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-gradient-to-br from-blue-100 to-teal-100">
          
          {/* Image de fond */}
          <div className="absolute inset-0">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-teal-900/20" />
          </div>

          {/* Contenu superposé */}
          <div className="relative z-10 flex flex-col justify-end p-12 text-white">
            
            {/* Citation/Témoignage */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="space-y-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                
                <blockquote className="text-lg font-medium">
                  "SenMarket a révolutionné ma façon de vendre. En 2 semaines, 
                  j'ai vendu plus qu'en 6 mois sur d'autres plateformes !"
                </blockquote>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-semibold">
                    M
                  </div>
                  <div>
                    <div className="font-semibold">Maimouna Sarr</div>
                    <div className="text-sm opacity-80">Vendeuse à Dakar</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="mt-8 grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold">50K+</div>
                <div className="text-sm opacity-80">Utilisateurs</div>
              </div>
              <div>
                <div className="text-2xl font-bold">150K+</div>
                <div className="text-sm opacity-80">Annonces</div>
              </div>
              <div>
                <div className="text-2xl font-bold">25K+</div>
                <div className="text-sm opacity-80">Ventes</div>
              </div>
            </div>
          </div>

          {/* Badges flottants */}
          <div className="absolute top-8 right-8 space-y-3">
            <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 text-sm">
              🇸🇳 100% Sénégalais
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 text-sm">
              🔒 Sécurisé SSL
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 text-sm">
              📱 Orange Money
            </div>
          </div>
        </div>
      </div>

      {/* === FOOTER MINIMAL === */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="container-fluid">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-6">
              <span>© 2024 SenMarket</span>
              <Link href="/legal/privacy" className="hover:text-primary transition-colors">
                Confidentialité
              </Link>
              <Link href="/legal/terms" className="hover:text-primary transition-colors">
                Conditions
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <span>Disponible en:</span>
              <div className="flex items-center gap-2">
                <button className="px-2 py-1 bg-primary text-white rounded text-xs">FR</button>
                <button className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">WO</button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}