import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/sonner'
import { Analytics } from '@/components/analytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SenMarket - Marketplace Premium du Sénégal 🇸🇳',
  description: 'Le marketplace ultra-premium du Sénégal avec design océanique moderne et paiements mobile intégrés.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={inter.className}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <main className="flex-1">
              {children}
            </main>
          </div>
          
          <Toaster />
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}