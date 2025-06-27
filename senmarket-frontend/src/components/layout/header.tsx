
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth.store'
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
  Plus,
  Search,
  Heart,
  Star,
  Crown,
  Zap,
  Activity,
  Globe,
  Award,
  Sparkles,
  TrendingUp,
  Eye,
  MailIcon as Mail
} from 'lucide-react'

export function Header() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [notifications, setNotifications] = useState(3)

  // ✅ FONCTION POUR GÉRER LE CONTACT
  const handleContactClick = () => {
    const footer = document.querySelector('footer')
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }

  // ✅ FONCTION POUR SCROLL VERS SECTION CATEGORIES
  const handleCategoriesClick = () => {
    // Si on est sur la homepage, scroll vers la section
    if (window.location.pathname === '/') {
      const categoriesSection = document.querySelector('#categories-section')
      if (categoriesSection) {
        categoriesSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }
    } else {
      // Si on est sur une autre page, aller à la homepage puis scroll
      router.push('/#categories-section')
    }
    setIsMobileMenuOpen(false)
  }

  // ✅ NAVIGATION ENRICHIE AVEC ICÔNES
  const navigation = [
    { 
      name: 'Accueil', 
      href: '/', 
      icon: Building, 
      description: 'Découvrir SenMarket' 
    },
    { 
      name: 'Annonces', 
      href: '/listings', 
      icon: Package, 
      description: 'Explorer les offres',
      badge: '8+' 
    },
    { 
      name: 'Catégories', 
      href: '#categories-section', 
      icon: TrendingUp, 
      description: 'Parcourir par thème',
      onClick: handleCategoriesClick
    },
  ]

  // ✅ EFFET SCROLL POUR HEADER DYNAMIQUE
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ✅ FERMER MENUS AU CLIC EXTÉRIEUR
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu && !(event.target as Element).closest('.user-menu-container')) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showUserMenu])

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
    setIsMobileMenuOpen(false)
    router.push('/')
  }

  // ✅ QUICK ACTIONS POUR UTILISATEUR CONNECTÉ
  const quickActions = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: Activity, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50' 
    },
    { 
      name: 'Mes Annonces', 
      href: '/dashboard', 
      icon: Package, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50' 
    },
    { 
      name: 'Messages', 
      href: '/dashboard', 
      icon: MessageSquare, 
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      badge: notifications > 0 ? notifications : undefined 
    },
    { 
      name: 'Favoris', 
      href: '/favorites', 
      icon: Heart, 
      color: 'text-red-600',
      bgColor: 'bg-red-50' 
    },
  ]

  return (
    <>
      {/* Top Bar Premium */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white py-2 text-sm hidden lg:block overflow-hidden relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="container mx-auto px-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-blue-300" />
                <span>Support 24/7 : <strong>+221 77 708 07 57</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-300" />
                <span>Transactions <strong>100% sécurisées</strong> Orange Money</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-yellow-300 animate-pulse" />
                <span><strong>8+ annonces</strong> en ligne</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <button 
                onClick={handleContactClick}
                className="hover:text-blue-200 transition-colors cursor-pointer flex items-center space-x-1 group"
              >
                <span>Centre d'aide</span>
                <div className="w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
              <div className="h-4 w-px bg-white/20"></div>
              <Link 
                href="/dashboard" 
                className="hover:text-blue-200 transition-colors flex items-center space-x-1 group"
              >
                <Crown className="h-3 w-3 text-yellow-300" />
                <span><strong>SenMarket Pro</strong></span>
                <Sparkles className="h-3 w-3 text-yellow-300 group-hover:animate-pulse" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Header Principal Ultra-Premium */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-lg' 
          : 'bg-white border-b border-gray-200 shadow-sm'
      }`}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* Logo Premium */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-white font-bold text-lg lg:text-xl">S</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Crown className="h-2 w-2 text-white" />
                </div>
              </div>
              <div>
                <div className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  SenMarket
                </div>
                <div className="text-xs text-slate-500 -mt-1 group-hover:text-blue-600 transition-colors">
                  Marketplace #1 du Sénégal 🇸🇳
                </div>
              </div>
            </Link>

            {/* Navigation Premium */}
            <nav className="hidden lg:flex items-center space-x-2">
              {navigation.map((item, index) => {
                const IconComponent = item.icon
                return (
                  <div key={item.name}>
                    {item.onClick ? (
                      <button
                        onClick={item.onClick}
                        className="group px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 text-slate-600 hover:text-slate-900 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 relative overflow-hidden"
                      >
                        <div className="flex items-center space-x-2 relative z-10">
                          <IconComponent className="h-4 w-4 group-hover:text-blue-600 transition-colors" />
                          <span>{item.name}</span>
                          {item.badge && (
                            <Badge className="bg-blue-500 text-white text-xs px-1.5 py-0.5 group-hover:bg-blue-600">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Effet hover background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                        
                        {/* Tooltip */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap">
                          {item.description}
                        </div>
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        className="group px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 text-slate-600 hover:text-slate-900 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 relative overflow-hidden"
                      >
                        <div className="flex items-center space-x-2 relative z-10">
                          <IconComponent className="h-4 w-4 group-hover:text-blue-600 transition-colors" />
                          <span>{item.name}</span>
                          {item.badge && (
                            <Badge className="bg-blue-500 text-white text-xs px-1.5 py-0.5 group-hover:bg-blue-600">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Effet hover background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                        
                        {/* Tooltip */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap">
                          {item.description}
                        </div>
                      </Link>
                    )}
                  </div>
                )
              })}
            </nav>

            {/* Actions selon l'état d'authentification */}
            <div className="hidden lg:flex items-center space-x-3">
              
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-3">
                  {/* Recherche rapide */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl"
                    onClick={() => router.push('/listings')}
                  >
                    <Search className="h-5 w-5" />
                  </Button>

                  {/* Favoris avec animation */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-slate-600 hover:text-red-500 hover:bg-red-50 rounded-xl relative group"
                    onClick={() => router.push('/favorites')}
                  >
                    <Heart className="h-5 w-5 group-hover:fill-current transition-all duration-300" />
                  </Button>

                  {/* Notifications avec badge */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl relative"
                  >
                    <Bell className="h-5 w-5" />
                    {notifications > 0 && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                        {notifications}
                      </div>
                    )}
                  </Button>

                  {/* Menu utilisateur connecté Premium */}
                  <div className="relative user-menu-container">
                    <Button 
                      variant="ghost" 
                      className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
                      onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center relative">
                        <span className="text-white font-medium text-sm">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </span>
                        {user.is_verified && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="text-left text-sm">
                        <div className="font-medium text-slate-900">{user.first_name}</div>
                        <div className="text-xs text-slate-500 flex items-center space-x-1">
                          {user.is_verified ? (
                            <>
                              <Star className="h-3 w-3 text-green-500" />
                              <span>Vérifié</span>
                            </>
                          ) : (
                            <span>Non vérifié</span>
                          )}
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </Button>

                    {/* Dropdown menu Premium */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl py-4 z-50 overflow-hidden">
                        {/* Header du menu */}
                        <div className="px-6 py-4 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {user.first_name?.[0]}{user.last_name?.[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{user.first_name} {user.last_name}</p>
                              <p className="text-sm text-slate-500">{user.phone}</p>
                              {user.is_verified && (
                                <Badge className="bg-green-100 text-green-800 text-xs mt-1">
                                  <Star className="h-3 w-3 mr-1" />
                                  Compte vérifié
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Quick Actions Grid */}
                        <div className="px-6 py-4">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Actions rapides</p>
                          <div className="grid grid-cols-2 gap-3">
                            {quickActions.map((action, index) => {
                              const ActionIcon = action.icon
                              return (
                                <Link
                                  key={action.name}
                                  href={action.href}
                                  className={`${action.bgColor} ${action.color} p-3 rounded-xl hover:scale-105 transition-all duration-200 relative`}
                                  onClick={() => setShowUserMenu(false)}
                                >
                                  <ActionIcon className="h-5 w-5 mb-1" />
                                  <p className="text-xs font-medium">{action.name}</p>
                                  {action.badge && (
                                    <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full p-0 flex items-center justify-center">
                                      {action.badge}
                                    </Badge>
                                  )}
                                </Link>
                              )
                            })}
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="px-2">
                          <Link 
                            href="/dashboard" 
                            className="flex items-center px-4 py-3 mx-2 rounded-xl hover:bg-slate-50 text-slate-700 group transition-all duration-200"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Settings className="h-4 w-4 mr-3 group-hover:text-blue-600 transition-colors" />
                            <span>Paramètres du compte</span>
                          </Link>
                        </div>
                        
                        <div className="border-t border-gray-100 mt-2 pt-2 px-2">
                          <button 
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 mx-2 rounded-xl hover:bg-red-50 text-red-600 group transition-all duration-200"
                          >
                            <LogOut className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
                            <span>Déconnexion</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ✅ Bouton publier Premium - UNIQUEMENT pour utilisateur connecté */}
                  <Button 
                    onClick={() => router.push('/sell')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                  >
                    <div className="flex items-center space-x-2 relative z-10">
                      <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                      <span>Publier</span>
                      <Zap className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    {/* Effet brillant */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  {/* ✅ Utilisateur NON connecté - SEULEMENT Connexion et S'inscrire */}
                  <Button 
                    variant="ghost" 
                    onClick={() => router.push('/auth/login')}
                    className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl px-6 py-2.5 font-medium transition-all duration-200"
                  >
                    Connexion
                  </Button>
                  
                  <Button 
                    onClick={() => router.push('/auth/register')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                  >
                    <div className="flex items-center space-x-2 relative z-10">
                      <User className="h-4 w-4" />
                      <span>S'inscrire</span>
                      <Sparkles className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    {/* Effet brillant */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </Button>
                </div>
              )}
            </div>

            {/* Menu Mobile Button */}
            <div className="lg:hidden flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-600 rounded-xl"
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

        {/* Menu Mobile Premium */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl">
            <div className="py-6 space-y-4">
              
              {/* Navigation mobile */}
              <div className="px-6 space-y-2">
                {navigation.map((item, index) => {
                  const IconComponent = item.icon
                  return (
                    <div key={item.name}>
                      {item.onClick ? (
                        <button
                          onClick={item.onClick}
                          className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-medium text-sm text-slate-600 hover:text-slate-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
                        >
                          <IconComponent className="h-5 w-5" />
                          <span>{item.name}</span>
                          {item.badge && (
                            <Badge className="bg-blue-500 text-white text-xs ml-auto">
                              {item.badge}
                            </Badge>
                          )}
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          className="flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm text-slate-600 hover:text-slate-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <IconComponent className="h-5 w-5" />
                          <span>{item.name}</span>
                          {item.badge && (
                            <Badge className="bg-blue-500 text-white text-xs ml-auto">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      )}
                    </div>
                  )
                })}
                
                <button
                  onClick={handleContactClick}
                  className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-medium text-sm text-slate-600 hover:text-slate-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
                >
                  <Mail className="h-5 w-5" />
                  <span>Contact & Support</span>
                </button>
              </div>

              {/* Actions mobile */}
              <div className="px-6 pt-4 border-t border-gray-200 space-y-4">
                {isAuthenticated && user ? (
                  <>
                    {/* Profil utilisateur mobile */}
                    <div className="flex items-center space-x-4 px-4 py-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center relative">
                        <span className="text-white font-bold text-lg">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </span>
                        {user.is_verified && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{user.first_name} {user.last_name}</p>
                        <p className="text-sm text-slate-500">{user.phone}</p>
                        {user.is_verified && (
                          <Badge className="bg-green-100 text-green-800 text-xs mt-1">
                            <Star className="h-3 w-3 mr-1" />
                            Vérifié
                          </Badge>
                        )}
                      </div>
                      {notifications > 0 && (
                        <Badge className="bg-red-500 text-white">
                          {notifications}
                        </Badge>
                      )}
                    </div>
                    
                    <Button 
                      onClick={() => {
                        router.push('/dashboard')
                        setIsMobileMenuOpen(false)
                      }}
                      variant="outline" 
                      className="w-full justify-start rounded-xl border-blue-200 hover:bg-blue-50 transition-all duration-200"
                    >
                      <Activity className="h-4 w-4 mr-3 text-blue-600" />
                      Dashboard
                    </Button>
                    
                    {/* ✅ Bouton publier SEULEMENT pour utilisateur connecté en mobile */}
                    <Button 
                      onClick={() => {
                        router.push('/sell')
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg"
                    >
                      <Plus className="h-4 w-4 mr-3" />
                      Publier une annonce
                      <Zap className="h-4 w-4 ml-auto" />
                    </Button>
                    
                    <Button 
                      onClick={() => {
                        handleLogout()
                        setIsMobileMenuOpen(false)
                      }}
                      variant="outline" 
                      className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 rounded-xl transition-all duration-200"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
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
                      className="w-full justify-start rounded-xl border-blue-200 hover:bg-blue-50 transition-all duration-200"
                    >
                      <User className="h-4 w-4 mr-3 text-blue-600" />
                      Connexion
                    </Button>
                    
                    <Button 
                      onClick={() => {
                        router.push('/auth/register')
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg"
                    >
                      <User className="h-4 w-4 mr-3" />
                      S'inscrire gratuitement
                      <Sparkles className="h-4 w-4 ml-auto" />
                    </Button>
                  </>
                )}
              </div>

              {/* Contact mobile premium */}
              <div className="px-6 pt-4 border-t border-gray-200">
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span>Support & Sécurité</span>
                  </p>
                  
                  <div className="grid grid-cols-1 gap-2 text-sm text-slate-600">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-green-500" />
                      <span><strong>+221 77 708 07 57</strong> • Support 24/7</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span>Paiements <strong>100% sécurisés</strong></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-blue-500" />
                      <span><strong>8+ annonces</strong> • Marketplace actif</span>
                    </div>
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