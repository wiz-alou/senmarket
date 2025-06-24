'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Eye,
  MessageSquare,
  CreditCard,
  Settings,
  Plus,
  TrendingUp,
  Users,
  Package,
  Calendar,
  Phone,
  Mail,
  Edit3,
  Trash2,
  Share2,
  Star,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  User,
  Shield,
  Download,
  Camera,
  Flag,
  Search,
  Filter,
  Tag
} from 'lucide-react'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

// ✅ Utiliser le store auth corrigé
import { useAuthStore } from '@/stores/auth.store'

// Types basés sur votre API
interface DashboardStats {
  total_listings: number
  active_listings: number
  sold_listings: number
  draft_listings: number
  total_views: number
  total_payments: number
  completed_payments: number
  total_revenue: number
  total_contacts: number
  unread_contacts: number
}

interface Listing {
  id: string
  title: string
  description: string
  price: number
  currency: string
  region: string
  images: string[]
  status: string
  views_count: number
  is_featured: boolean
  created_at: string
  updated_at: string
  category?: {
    id: string
    name: string
    icon: string
  }
}

interface Contact {
  id: string
  listing_id: string
  name: string
  phone: string
  email: string
  message: string
  is_read: boolean
  created_at: string
  listing?: {
    title: string
  }
}

interface Payment {
  id: string
  amount: number
  currency: string
  payment_method: string
  status: string
  created_at: string
  transaction_id?: string
  listing?: {
    title: string
  }
}

