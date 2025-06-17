// ================================================
// PAGE DÉTAIL ANNONCE - src/app/listings/[id]/page.tsx
// SenMarket - Visualisation premium d'annonce 👁️
// ================================================

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { ListingImageGallery } from '@/components/listings/listing-image-gallery'
import { ListingDetails } from '@/components/listings/listing-details'
import { SellerInfo } from '@/components/listings/seller-info'
import { ContactForm } from '@/components/forms/contact-form'
import { RelatedListings } from '@/components/listings/related-listings'
import { ListingActions } from '@/components/listings/listing-actions'
import { BreadcrumbNav } from '@/components/common/breadcrumb-nav'
import { ShareButtons } from '@/components/common/share-buttons'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Eye, 
  Heart, 
  Share2, 
  MapPin, 
  Calendar, 
  Shield, 
  MessageCircle,
  Phone,
  Star,
  AlertTriangle
} from 'lucide-react'

// === INTERFACE PROPS ===
interface ListingDetailPageProps {
  params: {
    id: string
  }
}

// === METADATA DYNAMIQUE ===
export async function generateMetadata({ params }: ListingDetailPageProps): Promise<Metadata> {
  // TODO: Récupérer les données de l'annonce via API
  // const listing = await fetchListing(params.id)
  
  // Données mock pour l'exemple
  const listing = {
    id: params.id,
    title: "iPhone 13 Pro Max 256GB - État Neuf",
    description: "iPhone 13 Pro Max en excellent état, utilisé 6 mois seulement...",
    price: 850000,
    currency: "XOF",
    images: ["/images/listings/iphone-1.jpg"],
    category: { name: "Électronique" },
    user: { first_name: "Amadou", last_name: "Diallo" },
    region: "Dakar - Plateau"
  }

  if (!listing) {
    return {
      title: 'Annonce non trouvée | SenMarket',
    }
  }

  const title = `${listing.title} - ${listing.price.toLocaleString()} ${listing.currency} | SenMarket`
  const description = `${listing.description.slice(0, 160)}... Découvrez cette annonce vérifiée sur SenMarket, le marketplace #1 du Sénégal.`

  return {
    title,
    description,
    keywords: [
      listing.title,
      listing.category.name,
      listing.region,
      'senmarket',
      'marketplace sénégal',
      'achat vente'
    ],
    openGraph: {
      title,
      description,
      images: listing.images.length > 0 ? [listing.images[0]] : ['/og-listing.jpg'],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: listing.images.length > 0 ? [listing.images[0]] : ['/twitter-listing.jpg'],
    },
    alternates: {
      canonical: `/listings/${params.id}`,
    }
  }
}

