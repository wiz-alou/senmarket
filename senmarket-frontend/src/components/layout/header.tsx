'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { 
  Menu, 
  X, 
  User, 
  Bell,
  Settings,
  ChevronDown,
  Building,
  Shield,
  Phone,
  LogOut,
  Package,
  CreditCard,
  MessageSquare,
  Plus
} from 'lucide-react'

export function Header() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  // ✅ NAVIGATION SIMPLE SANS DUPLICATION
  const navigation = [
    { name: 'Accueil', href: '/' },
    { name: 'Annonces', href: '/listings' },
  ]

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
    router.push('/')
  }

  // ✅ FONCTION POUR GÉRER LE CONTACT
  const handleContactClick = () => {
    // Scroll vers le footer ou ouvrir modal contact
    const footer = document.querySelector('footer')
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* Top Bar Professionnel */}
      <div className="bg-slate-900 text-white py-2 text-sm hidden lg:block">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>Support 24/7 : +221 77 708 07 57</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Transactions sécurisées avec Orange Money</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleContactClick}
                className="hover:text-blue-200 transition-colors cursor-pointer"
              >
                Centre d'aide
              </button>
              <span>•</span>
              <Link href="/dashboard" className="hover:text-blue-200 transition-colors">
                SenMarket Pro
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Header Principal */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* Logo */}
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
                    Marketplace #1 du Sénégal
                  </div>
                </div>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Actions selon l'état d'authentification */}
            <div className="hidden lg:flex items-center space-x-3">
              
              {isAuthenticated && user ? (
                <>
                  {/* Notifications */}
                  <Button variant="ghost" size="icon" className="relative text-slate-600 hover:text-slate-900">
                    <Bell className="h-5 w-5" />
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></div>
                  </Button>

                  {/* Menu utilisateur connecté */}
                  <div className="relative">
                    <Button 
                      variant="ghost" 
                      className="flex items-center space-x-2 p-2"
                      onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </span>
                      </div>
                      <div className="text-left text-sm">
                        <div className="font-medium text-slate-900">{user.first_name}</div>
                        <div className="text-xs text-slate-500">
                          {user.is_verified ? 'Vérifié' : 'Non vérifié'}
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </Button>

                    {/* Dropdown menu */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-medium text-slate-900">{user.first_name} {user.last_name}</p>
                          <p className="text-sm text-slate-500">{user.phone}</p>
                        </div>
                        
                        <Link 
                          href="/dashboard" 
                          className="flex items-center px-4 py-2 hover:bg-slate-50 text-slate-700"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Package className="h-4 w-4 mr-3" />
                          Dashboard
                        </Link>
                        
                        <Link 
                          href="/dashboard" 
                          className="flex items-center px-4 py-2 hover:bg-slate-50 text-slate-700"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Package className="h-4 w-4 mr-3" />
                          Mes annonces
                        </Link>
                        
                        <Link 
                          href="/dashboard" 
                          className="flex items-center px-4 py-2 hover:bg-slate-50 text-slate-700"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <MessageSquare className="h-4 w-4 mr-3" />
                          Messages
                        </Link>
                        
                        <Link 
                          href="/dashboard" 
                          className="flex items-center px-4 py-2 hover:bg-slate-50 text-slate-700"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <CreditCard className="h-4 w-4 mr-3" />
                          Paiements
                        </Link>
                        
                        <Link 
                          href="/dashboard" 
                          className="flex items-center px-4 py-2 hover:bg-slate-50 text-slate-700"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings className="h-4 w-4 mr-3" />
                          Paramètres
                        </Link>
                        
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button 
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 hover:bg-red-50 text-red-600"
                          >
                            <LogOut className="h-4 w-4 mr-3" />
                            Déconnexion
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ✅ Bouton publier - UNIQUEMENT pour utilisateur connecté */}
                  <Button 
                    onClick={() => router.push('/sell')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg shadow-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Publier
                  </Button>
                </>
              ) : (
                <>
                  {/* ✅ Utilisateur NON connecté - SEULEMENT Connexion et S'inscrire */}
                  <Button 
                    variant="ghost" 
                    onClick={() => router.push('/auth/login')}
                    className="text-slate-600 hover:text-slate-900"
                  >
                    Connexion
                  </Button>
                  
                  <Button 
                    onClick={() => router.push('/auth/register')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg shadow-sm"
                  >
                    S'inscrire
                  </Button>
                </>
              )}
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

        {/* Menu Mobile */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="py-4 space-y-2">
              
              {/* Navigation mobile */}
              <div className="px-4 space-y-1">
                <Link
                  href="/"
                  className="block px-4 py-3 rounded-lg font-medium text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Accueil
                </Link>
                
                <Link
                  href="/listings"
                  className="block px-4 py-3 rounded-lg font-medium text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Annonces
                </Link>
                
                <button
                  onClick={handleContactClick}
                  className="block w-full text-left px-4 py-3 rounded-lg font-medium text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                >
                  Contact
                </button>
              </div>

              {/* Actions mobile */}
              <div className="px-4 pt-4 border-t border-gray-200 space-y-3">
                {isAuthenticated && user ? (
                  <>
                    <div className="flex items-center space-x-3 px-4 py-3 bg-slate-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{user.first_name} {user.last_name}</p>
                        <p className="text-sm text-slate-500">{user.phone}</p>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => {
                        router.push('/dashboard')
                        setIsMobileMenuOpen(false)
                      }}
                      variant="outline" 
                      className="w-full justify-start"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                    
                    {/* ✅ Bouton publier SEULEMENT pour utilisateur connecté en mobile */}
                    <Button 
                      onClick={() => {
                        router.push('/sell')
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Publier une annonce
                    </Button>
                    
                    <Button 
                      onClick={() => {
                        handleLogout()
                        setIsMobileMenuOpen(false)
                      }}
                      variant="outline" 
                      className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Déconnexion
                    </Button>
                  </>
                ) : (
                  <>
                    {/* ✅ Utilisateur NON connecté en mobile - PAS de bouton publier */}
                    <Button 
                      onClick={() => {
                        router.push('/auth/login')
                        setIsMobileMenuOpen(false)
                      }}
                      variant="outline" 
                      className="w-full justify-start"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Connexion
                    </Button>
                    
                    <Button 
                      onClick={() => {
                        router.push('/auth/register')
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <User className="h-4 w-4 mr-2" />
                      S'inscrire
                    </Button>
                  </>
                )}
              </div>

              {/* Contact mobile */}
              <div className="px-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-slate-600 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>Support : +221 77 708 07 57</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Paiements sécurisés Orange Money</span>
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