export default function DashboardPage() {
  const router = useRouter()
  
  // ✅ Store auth avec hydratation
  const { user, token, isAuthenticated, isHydrated } = useAuthStore()

  // États
  const [stats, setStats] = useState<DashboardStats>({
    total_listings: 0,
    active_listings: 0,
    sold_listings: 0,
    draft_listings: 0,
    total_views: 0,
    total_payments: 0,
    completed_payments: 0,
    total_revenue: 0,
    total_contacts: 0,
    unread_contacts: 0
  })

  const [listings, setListings] = useState<Listing[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [publishingListing, setPublishingListing] = useState<string | null>(null)

  // États filtres
  const [listingFilter, setListingFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // ✅ VÉRIFICATION AUTH AVEC HYDRATATION
  useEffect(() => {
    console.log('🔍 Dashboard - État auth:', {
      isHydrated,
      isAuthenticated,
      userId: user?.id,
      userName: user?.first_name,
      hasToken: !!token
    })

    // Attendre l'hydratation
    if (!isHydrated) {
      console.log('⏳ En attente de l\'hydratation...')
      return
    }

    // Vérifier l'authentification après hydratation
    if (!isAuthenticated || !user || !token) {
      console.log('❌ Non authentifié après hydratation, redirection...')
      router.push('/auth/login?redirect=/dashboard')
      return
    }

    console.log('✅ Utilisateur authentifié, chargement données dashboard pour:', user.first_name)
    fetchDashboardData()
  }, [isHydrated, isAuthenticated, user, token, router])

  // ✅ RECHARGER LES DONNÉES QUAND L'UTILISATEUR CHANGE
  useEffect(() => {
    if (isHydrated && isAuthenticated && user && token) {
      console.log('🔄 Rechargement des données pour user:', user.first_name, '(ID:', user.id, ')')
      fetchDashboardData()
    }
  }, [user?.id]) // Recharger quand l'ID utilisateur change

  // Fonction utilitaire pour obtenir l'URL des images
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath
    }
    
    if (imagePath.startsWith('/')) {
      return `http://localhost:8080${imagePath}`
    }
    
    return `http://localhost:8080/uploads/${imagePath}`
  }

  // ✅ FONCTION DE RÉCUPÉRATION DES DONNÉES CORRIGÉE
  const fetchDashboardData = async () => {
    if (!token || !user) {
      console.error('❌ Pas de token ou d\'utilisateur pour charger les données')
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('📡 Appel API dashboard avec token pour user:', user.first_name)
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      // ✅ RÉCUPÉRATION AVEC LES ENDPOINTS EXISTANTS
      let listingsData = null
      let contactsData = null
      let paymentsData = null

      // 1. Mes annonces - CRITIQUE POUR STATS
      try {
        console.log('📝 Chargement mes annonces...')
        const listingsRes = await fetch('http://localhost:8080/api/v1/listings/my', { headers })
        console.log('📝 Réponse listings status:', listingsRes.status)
        
        if (listingsRes.ok) {
          listingsData = await listingsRes.json()
          const userListings = listingsData.data?.listings || listingsData.listings || listingsData.data || []
          console.log('✅ Annonces reçues:', userListings.length, 'pour user:', user.first_name)
          setListings(userListings)
          
          // ✅ CALCULER LES STATS À PARTIR DES ANNONCES
          calculateStatsFromData(userListings, [], [])
          
        } else {
          console.warn('⚠️ Erreur chargement annonces:', listingsRes.status)
          setListings([])
        }
      } catch (listError) {
        console.warn('⚠️ Erreur non critique listings:', listError)
        setListings([])
      }

      // 2. Mes contacts - NON CRITIQUE
      try {
        console.log('💬 Chargement mes contacts...')
        const contactsRes = await fetch('http://localhost:8080/api/v1/contacts/my', { headers })
        console.log('💬 Réponse contacts status:', contactsRes.status)
        
        if (contactsRes.ok) {
          contactsData = await contactsRes.json()
          const userContacts = contactsData.data || contactsData || []
          console.log('✅ Contacts reçus:', userContacts.length)
          setContacts(userContacts)
        } else {
          console.warn('⚠️ Erreur chargement contacts:', contactsRes.status)
          setContacts([])
        }
      } catch (contactError) {
        console.warn('⚠️ Erreur non critique contacts:', contactError)
        setContacts([])
      }

      // 3. Mes paiements - NON CRITIQUE
      try {
        console.log('💳 Chargement mes paiements...')
        const paymentsRes = await fetch('http://localhost:8080/api/v1/payments/my', { headers })
        console.log('💳 Réponse payments status:', paymentsRes.status)
        
        if (paymentsRes.ok) {
          paymentsData = await paymentsRes.json()
          const userPayments = paymentsData.data?.payments || paymentsData.payments || paymentsData.data || []
          console.log('✅ Paiements reçus:', userPayments.length)
          setPayments(userPayments)
        } else {
          console.warn('⚠️ Erreur chargement paiements:', paymentsRes.status)
          setPayments([])
        }
      } catch (paymentError) {
        console.warn('⚠️ Erreur non critique paiements:', paymentError)
        setPayments([])
      }

      console.log('🎉 Chargement dashboard terminé avec succès')

    } catch (error) {
      console.error('❌ Erreur chargement dashboard:', error)
      setError(error instanceof Error ? error.message : 'Erreur de chargement')
      
      // Si erreur d'authentification, rediriger vers login
      if (error instanceof Error && (
        error.message.includes('401') || 
        error.message.includes('Unauthorized') ||
        error.message.includes('403')
      )) {
        console.log('🔑 Token expiré, redirection vers login...')
        useAuthStore.getState().logout()
        router.push('/auth/login?redirect=/dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  // ✅ CALCULER LES STATS À PARTIR DES DONNÉES RÉCUPÉRÉES
  const calculateStatsFromData = (userListings: Listing[], userContacts: Contact[], userPayments: Payment[]) => {
    console.log('📊 Calcul des stats à partir des données:', {
      listings: userListings.length,
      contacts: userContacts.length,
      payments: userPayments.length
    })

    const calculatedStats: DashboardStats = {
      total_listings: userListings.length,
      active_listings: userListings.filter(l => l.status === 'active').length,
      sold_listings: userListings.filter(l => l.status === 'sold').length,
      draft_listings: userListings.filter(l => l.status === 'draft').length,
      total_views: userListings.reduce((sum, l) => sum + (l.views_count || 0), 0),
      total_payments: userPayments.length,
      completed_payments: userPayments.filter(p => p.status === 'completed').length,
      total_revenue: userPayments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0),
      total_contacts: userContacts.length,
      unread_contacts: userContacts.filter(c => !c.is_read).length
    }

    console.log('✅ Stats calculées:', calculatedStats)
    setStats(calculatedStats)
  }

  // ✅ Recalculer les stats quand les données changent
  useEffect(() => {
    calculateStatsFromData(listings, contacts, payments)
  }, [listings, contacts, payments])

  // ✅ FONCTIONS D'ACTION POUR LES ANNONCES
  const handlePublishListing = async (listingId: string) => {
    if (publishingListing || !token) return
    
    const confirmed = window.confirm(
      'Publier cette annonce coûte 200 FCFA. Voulez-vous continuer ?'
    )
    
    if (!confirmed) return

    setPublishingListing(listingId)

    try {
      const response = await fetch(`http://localhost:8080/api/v1/listings/${listingId}/pay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payment_method: 'orange_money' // ou autre méthode
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la publication')
      }

      const data = await response.json()
      toast.success('Annonce publiée avec succès !')
      
      // Recharger les données
      fetchDashboardData()

    } catch (error) {
      console.error('Erreur publication:', error)
      toast.error('Erreur lors de la publication')
    } finally {
      setPublishingListing(null)
    }
  }

  const handleEditListing = (listingId: string) => {
    router.push(`/sell?edit=${listingId}`)
  }

  const handleDeleteListing = async (listingId: string) => {
    if (!token) return

    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir supprimer cette annonce ?'
    )
    
    if (!confirmed) return

    try {
      const response = await fetch(`http://localhost:8080/api/v1/listings/${listingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      toast.success('Annonce supprimée avec succès')
      fetchDashboardData()

    } catch (error) {
      console.error('Erreur suppression:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleViewListing = (listingId: string) => {
    router.push(`/listings/${listingId}`)
  }

  // Fonctions utilitaires
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'À l\'instant'
    if (diffInHours < 24) return `Il y a ${diffInHours}h`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `Il y a ${diffInDays}j`
    const diffInWeeks = Math.floor(diffInDays / 7)
    return `Il y a ${diffInWeeks}sem`
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Brouillon', variant: 'secondary' as const, color: 'bg-gray-100 text-gray-700' },
      active: { label: 'Actif', variant: 'default' as const, color: 'bg-green-100 text-green-700' },
      sold: { label: 'Vendu', variant: 'destructive' as const, color: 'bg-blue-100 text-blue-700' },
      expired: { label: 'Expiré', variant: 'outline' as const, color: 'bg-red-100 text-red-700' }
    }
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
  }

  // Filtrer les annonces
  const filteredListings = listings.filter(listing => {
    const matchesFilter = listingFilter === 'all' || listing.status === listingFilter
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // ✅ LOADING STATE PENDANT L'HYDRATATION
  if (!isHydrated || loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6">
                <Loader2 className="h-10 w-10 animate-spin text-white" />
              </div>
              <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-ping opacity-20"></div>
            </div>
            <p className="text-slate-700 text-xl font-medium">
              {!isHydrated ? 'Initialisation...' : 'Chargement de votre dashboard...'}
            </p>
            {loading && isHydrated && (
              <p className="text-slate-500 text-sm mt-2">
                Récupération de vos données...
              </p>
            )}
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // Error state
  if (error) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Erreur de chargement</h1>
            <p className="text-slate-600 mb-8 text-lg">{error}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={fetchDashboardData}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl"
              >
                <Download className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
              <Button 
                onClick={() => router.push('/')}
                variant="outline"
                className="bg-white/80 border-white/50 shadow-lg rounded-xl px-8 py-3"
              >
                Retour à l'accueil
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
        <div className="container mx-auto px-6 py-8">
          
          {/* ✅ HEADER DASHBOARD AVEC INFO UTILISATEUR */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20 border-4 border-blue-100">
                    <AvatarImage src={user?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-2xl font-bold">
                      {user?.first_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                      Bonjour, {user?.first_name} ! 👋
                    </h1>
                    <p className="text-slate-600 mb-3">
                      Gérez vos annonces et suivez vos performances
                    </p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>ID: {user?.id.slice(0, 8)}...</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{user?.region}</span>
                      </div>
                      {user?.is_verified && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Vérifié</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={() => router.push('/sell')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Nouvelle annonce
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={fetchDashboardData}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-xl"
                  >
                    <Download className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ✅ STATISTIQUES DASHBOARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium uppercase tracking-wide">Annonces</p>
                    <p className="text-3xl font-bold text-blue-900">{stats.total_listings}</p>
                    <p className="text-blue-700 text-sm mt-1">{stats.active_listings} actives</p>
                  </div>
                  <Package className="h-12 w-12 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium uppercase tracking-wide">Vues totales</p>
                    <p className="text-3xl font-bold text-green-900">{stats.total_views}</p>
                    <p className="text-green-700 text-sm mt-1">Cette semaine</p>
                  </div>
                  <Eye className="h-12 w-12 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium uppercase tracking-wide">Messages</p>
                    <p className="text-3xl font-bold text-purple-900">{stats.total_contacts}</p>
                    <p className="text-purple-700 text-sm mt-1">{stats.unread_contacts} non lus</p>
                  </div>
                  <MessageSquare className="h-12 w-12 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium uppercase tracking-wide">Revenus</p>
                    <p className="text-3xl font-bold text-orange-900">{formatPrice(stats.total_revenue)}</p>
                    <p className="text-orange-700 text-sm mt-1">{stats.completed_payments} paiements</p>
                  </div>
                  <CreditCard className="h-12 w-12 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ✅ ONGLETS DASHBOARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Message informatif si données partielles */}
            {(listings.length === 0 && stats.total_listings === 0) && (
              <Alert className="mb-6 border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Bienvenue ! Commencez par publier votre première annonce pour voir vos statistiques.
                </AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="listings" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4 bg-white rounded-xl border border-slate-200 p-1">
                <TabsTrigger value="listings" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Mes annonces</span>
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Messages</span>
                </TabsTrigger>
                <TabsTrigger value="payments" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">Paiements</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Paramètres</span>
                </TabsTrigger>
              </TabsList>

              {/* ONGLET ANNONCES */}
              <TabsContent value="listings" className="space-y-6">
                <Card className="bg-white rounded-2xl shadow-xl border border-slate-200">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <CardTitle className="text-2xl font-bold text-slate-900">Mes annonces ({listings.length})</CardTitle>
                      
                      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-full sm:w-64"
                          />
                        </div>
                        
                        <Select value={listingFilter} onValueChange={setListingFilter}>
                          <SelectTrigger className="w-full sm:w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Toutes</SelectItem>
                            <SelectItem value="active">Actives</SelectItem>
                            <SelectItem value="draft">Brouillons</SelectItem>
                            <SelectItem value="sold">Vendues</SelectItem>
                            <SelectItem value="expired">Expirées</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {filteredListings.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">
                          {listings.length === 0 ? 'Aucune annonce' : 'Aucun résultat'}
                        </h3>
                        <p className="text-slate-500 mb-6">
                          {listings.length === 0 
                            ? 'Commencez par publier votre première annonce'
                            : 'Essayez de modifier vos filtres de recherche'
                          }
                        </p>
                        {listings.length === 0 && (
                          <Button 
                            onClick={() => router.push('/sell')}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Créer une annonce
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredListings.map((listing, index) => {
                          const statusConfig = getStatusBadge(listing.status)
                          const imageUrl = listing.images && listing.images.length > 0 
                            ? getImageUrl(listing.images[0]) 
                            : null

                          return (
                            <motion.div
                              key={listing.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:shadow-md transition-shadow"
                            >
                              <div className="flex flex-col lg:flex-row gap-6">
                                {/* Image */}
                                <div className="w-full lg:w-32 h-32 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                                  {imageUrl ? (
                                    <img
                                      src={imageUrl}
                                      alt={listing.title}
                                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                      onClick={() => handleViewListing(listing.id)}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Camera className="h-8 w-8 text-slate-400" />
                                    </div>
                                  )}
                                </div>

                                {/* Contenu */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-3 mb-2">
                                        <h3 
                                          className="text-lg font-semibold text-slate-900 truncate cursor-pointer hover:text-blue-600 transition-colors"
                                          onClick={() => handleViewListing(listing.id)}
                                        >
                                          {listing.title}
                                        </h3>
                                        <Badge className={statusConfig.color}>
                                          {statusConfig.label}
                                        </Badge>
                                      </div>
                                      
                                      <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                                        {listing.description}
                                      </p>
                                      
                                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                        <div className="flex items-center gap-1">
                                          <Eye className="h-4 w-4" />
                                          <span>{listing.views_count || 0} vues</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-4 w-4" />
                                          <span>{formatTimeAgo(listing.created_at)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <MapPin className="h-4 w-4" />
                                          <span>{listing.region}</span>
                                        </div>
                                        {listing.category && (
                                          <div className="flex items-center gap-1">
                                            <Tag className="h-4 w-4" />
                                            <span>{listing.category.name}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="text-right">
                                      <div className="text-2xl font-bold text-slate-900 mb-2">
                                        {formatPrice(listing.price)}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Actions */}
                                  <div className="flex flex-wrap gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleViewListing(listing.id)}
                                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      Voir
                                    </Button>
                                    
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditListing(listing.id)}
                                      className="text-slate-600 hover:bg-slate-50"
                                    >
                                      <Edit3 className="h-4 w-4 mr-1" />
                                      Modifier
                                    </Button>
                                    
                                    {listing.status === 'draft' && (
                                      <Button
                                        size="sm"
                                        onClick={() => handlePublishListing(listing.id)}
                                        disabled={publishingListing === listing.id}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                      >
                                        {publishingListing === listing.id ? (
                                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                        ) : (
                                          <Download className="h-4 w-4 mr-1" />
                                        )}
                                        Publier
                                      </Button>
                                    )}
                                    
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteListing(listing.id)}
                                      className="text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4 mr-1" />
                                      Supprimer
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ONGLET MESSAGES */}
              <TabsContent value="messages" className="space-y-6">
                <Card className="bg-white rounded-2xl shadow-xl border border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-slate-900">Messages reçus ({contacts.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {contacts.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageSquare className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">Aucun message</h3>
                        <p className="text-slate-500">Les messages des acheteurs intéressés apparaîtront ici</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {contacts.map((contact, index) => (
                          <motion.div
                            key={contact.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-6 rounded-xl border transition-all hover:shadow-md ${
                              contact.is_read 
                                ? 'bg-slate-50 border-slate-200' 
                                : 'bg-blue-50 border-blue-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4 mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${contact.is_read ? 'bg-slate-300' : 'bg-blue-500'}`} />
                                <div>
                                  <h4 className="font-semibold text-slate-900">{contact.name}</h4>
                                  <p className="text-sm text-slate-600">{contact.listing?.title}</p>
                                </div>
                              </div>
                              <div className="text-right text-sm text-slate-500">
                                <div>{formatTimeAgo(contact.created_at)}</div>
                                <div className="flex items-center gap-1 mt-1">
                                  <Phone className="h-3 w-3" />
                                  <a href={`tel:${contact.phone}`} className="hover:text-blue-600">
                                    {contact.phone}
                                  </a>
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-slate-700 bg-white p-4 rounded-lg border border-slate-200">
                              {contact.message}
                            </p>
                            
                            <div className="flex gap-2 mt-4">
                              <Button
                                size="sm"
                                onClick={() => window.open(`tel:${contact.phone}`)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Phone className="h-4 w-4 mr-1" />
                                Appeler
                              </Button>
                              
                              {contact.email && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(`mailto:${contact.email}`)}
                                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                >
                                  <Mail className="h-4 w-4 mr-1" />
                                  Email
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ONGLET PAIEMENTS */}
              <TabsContent value="payments" className="space-y-6">
                <Card className="bg-white rounded-2xl shadow-xl border border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-slate-900">Historique des paiements ({payments.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {payments.length === 0 ? (
                      <div className="text-center py-12">
                        <CreditCard className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">Aucun paiement</h3>
                        <p className="text-slate-500">Vos paiements pour la publication d'annonces apparaîtront ici</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {payments.map((payment, index) => (
                          <motion.div
                            key={payment.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-6 bg-slate-50 rounded-xl border border-slate-200"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                  payment.status === 'completed' 
                                    ? 'bg-green-100 text-green-600' 
                                    : payment.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-600'
                                    : 'bg-red-100 text-red-600'
                                }`}>
                                  <CreditCard className="h-6 w-6" />
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold text-slate-900">
                                    {payment.listing?.title || 'Publication d\'annonce'}
                                  </h4>
                                  <p className="text-sm text-slate-600">
                                    {payment.payment_method} • {formatTimeAgo(payment.created_at)}
                                  </p>
                                  {payment.transaction_id && (
                                    <p className="text-xs text-slate-500 mt-1">
                                      ID: {payment.transaction_id}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-lg font-bold text-slate-900">
                                  {formatPrice(payment.amount)}
                                </div>
                                <Badge 
                                  className={
                                    payment.status === 'completed' 
                                      ? 'bg-green-100 text-green-700' 
                                      : payment.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-red-100 text-red-700'
                                  }
                                >
                                  {payment.status === 'completed' ? 'Complété' :
                                   payment.status === 'pending' ? 'En attente' : 'Échoué'}
                                </Badge>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ONGLET PARAMÈTRES */}
              <TabsContent value="settings" className="space-y-6">
                <Card className="bg-white rounded-2xl shadow-xl border border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-slate-900">Paramètres du compte</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    {/* Informations personnelles */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900">Informations personnelles</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="first_name">Prénom</Label>
                          <Input
                            id="first_name"
                            value={user?.first_name || ''}
                            readOnly
                            className="bg-slate-50"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="last_name">Nom</Label>
                          <Input
                            id="last_name"
                            value={user?.last_name || ''}
                            readOnly
                            className="bg-slate-50"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="phone">Téléphone</Label>
                          <Input
                            id="phone"
                            value={user?.phone || ''}
                            readOnly
                            className="bg-slate-50"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="region">Région</Label>
                          <Input
                            id="region"
                            value={user?.region || ''}
                            readOnly
                            className="bg-slate-50"
                          />
                        </div>
                      </div>
                      
                      <Alert className="border-blue-200 bg-blue-50">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          Pour modifier vos informations personnelles, contactez notre support.
                        </AlertDescription>
                      </Alert>
                    </div>

                    <Separator />

                    {/* Statut du compte */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900">Statut du compte</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full ${user?.is_verified ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <div>
                              <p className="font-medium text-slate-900">Compte vérifié</p>
                              <p className="text-sm text-slate-600">
                                {user?.is_verified ? 'Votre compte est vérifié' : 'Compte non vérifié'}
                              </p>
                            </div>
                          </div>
                        </Card>
                        
                        <Card className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full ${user?.is_premium ? 'bg-yellow-500' : 'bg-gray-300'}`} />
                            <div>
                              <p className="font-medium text-slate-900">Compte Premium</p>
                              <p className="text-sm text-slate-600">
                                {user?.is_premium ? 'Profitez des fonctionnalités premium' : 'Compte standard'}
                              </p>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>

                    <Separator />

                    {/* Actions du compte */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900">Actions du compte</h3>
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button 
                          variant="outline"
                          onClick={fetchDashboardData}
                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Rafraîchir les données
                        </Button>
                        
                        <Button 
                          variant="outline"
                          onClick={() => {
                            useAuthStore.getState().logout()
                            router.push('/')
                          }}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Se déconnecter
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  )
}