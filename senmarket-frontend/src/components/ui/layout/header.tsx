// ================================================
// HEADER PRINCIPAL - src/components/layout/header.tsx
// SenMarket - Navigation Premium 🎯
// ================================================

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Search,
  Menu,
  X,
  Plus,
  Heart,
  MessageCircle,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  MapPin
} from 'lucide-react'
import { MobileMenu } from './mobile-menu'
import { SearchDialog } from '../common/search-dialog'
import { NotificationDropdown } from '../common/notification-dropdown'

// === INTERFACE USER ===
interface User {
  id: string
  name: string
  email: string
  avatar?: string
  is_verified: boolean
  unread_notifications: number
  unread_messages: number
}

// === COMPOSANT PRINCIPAL ===
export function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  
  // État utilisateur (à remplacer par votre store d'authentification)
  const [user, setUser] = useState<User | null>({
    id: '1',
    name: 'Amadou Diallo',
    email: 'amadou@example.com',
    avatar: '/images/avatars/amadou.jpg',
    is_verified: true,
    unread_notifications: 3,
    unread_messages: 2
  })

  // Effet de scroll pour changer l'apparence du header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Navigation principale
  const mainNavItems = [
    { label: 'Accueil', href: '/', current: pathname === '/' },
    { label: 'Annonces', href: '/listings', current: pathname.startsWith('/listings') },
    { label: 'Catégories', href: '/categories', current: pathname.startsWith('/categories') },
    { label: 'Comment ça marche', href: '/how-it-works', current: pathname === '/how-it-works' },
    { label: 'Support', href: '/support', current: pathname.startsWith('/support') },
  ]

  // Fonction de déconnexion
  const handleLogout = () => {
    setUser(null)
    // Ajouter ici la logique de déconnexion
  }

  return (
    <>
      {/* === HEADER PRINCIPAL === */}
      <header 
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-xl border-slate-200 shadow-sm' 
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="container-fluid">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* === LOGO === */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-ocean rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform">
                  S
                </div>
                <div className="hidden sm:block">
                  <div className="font-bold text-xl text-gradient">SenMarket</div>
                  <div className="text-xs text-muted-foreground">Marketplace du Sénégal</div>
                </div>
              </Link>

              {/* === NAVIGATION DESKTOP === */}
              <nav className="hidden lg:flex items-center space-x-8">
                {mainNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      item.current 
                        ? 'text-primary border-b-2 border-primary pb-1' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* === ACTIONS CENTRALES === */}
            <div className="flex items-center gap-4">
              
              {/* Barre de recherche desktop */}
              <div className="hidden md:flex items-center">
                <Button
                  variant="outline"
                  className="w-64 justify-start text-muted-foreground bg-slate-50 hover:bg-slate-100"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Rechercher...
                </Button>
              </div>

              {/* Sélecteur de région */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden lg:flex">
                    <MapPin className="w-4 h-4 mr-2" />
                    Dakar
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Changer de région</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {[
                    'Dakar - Plateau', 'Dakar - Almadies', 'Thiès', 'Saint-Louis',
                    'Kaolack', 'Ziguinchor', 'Diourbel', 'Louga'
                  ].map((region) => (
                    <DropdownMenuItem key={region}>
                      {region}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* === ACTIONS DROITE === */}
            <div className="flex items-center gap-3">
              
              {/* Recherche mobile */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="w-5 h-5" />
              </Button>

              {user ? (
                <>
                  {/* Bouton créer annonce */}
                  <Link href="/listings/create" className="hidden sm:block">
                    <Button className="btn-ocean">
                      <Plus className="w-4 h-4 mr-2" />
                      Publier
                    </Button>
                  </Link>

                  {/* Favoris */}
                  <Button variant="ghost" size="sm" className="relative hidden sm:flex">
                    <Heart className="w-5 h-5" />
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
                    >
                      3
                    </Badge>
                  </Button>

                  {/* Messages */}
                  <Button variant="ghost" size="sm" className="relative hidden sm:flex">
                    <MessageCircle className="w-5 h-5" />
                    {user.unread_messages > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
                      >
                        {user.unread_messages}
                      </Badge>
                    )}
                  </Button>

                  {/* Notifications */}
                  <NotificationDropdown unreadCount={user.unread_notifications} />

                  {/* Menu utilisateur */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-gradient-ocean text-white">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {user.is_verified && (
                          <Badge 
                            variant="default" 
                            className="absolute -bottom-1 -right-1 h-4 w-4 text-xs p-0 bg-green-500 hover:bg-green-500"
                          >
                            ✓
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">
                          <User className="mr-2 h-4 w-4" />
                          <span>Mon Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/listings">
                          <Plus className="mr-2 h-4 w-4" />
                          <span>Mes Annonces</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/messages">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          <span>Messages</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/favorites">
                          <Heart className="mr-2 h-4 w-4" />
                          <span>Favoris</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/settings">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Paramètres</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Se déconnecter</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                /* Utilisateur non connecté */
                <div className="flex items-center gap-3">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">
                      Se connecter
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button className="btn-ocean">
                      S'inscrire
                    </Button>
                  </Link>
                </div>
              )}

              {/* Menu mobile */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* === BARRE DE NAVIGATION SECONDAIRE (MOBILE) === */}
        {user && (
          <div className="lg:hidden border-t border-slate-200 px-4 py-2">
            <div className="flex items-center justify-around">
              <Link href="/listings/create">
                <Button size="sm" className="btn-ocean">
                  <Plus className="w-4 h-4 mr-2" />
                  Publier
                </Button>
              </Link>
              <Button variant="ghost" size="sm">
                <Heart className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="relative">
                <MessageCircle className="w-5 h-5" />
                {user.unread_messages > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 text-xs p-0">
                    {user.unread_messages}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* === COMPOSANTS MODAUX === */}
      <MobileMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        navItems={mainNavItems}
        user={user}
      />
      
      <SearchDialog 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  )
}