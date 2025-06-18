import Link from 'next/link'
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  const footerSections = {
    marketplace: {
      title: 'Marketplace',
      links: [
        { name: 'Toutes les annonces', href: '/listings' },
        { name: 'Véhicules', href: '/categories/vehicles' },
        { name: 'Immobilier', href: '/categories/real-estate' },
        { name: 'Électronique', href: '/categories/electronics' },
        { name: 'Mode & Beauté', href: '/categories/fashion' },
      ]
    },
    services: {
      title: 'Services',
      links: [
        { name: 'Comment vendre', href: '/help/selling' },
        { name: 'Comment acheter', href: '/help/buying' },
        { name: 'Paiements sécurisés', href: '/help/payments' },
        { name: 'Livraison', href: '/help/delivery' },
        { name: 'Support client', href: '/support' },
      ]
    },
    company: {
      title: 'Entreprise',
      links: [
        { name: 'À propos', href: '/about' },
        { name: 'Carrières', href: '/careers' },
        { name: 'Presse', href: '/press' },
        { name: 'Partenaires', href: '/partners' },
        { name: 'Blog', href: '/blog' },
      ]
    },
    legal: {
      title: 'Légal',
      links: [
        { name: 'Conditions d\'utilisation', href: '/terms' },
        { name: 'Politique de confidentialité', href: '/privacy' },
        { name: 'Cookies', href: '/cookies' },
        { name: 'Signaler un problème', href: '/report' },
      ]
    }
  }

  const paymentMethods = [
    { name: 'Orange Money', logo: '🍊' },
    { name: 'Wave', logo: '🌊' },
    { name: 'Free Money', logo: '💳' },
    { name: 'Carte bancaire', logo: '💳' },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      {/* Section principale */}
      <div className="container-fluid py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Logo et description */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <div className="text-2xl font-black text-gradient-ocean">
                🇸🇳 SenMarket
              </div>
            </Link>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              Le marketplace premium du Sénégal. Achetez et vendez en toute sécurité 
              avec des paiements mobile intégrés.
            </p>

            {/* Informations de contact */}
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Dakar, Sénégal</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>221  77  708 07 57</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>contact@senmarket.sn</span>
              </div>
            </div>
          </div>

          {/* Sections de liens */}
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Section méthodes de paiement */}
      <div className="border-t border-gray-800 py-8">
        <div className="container-fluid">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Méthodes de paiement */}
            <div className="flex items-center space-x-6">
              <span className="text-gray-400 text-sm font-medium">Paiements sécurisés :</span>
              <div className="flex items-center space-x-4">
                {paymentMethods.map((method) => (
                  <div key={method.name} className="flex items-center space-x-1">
                    <span className="text-lg">{method.logo}</span>
                    <span className="text-sm text-gray-400">{method.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Réseaux sociaux */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm font-medium">Suivez-nous :</span>
              <div className="flex space-x-3">
                <Link 
                  href="#" 
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                >
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link 
                  href="#" 
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                >
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link 
                  href="#" 
                  className="text-gray-400 hover:text-pink-400 transition-colors duration-200"
                >
                  <Instagram className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800 py-6">
        <div className="container-fluid">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2025 SenMarket. Tous droits réservés.
            </p>
            <p className="text-gray-400 text-sm">
              Fabriqué avec ❤️ au Sénégal
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}