// === COMPOSANT PRINCIPAL ===
export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  // TODO: Récupérer les données via API
  // const listing = await fetchListing(params.id)
  
  // Données mock pour l'exemple
  const listing = {
    id: params.id,
    title: "iPhone 13 Pro Max 256GB - État Neuf",
    description: `iPhone 13 Pro Max 256GB en excellent état, utilisé seulement 6 mois.

**Caractéristiques:**
- Couleur: Bleu Sierra
- Stockage: 256GB
- État: 9/10
- Accessoires: Boîte d'origine, chargeur, écouteurs non utilisés
- Facture disponible

**Pourquoi je vends:**
Je passe à l'iPhone 14 Pro pour le travail.

**Ce qui est inclus:**
- iPhone 13 Pro Max
- Boîte d'origine
- Chargeur Lightning
- EarPods neufs
- Coque de protection
- Verre trempé installé

L'appareil n'a jamais été réparé et fonctionne parfaitement. Batterie à 96% de capacité. Aucune rayure sur l'écran grâce au verre trempé installé dès l'achat.

Livraison possible à Dakar ou rencontre dans un lieu public. Paiement Orange Money, Wave ou Free Money accepté.`,
    
    price: 850000,
    currency: "XOF",
    region: "Dakar - Plateau",
    views_count: 1247,
    created_at: "2024-06-15T10:30:00Z",
    expires_at: "2024-07-15T10:30:00Z",
    status: "active",
    is_featured: true,
    
    images: [
      "/images/listings/iphone-1.jpg",
      "/images/listings/iphone-2.jpg", 
      "/images/listings/iphone-3.jpg",
      "/images/listings/iphone-4.jpg"
    ],
    
    category: {
      id: "electronics",
      name: "Électronique",
      slug: "electronics",
      icon: "fa-laptop"
    },
    
    user: {
      id: "user-123",
      first_name: "Amadou",
      last_name: "Diallo",
      avatar_url: "/images/avatars/amadou.jpg",
      phone: "+221771234567",
      is_verified: true,
      member_since: "2023-01-15T00:00:00Z",
      total_listings: 15,
      response_rate: 95,
      average_rating: 4.8,
      location: "Dakar, Sénégal"
    }
  }

  if (!listing) {
    notFound()
  }

  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: 'Annonces', href: '/listings' },
    { label: listing.category.name, href: `/categories/${listing.category.slug}` },
    { label: listing.title, href: `/listings/${listing.id}`, current: true }
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* === NAVIGATION BREADCRUMB === */}
      <div className="bg-white border-b border-slate-200">
        <div className="container-fluid py-4">
          <BreadcrumbNav items={breadcrumbs} />
        </div>
      </div>

      {/* === CONTENU PRINCIPAL === */}
      <div className="container-fluid py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* === COLONNE GAUCHE - IMAGES ET DÉTAILS === */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* En-tête annonce */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge 
                        variant={listing.is_featured ? "default" : "secondary"}
                        className={listing.is_featured ? "bg-gradient-atlantic text-white" : ""}
                      >
                        {listing.is_featured ? "⭐ À la Une" : listing.category.name}
                      </Badge>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        <Shield className="w-3 h-3 mr-1" />
                        Vérifiée
                      </Badge>
                    </div>
                    
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                      {listing.title}
                    </h1>
                    
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {listing.region}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Publié le {new Date(listing.created_at).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {listing.views_count.toLocaleString()} vues
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <ListingActions listingId={listing.id} />
                    <ShareButtons 
                      url={`https://senmarket.sn/listings/${listing.id}`}
                      title={listing.title}
                    />
                  </div>
                </div>

                {/* Prix principal */}
                <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl lg:text-4xl font-bold text-gradient mb-1">
                        {listing.price.toLocaleString()} {listing.currency}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Prix négociable • Paiement mobile accepté
                      </p>
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground mb-1">Expire le</div>
                        <div className="text-sm font-medium">
                          {new Date(listing.expires_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alerte expiration */}
                {new Date(listing.expires_at) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                  <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-lg p-3 mb-6">
                    <AlertTriangle className="w-4 h-4" />
                    Cette annonce expire dans moins d'une semaine
                  </div>
                )}
              </div>
            </div>

            {/* Galerie d'images */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <Suspense fallback={
                <div className="h-96 bg-slate-200 animate-pulse" />
              }>
                <ListingImageGallery images={listing.images} title={listing.title} />
              </Suspense>
            </div>

            {/* Description détaillée */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <Suspense fallback={<LoadingSpinner />}>
                  <ListingDetails description={listing.description} />
                </Suspense>
              </div>
            </div>

            {/* Informations supplémentaires */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Informations</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Catégorie</span>
                      <span className="font-medium">{listing.category.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Région</span>
                      <span className="font-medium">{listing.region}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">État</span>
                      <Badge variant="outline" className="text-green-600">Actif</Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Référence</span>
                      <span className="font-mono text-sm">#{listing.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vues</span>
                      <span className="font-medium">{listing.views_count.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <Badge variant={listing.is_featured ? "default" : "secondary"}>
                        {listing.is_featured ? "Premium" : "Standard"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* === COLONNE DROITE - VENDEUR ET CONTACT === */}
          <div className="space-y-6">
            
            {/* Informations vendeur */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Vendeur</h3>
                <Suspense fallback={<LoadingSpinner />}>
                  <SellerInfo seller={listing.user} />
                </Suspense>
              </div>
            </div>

            {/* Formulaire de contact */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  Contacter le vendeur
                </h3>
                <Suspense fallback={<LoadingSpinner />}>
                  <ContactForm listingId={listing.id} sellerId={listing.user.id} />
                </Suspense>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-gradient-ocean text-white rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Actions rapides</h3>
              <div className="space-y-3">
                <Button 
                  className="w-full bg-white text-blue-900 hover:bg-white/90"
                  size="lg"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Appeler maintenant
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-white text-white hover:bg-white/10"
                  size="lg"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Envoyer SMS
                </Button>
                <Button 
                  variant="outline"
                  className="w-full border-white text-white hover:bg-white/10"
                  size="lg"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Ajouter aux favoris
                </Button>
              </div>
              
              <Separator className="my-4 bg-white/20" />
              
              <div className="text-center text-sm opacity-90">
                <p className="mb-2">💰 Paiement sécurisé</p>
                <div className="flex items-center justify-center gap-2 text-xs">
                  <span>Orange Money</span>
                  <span>•</span>
                  <span>Wave</span>
                  <span>•</span>
                  <span>Free Money</span>
                </div>
              </div>
            </div>

            {/* Conseils sécurité */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Conseils de sécurité
              </h3>
              <ul className="text-sm text-amber-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  Rencontrez le vendeur dans un lieu public
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  Vérifiez l'article avant le paiement
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  Utilisez les paiements mobiles sécurisés
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  Signalez les comportements suspects
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* === ANNONCES SIMILAIRES === */}
        <div className="mt-12">
          <Suspense fallback={<LoadingSpinner />}>
            <RelatedListings 
              categoryId={listing.category.id}
              currentListingId={listing.id}
              region={listing.region}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}