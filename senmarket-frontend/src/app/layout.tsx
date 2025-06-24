import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProviders } from '@/components/providers/app-providers'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { OfflineBanner } from '@/components/ui/offline-banner'
import { FavoritesInitializer } from '@/components/providers/favorites-initializer'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'SenMarket - Marketplace #1 du Sénégal',
    template: '%s | SenMarket'
  },
  description: 'Achetez et vendez facilement sur la marketplace #1 du Sénégal. Véhicules, immobilier, électronique et plus encore. Paiement sécurisé avec Orange Money.',
  keywords: [
    'marketplace', 'sénégal', 'dakar', 'vente', 'achat', 
    'véhicules', 'immobilier', 'électronique', 'orange money'
  ],
  authors: [{ name: 'SenMarket Team' }],
  creator: 'SenMarket',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'fr_SN',
    url: '/',
    title: 'SenMarket - Marketplace #1 du Sénégal',
    description: 'Achetez et vendez facilement sur la marketplace #1 du Sénégal',
    siteName: 'SenMarket',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SenMarket - Marketplace du Sénégal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SenMarket - Marketplace #1 du Sénégal',
    description: 'Achetez et vendez facilement sur la marketplace #1 du Sénégal',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Preconnect aux domaines externes */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Theme color pour le navigateur mobile */}
        <meta name="theme-color" content="#1f2937" />
        <meta name="msapplication-TileColor" content="#1f2937" />
        
        {/* Viewport optimisé */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        
        {/* PWA tags */}
        <meta name="application-name" content="SenMarket" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SenMarket" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Structured Data pour SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "SenMarket",
              "description": "Marketplace #1 du Sénégal",
              "url": process.env.NEXT_PUBLIC_SITE_URL,
              "logo": `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+221-77-708-07-57",
                "contactType": "Customer Service",
                "availableLanguage": ["French", "Wolof"]
              },
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "SN",
                "addressLocality": "Dakar"
              },
              "sameAs": [
                "https://facebook.com/senmarket",
                "https://twitter.com/senmarket",
                "https://instagram.com/senmarket"
              ]
            })
          }}
        />
      </head>
      <body className={`${inter.className} antialiased min-h-screen bg-background font-sans`}>
        <ErrorBoundary>
          <AppProviders>
            <FavoritesInitializer>
              <OfflineBanner />
              <div className="relative flex min-h-screen flex-col">
                {children}
              </div>
            </FavoritesInitializer>
          </AppProviders>
        </ErrorBoundary>
      </body>
    </html>
  )
}