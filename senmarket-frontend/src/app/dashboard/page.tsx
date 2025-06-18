'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  Eye,
  MessageCircle,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Users,
  Bell,
  Settings,
  Edit,
  Trash2,
  Heart,
  Share2,
  MoreHorizontal,
  Calendar,
  MapPin,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Download,
  Loader2,
  BarChart3,
  PieChart,
  Activity,
  Wallet,
  Mail,
  Phone
} from 'lucide-react';

// Types basés sur votre API
interface DashboardStats {
  total_listings: number;
  active_listings: number;
  sold_listings: number;
  draft_listings: number;
  total_views: number;
  total_payments: number;
  completed_payments: number;
  total_revenue: number;
  total_contacts: number;
  unread_contacts: number;
}

interface User {
  id: string;
  phone: string;
  email: string;
  first_name: string;
  last_name: string;
  region: string;
  is_verified: boolean;
  created_at: string;
}

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  region: string;
  images: string[];
  status: string;
  views_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  category: {
    id: string;
    name: string;
    icon: string;
  };
}

interface Contact {
  id: string;
  listing_id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
  listing: {
    title: string;
  };
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  created_at: string;
  listing: {
    title: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  
  // États
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'contacts' | 'payments' | 'settings'>('overview');

  // Chargement des données
  useEffect(() => {
    // Vérifier l'authentification
    const token = localStorage.getItem('senmarket_token');
    const userData = localStorage.getItem('senmarket_user');
    
    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('senmarket_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Appel parallel de toutes les APIs
      const [dashboardRes, listingsRes, contactsRes, paymentsRes] = await Promise.all([
        fetch('http://localhost:8080/api/v1/dashboard', { headers }),
        fetch('http://localhost:8080/api/v1/listings/my', { headers }),
        fetch('http://localhost:8080/api/v1/contacts/my', { headers }),
        fetch('http://localhost:8080/api/v1/payments/my', { headers })
      ]);

      if (!dashboardRes.ok) {
        throw new Error('Erreur lors du chargement du dashboard');
      }

      const dashboardData = await dashboardRes.json();
      setStats(dashboardData.stats);

      if (listingsRes.ok) {
        const listingsData = await listingsRes.json();
        setListings(listingsData.data?.listings || []);
      }

      if (contactsRes.ok) {
        const contactsData = await contactsRes.json();
        setContacts(contactsData.data || []);
      }

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        setPayments(paymentsData.data?.payments || []);
      }

    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      setError(error instanceof Error ? error.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-SN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Actif', color: 'bg-green-100 text-green-800' },
      draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800' },
      sold: { label: 'Vendu', color: 'bg-blue-100 text-blue-800' },
      expired: { label: 'Expiré', color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

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
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="text-center p-6">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">Erreur de chargement</h2>
              <p className="text-slate-600 mb-4">{error}</p>
              <Button onClick={fetchDashboardData}>Réessayer</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-slate-50">
        
        {/* Header Dashboard */}
        <section className="bg-white border-b border-slate-200">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Bienvenue, {user?.first_name} {user?.last_name}
                </h1>
                <p className="text-slate-600">
                  Gérez vos annonces et suivez vos performances
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <Button 
                  onClick={() => router.push('/sell')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle annonce
                </Button>
                
                <Button variant="outline" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
                
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Navigation tabs */}
            <div className="flex space-x-1 bg-slate-100 rounded-lg p-1">
              {[
                { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
                { id: 'listings', label: 'Mes annonces', icon: ShoppingBag },
                { id: 'contacts', label: 'Messages', icon: MessageCircle },
                { id: 'payments', label: 'Paiements', icon: Wallet },
                { id: 'settings', label: 'Paramètres', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                  {tab.id === 'contacts' && stats && stats.unread_contacts > 0 && (
                    <Badge className="ml-2 bg-red-500 text-white text-xs">
                      {stats.unread_contacts}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Contenu des tabs */}
        <section className="container mx-auto px-6 py-8">
          <AnimatePresence mode="wait">
            
            {/* Vue d'ensemble */}
            {activeTab === 'overview' && stats && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                
                {/* Statistiques principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      title: 'Annonces totales',
                      value: stats.total_listings,
                      icon: ShoppingBag,
                      color: 'blue',
                      trend: '+12%'
                    },
                    {
                      title: 'Vues totales',
                      value: stats.total_views.toLocaleString(),
                      icon: Eye,
                      color: 'green',
                      trend: '+24%'
                    },
                    {
                      title: 'Messages reçus',
                      value: stats.total_contacts,
                      icon: MessageCircle,
                      color: 'purple',
                      trend: '+8%'
                    },
                    {
                      title: 'Revenus',
                      value: formatPrice(stats.total_revenue),
                      icon: DollarSign,
                      color: 'orange',
                      trend: '+15%'
                    }
                  ].map((stat, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-slate-600 text-sm">{stat.title}</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">
                              {stat.value}
                            </p>
                            <p className="text-green-600 text-sm mt-1">
                              {stat.trend} ce mois
                            </p>
                          </div>
                          <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                            <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Répartition des annonces */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Statut des annonces */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5" />
                        Statut des annonces
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { label: 'Actives', value: stats.active_listings, color: 'bg-green-500', total: stats.total_listings },
                          { label: 'Brouillons', value: stats.draft_listings, color: 'bg-gray-500', total: stats.total_listings },
                          { label: 'Vendues', value: stats.sold_listings, color: 'bg-blue-500', total: stats.total_listings }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                              <span className="text-slate-700">{item.label}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-semibold">{item.value}</span>
                              <div className={`w-24 h-2 bg-slate-200 rounded-full overflow-hidden mt-1`}>
                                <div 
                                  className={`h-full ${item.color} transition-all`}
                                  style={{ width: `${(item.value / Math.max(item.total, 1)) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Activité récente */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Activité récente
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {contacts.slice(0, 5).map((contact, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <MessageCircle className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                Message de {contact.name}
                              </p>
                              <p className="text-xs text-slate-600 truncate">
                                {contact.listing.title}
                              </p>
                              <p className="text-xs text-slate-500">
                                {formatDate(contact.created_at)}
                              </p>
                            </div>
                            {!contact.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        ))}
                        
                        {contacts.length === 0 && (
                          <p className="text-center text-slate-500 py-4">
                            Aucune activité récente
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* Mes annonces */}
            {activeTab === 'listings' && (
              <motion.div
                key="listings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                
                {/* Header avec actions */}
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Mes annonces ({listings.length})
                  </h2>
                  
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Liste des annonces */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing) => (
                    <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                      
                      {/* Image */}
                      <div className="relative aspect-video bg-gradient-to-br from-blue-100 to-orange-100">
                        {listing.images && listing.images.length > 0 ? (
                          <img
                            src={`http://localhost:8080${listing.images[0]}`}
                            alt={listing.title}
                            className="w-full h-full object-cover rounded-t-lg"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">
                            {listing.category.icon || '📦'}
                          </div>
                        )}
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3">
                          {getStatusBadge(listing.status)}
                        </div>
                        
                        {/* Actions */}
                        <div className="absolute top-3 right-3 flex gap-2">
                          <Button variant="ghost" size="icon" className="bg-white/80 hover:bg-white">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="bg-white/80 hover:bg-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Stats overlay */}
                        <div className="absolute bottom-3 left-3 bg-black/50 text-white px-2 py-1 rounded text-xs">
                          {listing.views_count} vues
                        </div>
                      </div>

                      {/* Contenu */}
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <h3 className="font-semibold text-slate-900 line-clamp-2">
                            {listing.title}
                          </h3>
                          
                          <div className="text-2xl font-bold text-blue-600">
                            {formatPrice(listing.price)}
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{listing.region}</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(listing.created_at)}</span>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Edit className="h-3 w-3 mr-1" />
                              Modifier
                            </Button>
                            <Button variant="outline" size="sm">
                              <Share2 className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* État vide */}
                {listings.length === 0 && (
                  <Card className="text-center py-12">
                    <CardContent>
                      <ShoppingBag className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        Aucune annonce
                      </h3>
                      <p className="text-slate-600 mb-6">
                        Commencez par publier votre première annonce
                      </p>
                      <Button onClick={() => router.push('/sell')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Créer une annonce
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}

            {/* Messages */}
            {activeTab === 'contacts' && (
              <motion.div
                key="contacts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Messages reçus ({contacts.length})
                  </h2>
                  
                  {stats && stats.unread_contacts > 0 && (
                    <Badge className="bg-red-100 text-red-800">
                      {stats.unread_contacts} non lu{stats.unread_contacts > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>

                <div className="space-y-4">
                  {contacts.map((contact) => (
                    <Card key={contact.id} className={`hover:shadow-md transition-shadow ${
                      !contact.is_read ? 'border-blue-200 bg-blue-50/50' : ''
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-slate-900">
                                {contact.name}
                              </h3>
                              {!contact.is_read && (
                                <Badge className="bg-blue-500 text-white text-xs">
                                  Nouveau
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-slate-600 mb-3">
                              Concernant : <span className="font-medium">{contact.listing.title}</span>
                            </p>
                            
                            <p className="text-slate-700 mb-4">
                              {contact.message}
                            </p>
                            
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{contact.phone}</span>
                              </div>
                              
                              {contact.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  <span>{contact.email}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatDate(contact.created_at)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Répondre
                            </Button>
                            {!contact.is_read && (
                              <Button variant="outline" size="sm">
                                Marquer lu
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {contacts.length === 0 && (
                  <Card className="text-center py-12">
                    <CardContent>
                      <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        Aucun message
                      </h3>
                      <p className="text-slate-600">
                        Les messages des acheteurs apparaîtront ici
                      </p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}

            {/* Paiements */}
            {activeTab === 'payments' && (
              <motion.div
                key="payments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Historique des paiements
                  </h2>
                  
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter
                  </Button>
                </div>

                {/* Résumé des paiements */}
                {stats && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                      <CardContent className="p-6 text-center">
                        <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-slate-900">
                          {formatPrice(stats.total_revenue)}
                        </div>
                        <div className="text-sm text-slate-600">Revenus totaux</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6 text-center">
                        <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-slate-900">
                          {stats.completed_payments}
                        </div>
                        <div className="text-sm text-slate-600">Paiements réussis</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6 text-center">
                        <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-slate-900">
                          {stats.total_payments}
                        </div>
                        <div className="text-sm text-slate-600">Total transactions</div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Liste des paiements */}
                <Card>
                  <CardHeader>
                    <CardTitle>Transactions récentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {payments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              payment.status === 'completed' ? 'bg-green-100' : 
                              payment.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                            }`}>
                              <DollarSign className={`h-5 w-5 ${
                                payment.status === 'completed' ? 'text-green-600' : 
                                payment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                              }`} />
                            </div>
                            
                            <div>
                              <p className="font-medium text-slate-900">
                                Publication annonce
                              </p>
                              <p className="text-sm text-slate-600">
                                {payment.listing?.title || 'Annonce supprimée'}
                              </p>
                              <p className="text-xs text-slate-500">
                                {formatDate(payment.created_at)} • {payment.payment_method}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-semibold text-slate-900">
                              {formatPrice(payment.amount)}
                            </div>
                            <Badge className={
                              payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {payment.status === 'completed' ? 'Réussi' :
                               payment.status === 'pending' ? 'En cours' : 'Échoué'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>

                    {payments.length === 0 && (
                      <div className="text-center py-8">
                        <Wallet className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          Aucun paiement
                        </h3>
                        <p className="text-slate-600">
                          Vos transactions apparaîtront ici
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Paramètres */}
            {activeTab === 'settings' && user && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                
                <h2 className="text-2xl font-bold text-slate-900">
                  Paramètres du compte
                </h2>

                {/* Informations personnelles */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informations personnelles</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    {/* Statut de vérification */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {user.is_verified ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-orange-600" />
                        )}
                        <div>
                          <p className="font-medium text-slate-900">
                            {user.is_verified ? 'Compte vérifié' : 'Compte non vérifié'}
                          </p>
                          <p className="text-sm text-slate-600">
                            {user.is_verified 
                              ? 'Votre numéro de téléphone est vérifié'
                              : 'Vérifiez votre numéro pour débloquer toutes les fonctionnalités'
                            }
                          </p>
                        </div>
                      </div>
                      
                      {!user.is_verified && (
                        <Button variant="outline" onClick={() => router.push('/auth/verify')}>
                          Vérifier maintenant
                        </Button>
                      )}
                    </div>

                    {/* Informations du profil */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Prénom
                        </label>
                        <input
                          type="text"
                          value={user.first_name}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          readOnly
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Nom
                        </label>
                        <input
                          type="text"
                          value={user.last_name}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          readOnly
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          value={user.phone}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50"
                          readOnly
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={user.email || 'Non renseigné'}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Région
                        </label>
                        <input
                          type="text"
                          value={user.region}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button>
                        Sauvegarder les modifications
                      </Button>
                      <Button variant="outline">
                        Modifier mot de passe
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Statistiques du compte */}
                <Card>
                  <CardHeader>
                    <CardTitle>Statistiques du compte</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900">
                          {formatDate(user.created_at)}
                        </div>
                        <div className="text-sm text-slate-600">Membre depuis</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900">
                          {stats ? stats.total_listings : 0}
                        </div>
                        <div className="text-sm text-slate-600">Annonces publiées</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900">
                          {stats ? stats.total_views.toLocaleString() : 0}
                        </div>
                        <div className="text-sm text-slate-600">Vues totales</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions dangereuses */}
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-600">Zone dangereuse</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">Supprimer le compte</p>
                          <p className="text-sm text-slate-600">
                            Cette action est irréversible. Toutes vos données seront supprimées.
                          </p>
                        </div>
                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

          </AnimatePresence>
        </section>
      </main>
      
      <Footer />
    </>
  );
}