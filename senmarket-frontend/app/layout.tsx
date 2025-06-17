import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SenMarket - Marketplace du Sénégal',
  description: 'Achetez et vendez facilement au Sénégal.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr-SN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
