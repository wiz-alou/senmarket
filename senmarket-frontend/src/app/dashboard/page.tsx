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
  Download
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

// ✅ Utiliser le store auth
import { useAuthStore } from '@/stores/authStore'

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

const SENEGAL_REGIONS = [
  'Dakar', 'Thiès', 'Saint-Louis', 'Diourbel', 'Louga', 'Fatick',
  'Kaolack', 'Kolda', 'Ziguinchor', 'Tambacounda', 'Kaffrine',
  'Kédougou', 'Matam', 'Sédhiou', 'Saraya', 'Koungheul'
]

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuthStore() // ✅ Utiliser le store
  
  // États
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'messages' | 'payments' | 'settings'>('overview')
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  // ✅ Vérification auth propre
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/auth/login?redirect=/dashboard')
      return
    }
    
    fetchDashboardData()
  }, [user, isAuthenticated, router])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('senmarket_token')
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      // Appel parallel de toutes les APIs
      const [dashboardRes, listingsRes, contactsRes, paymentsRes] = await Promise.all([
        fetch('http://localhost:8080/api/v1/dashboard', { headers }),
        fetch('http://localhost:8080/api/v1/listings/my', { headers }),
        fetch('http://localhost:8080/api/v1/contacts/my', { headers }),
        fetch('http://localhost:8080/api/v1/payments/my', { headers })
      ])

      if (!dashboardRes.ok) {
        throw new Error('Erreur lors du chargement du dashboard')
      }

      const dashboardData = await dashboardRes.json()
      setStats(dashboardData.stats)

      if (listingsRes.ok) {
        const listingsData = await listingsRes.json()
        setListings(listingsData.data?.listings || [])
      }

      if (contactsRes.ok) {
        const contactsData = await contactsRes.json()
        setContacts(contactsData.data || [])
      }

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json()
        setPayments(paymentsData.data?.payments || [])
      }

    } catch (error) {
      console.error('Erreur chargement dashboard:', error)
      setError(error instanceof Error ? error.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-SN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Actif', color: 'bg-green-100 text-green-800' },
      draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800' },
      sold: { label: 'Vendu', color: 'bg-blue-100 text-blue-800' },
      expired: { label: 'Expiré', color: 'bg-red-100 text-red-800' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: 'Complété', icon: CheckCircle, color: 'text-green-600' },
      pending: { label: 'En attente', icon: Clock, color: 'text-yellow-600' },
      failed: { label: 'Échoué', icon: XCircle, color: 'text-red-600' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon
    return (
      <div className={`flex items-center ${config.color}`}>
        <Icon className="h-4 w-4 mr-1" />
        {config.label}
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-slate-600">Chargement de votre dashboard...</p>
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
        <main className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchDashboardData}>Réessayer</Button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // Pas d'utilisateur
  if (!user) {
    return null
  }

  const statsCards = [
    {
      title: 'Annonces Actives',
      value: stats?.active_listings || 0,
      total: stats?.total_listings || 0,
      icon: Package,
      color: 'blue',
      trend: '+12%'
    },
    {
      title: 'Vues Totales',
      value: stats?.total_views || 0,
      icon: Eye,
      color: 'green',
      trend: '+24%'
    },
    {
      title: 'Messages Reçus',
      value: stats?.total_contacts || 0,
      unread: stats?.unread_contacts || 0,
      icon: MessageSquare,
      color: 'purple',
      trend: '+8%'
    },
    {
      title: 'Revenus Générés',
      value: stats?.total_revenue || 0,
      icon: CreditCard,
      color: 'orange',
      trend: '+15%',
      format: 'currency'
    }
  ]

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          
          {/* Header */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
                  Bonjour, {user.first_name} ! 👋
                </h1>
                <p className="text-slate-600 mt-1">
                  Gérez vos annonces et suivez vos performances
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => router.push('/sell')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle annonce
                </Button>
                <Button 
                  variant="outline"
                  onClick={logout}
                >
                  Déconnexion
                </Button>
              </div>
            </div>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            
            {/* Navigation Tabs */}
            <TabsList className="grid w-full grid-cols-5 bg-white shadow-lg border-0">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Vue d'ensemble
              </TabsTrigger>
              <TabsTrigger value="listings" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Mes annonces
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Messages
                {stats?.unread_contacts && stats.unread_contacts > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 px-2 text-xs">
                    {stats.unread_contacts}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Paiements
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Paramètres
              </TabsTrigger>
            </TabsList>

            {/* Vue d'ensemble */}
            <TabsContent value="overview" className="space-y-8">
              
              {/* Stats Cards */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {statsCards.map((stat, index) => (
                  <Card key={index} className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                          <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                        </div>
                        <div className="text-right">
                          <div className={`text-xs font-medium text-${stat.color}-600 flex items-center`}>
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {stat.trend}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-slate-600">{stat.title}</h3>
                        <div className="flex items-end justify-between">
                          <div className="text-2xl font-bold text-slate-900">
                            {stat.format === 'currency' ? formatPrice(stat.value) : stat.value.toLocaleString()}
                          </div>
                          {stat.total && (
                            <div className="text-sm text-slate-500">
                              sur {stat.total}
                            </div>
                          )}
                          {stat.unread && stat.unread > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {stat.unread} non lu{stat.unread > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Progress bar pour annonces actives */}
                        {stat.total && stat.total > 0 && (
                          <Progress 
                            value={(stat.value / stat.total) * 100} 
                            className="h-2 mt-3"
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>

              {/* Activité récente */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Derniers contacts */}
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2 text-purple-600" />
                      Derniers contacts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {contacts.length > 0 ? (
                      <div className="space-y-4">
                        {contacts.slice(0, 3).map((contact, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-medium text-slate-900 truncate">{contact.name}</p>
                                {!contact.is_read && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 line-clamp-2">{contact.message}</p>
                              <p className="text-xs text-slate-500 mt-1">{formatDate(contact.created_at)}</p>
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => setActiveTab('messages')}>
                          Voir tous les messages
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">Aucun message reçu</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Dernières annonces */}
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Package className="h-5 w-5 mr-2 text-blue-600" />
                      Mes annonces récentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {listings.length > 0 ? (
                      <div className="space-y-4">
                        {listings.slice(0, 3).map((listing, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                            {listing.images && listing.images.length > 0 ? (
                              <img
                                src={`http://localhost:8080${listing.images[0]}`}
                                alt={listing.title}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center">
                                <Package className="h-6 w-6 text-slate-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-medium text-slate-900 truncate">{listing.title}</p>
                                {getStatusBadge(listing.status)}
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-blue-600">{formatPrice(listing.price)}</p>
                                <div className="flex items-center text-xs text-slate-500">
                                  <Eye className="h-3 w-3 mr-1" />
                                  {listing.views_count || 0} vues
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => setActiveTab('listings')}>
                          Voir toutes mes annonces
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 mb-3">Aucune annonce publiée</p>
                        <Button onClick={() => router.push('/sell')}>
                          <Plus className="h-4 w-4 mr-2" />
                          Créer ma première annonce
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Informations de base pour les autres tabs */}
            <TabsContent value="listings" className="space-y-6">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2 text-blue-600" />
                    Mes annonces ({listings.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Section en développement</h3>
                    <p className="text-slate-600 mb-6">La gestion complète des annonces arrive bientôt !</p>
                    <Button onClick={() => router.push('/sell')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Publier une nouvelle annonce
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages" className="space-y-6">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-purple-600" />
                    Messages reçus ({contacts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <MessageSquare className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Messagerie en développement</h3>
                    <p className="text-slate-600">Le système de messagerie complet arrive bientôt !</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments" className="space-y-6">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-orange-600" />
                    Historique des paiements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {payments.length > 0 ? (
                    <div className="space-y-4">
                      {payments.map((payment) => (
                        <Card key={payment.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                  <CreditCard className="h-6 w-6 text-orange-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-slate-900">
                                    Publication d'annonce
                                  </h4>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-sm text-slate-600">
                                      {payment.payment_method?.replace('_', ' ').toUpperCase()}
                                    </span>
                                    <span className="text-sm text-slate-500">
                                      {formatDate(payment.created_at)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="font-bold text-slate-900 mb-1">
                                  {formatPrice(payment.amount)}
                                </div>
                                {getPaymentStatusBadge(payment.status)}
                              </div>
                            </div>
                            
                            {payment.transaction_id && (
                              <div className="mt-4 pt-4 border-t border-slate-200">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-slate-600">ID Transaction:</span>
                                  <span className="font-mono text-slate-900">{payment.transaction_id}</span>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CreditCard className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucun paiement</h3>
                      <p className="text-slate-600">Vos paiements apparaîtront ici</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-slate-600" />
                    Profil utilisateur
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div className="flex items-center gap-6">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                        {user.first_name?.[0]}{user.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-slate-900">
                        {user.first_name} {user.last_name}
                      </h3>
                      <p className="text-slate-600">{user.phone}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">
                          Compte {user.is_verified ? 'vérifié' : 'non vérifié'}
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline"
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                  </div>

                  {isEditingProfile && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-slate-50 rounded-lg"
                    >
                      <div>
                        <Label htmlFor="first_name">Prénom</Label>
                        <Input defaultValue={user.first_name} />
                      </div>
                      <div>
                        <Label htmlFor="last_name">Nom</Label>
                        <Input defaultValue={user.last_name} />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input type="email" defaultValue={user.email} />
                      </div>
                      <div>
                        <Label htmlFor="region">Région</Label>
                        <Select defaultValue={user.region}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SENEGAL_REGIONS.map(region => (
                              <SelectItem key={region} value={region}>
                                {region}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <div className="flex gap-3">
                          <Button className="bg-green-600 hover:bg-green-700">
                            Sauvegarder
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => setIsEditingProfile(false)}
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <Separator />

                  {/* Statistiques du compte */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-4">Statistiques du compte</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-sm text-slate-600">Membre depuis</div>
                        <div className="font-semibold text-slate-900">
                          {formatDate(user.created_at)}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                        <div className="text-sm text-slate-600">Note moyenne</div>
                        <div className="font-semibold text-slate-900">4.8/5</div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-sm text-slate-600">Ventes réussies</div>
                        <div className="font-semibold text-slate-900">
                          {stats?.completed_payments || 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Actions du compte */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-4">Actions du compte</h4>
                    <div className="flex gap-3">
                      <Button 
                        variant="outline"
                        onClick={logout}
                      >
                        Déconnexion
                      </Button>
                      <Button variant="destructive">
                        Supprimer mon compte
                      </Button>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </main>

      <Footer />
    </>
  )
}