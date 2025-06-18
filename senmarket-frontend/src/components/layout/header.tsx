'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Menu, 
  X, 
  User, 
  Bell,
  Settings,
  ChevronDown,
  Building,
  Shield,
  Phone
} from 'lucide-react'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Accueil', href: '/', active: true },
    { name: 'Solutions', href: '/solutions' },
    { name: 'Marketplace', href: '/marketplace' },
    { name: 'Entreprises', href: '/business' },
    { name: 'Support', href: '/support' },
  ]

  return (
    <>
      {/* Top Bar Professionnel */}
      <div className="bg-slate-900 text-white py-2 text-sm hidden lg:block">
        <div className="container-fluid">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>Support 24/7 : +221  77  708 07 57</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Transactions sécurisées certifiées</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/enterprise" className="hover:text-blue-200 transition-colors">
                Espace Entreprise
              </Link>
              <span>•</span>
              <Link href="/investor" className="hover:text-blue-200 transition-colors">
                Relations Investisseurs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Header Principal */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container-fluid">
          <div className="flex items-center justify-between h-18 lg:h-20">
            
            {/* Logo Professionnel */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <div>
                  <div className="text-xl lg:text-2xl font-bold text-slate-900">
                    SenMarket
                  </div>
                  <div className="text-xs text-slate-500 -mt-1">
                    Marketplace Professionnel
                  </div>
                </div>
              </div>
            </Link>

            {/* Navigation Professionnelle */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    item.active 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Actions Professionnelles */}
            <div className="hidden lg:flex items-center space-x-3">
              
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative text-slate-600 hover:text-slate-900">
                <Bell className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></div>
              </Button>

              {/* Compte Entreprise */}
              <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
                <div className="text-right text-sm">
                  <div className="font-medium text-slate-900">Espace Client</div>
                  <div className="text-xs text-slate-500">Professionnel</div>
                </div>
                
                <Button variant="ghost" className="flex items-center space-x-2 p-2">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-slate-600" />
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </Button>
              </div>

              {/* CTA Principal */}
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg shadow-sm">
                <Building className="h-4 w-4 mr-2" />
                Publier une annonce
              </Button>
            </div>

            {/* Menu Mobile */}
            <div className="lg:hidden flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-600"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Menu Mobile Professionnel */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="py-4 space-y-2">
              
              {/* Navigation mobile */}
              <div className="px-4 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                      item.active 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Actions mobile */}
              <div className="px-4 pt-4 border-t border-gray-200 space-y-3">
                <Button variant="outline" className="w-full justify-start border-slate-200 text-slate-700">
                  <User className="h-4 w-4 mr-2" />
                  Espace Client
                </Button>
                
                <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
                  <Building className="h-4 w-4 mr-2" />
                  Publier une annonce
                </Button>
              </div>

              {/* Contact mobile */}
              <div className="px-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-slate-600 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>Support : +221  77  708 07 57</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Transactions sécurisées</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}