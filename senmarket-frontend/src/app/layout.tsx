// ================================================
// LAYOUT PRINCIPAL - src/app/layout.tsx
// SenMarket - Marketplace Premium du Sénégal 🇸🇳
// ================================================

import type { Metadata, Viewport } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

// === CONFIGURATION FONTS ===
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

// === METADATA SEO ===
export const metadata: Metadata = {
  title: {
    default: 'SenMarket - Marketplace #1 du Sénégal 🇸🇳',
    template: '%s | SenMarket'
  },
  description: 'Le marketplace premium du Sénégal. Achetez et vendez en toute sécurité avec SenMarket. Paiement Orange Money, Wave et Free Money intégrés.',
  keywords: [
    'marketplace sénégal',
    'vente en ligne sénégal',
    'achat en ligne dakar',
    'orange money',
    'wave sénégal',
    'free money',
    'e-commerce sénégal',
    'senmarket',
    'petites annonces sénégal'
  ],
  authors: [{ name: 'SenMarket Team' }],
  creator: 'SenMarket',
  publisher: 'SenMarket',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://senmarket.sn'),
  alternates: {
    canonical: '/',
    languages: {
      'fr-SN': '/fr',
      'wo-SN': '/wo',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_SN',
    url: 'https://senmarket.sn',
    title: 'SenMarket - Marketplace #1 du Sénégal',
    description: 'Le marketplace premium du Sénégal. Achetez et vendez en toute sécurité.',
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
    description: 'Le marketplace premium du Sénégal. Paiement Orange Money intégré.',
    images: ['/og-image.jpg'],
    creator: '@senmarket_sn',
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
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  category: 'technology',
}

// === VIEWPORT CONFIGURATION ===
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0E2F4F' },
  ],
  colorScheme: 'light dark',
}

// === INTERFACE PROPS ===
interface RootLayoutProps {
  children: React.ReactNode
}

// === COMPOSANT PRINCIPAL ===
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html 
      lang="fr" 
      suppressHydrationWarning
      className={cn(
        'min-h-screen bg-background font-sans antialiased',
        inter.variable,
        poppins.variable
      )}
    >
      <head>
        {/* === PWA MANIFEST === */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* === APPLE PWA === */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SenMarket" />
        
        {/* === FAVICONS === */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* === PRECONNECT EXTERNES === */}
        <link rel="preconnect" href="https://api.senmarket.sn" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* === DNS PREFETCH === */}
        <link rel="dns-prefetch" href="//api.senmarket.sn" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        
        {/* === MICROSOFT TILES === */}
        <meta name="msapplication-TileColor" content="#154475" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* === STRUCTURED DATA === */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "SenMarket",
              "alternateName": "SenMarket Sénégal",
              "description": "Le marketplace premium du Sénégal",
              "url": "https://senmarket.sn",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://senmarket.sn/search?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              },
              "sameAs": [
                "https://facebook.com/senmarket.sn",
                "https://twitter.com/senmarket_sn",
                "https://instagram.com/senmarket_sn",
                "https://linkedin.com/company/senmarket"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+221-77-123-4567",
                "contactType": "customer service",
                "availableLanguage": ["French", "Wolof"],
                "areaServed": "SN"
              }
            })
          }}
        />
      </head>
      
      <body 
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          'selection:bg-primary/20 selection:text-primary-foreground'
        )}
      >
        {/* === PROVIDERS GLOBAUX === */}
        <Providers>
          {/* === STRUCTURE PRINCIPALE === */}
          <div className="relative flex min-h-screen flex-col">
            
            {/* === HEADER === */}
            <Header />
            
            {/* === CONTENU PRINCIPAL === */}
            <main className="flex-1">
              {children}
            </main>
            
            {/* === FOOTER === */}
            <Footer />
            
          </div>
          
          {/* === NOTIFICATIONS === */}
          <Toaster />
          
        </Providers>
        
        {/* === SERVICE WORKER === */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `
          }}
        />
        
        {/* === ANALYTICS (Google Analytics 4) === */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXXXX', {
                page_title: document.title,
                page_location: window.location.href,
                custom_map: {'custom_parameter': 'senegal_marketplace'}
              });
            `
          }}
        />
        
        {/* === CRISP CHAT (Support client) === */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.$crisp=[];
              window.CRISP_WEBSITE_ID="your-crisp-id";
              (function(){
                d=document;
                s=d.createElement("script");
                s.src="https://client.crisp.chat/l.js";
                s.async=1;
                d.getElementsByTagName("head")[0].appendChild(s);
              })();
            `
          }}
        />
        
      </body>
    </html>
  )
}