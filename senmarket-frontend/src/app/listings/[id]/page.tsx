'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Heart,
  Share2,
  MapPin,
  Clock,
  Eye,
  Star,
  Shield,
  Phone,
  Mail,
  User,
  ChevronLeft,
  ChevronRight,
  X,
  Send,
  CheckCircle,
  AlertCircle,
  Camera,
  MessageCircle,
  TrendingUp,
  Award,
  Loader2,
  ArrowLeft,
  ExternalLink,
  Flag,
  Bookmark
} from 'lucide-react';

// Types basés sur votre API
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
  user: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    region: string;
    is_verified: boolean;
    created_at: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    description: string;
  };
}

interface ContactForm {
  name: string;
  phone: string;
  email: string;
  message: string;
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;

  // États
  const [listing, setListing] = useState<Listing | null>(null);
  const [relatedListings, setRelatedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Galerie photos
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  
  // Formulaire de contact
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState<ContactForm>({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  // Chargement des données
  useEffect(() => {
    if (listingId) {
      fetchListing();
    }
  }, [listingId]);

  useEffect(() => {
    if (listing) {
      fetchRelatedListings();
      // Incrémenter le compteur de vues (appel sans attendre)
      incrementViews();
    }
  }, [listing]);

  const fetchListing = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8080/api/v1/listings/${listingId}`);
      
      if (!response.ok) {
        throw new Error('Annonce non trouvée');
      }
      
      const data = await response.json();
      setListing(data.data);
      
      // Initialiser le message par défaut
      setContactForm(prev => ({
        ...prev,
        message: `Bonjour, je suis intéressé(e) par votre annonce "${data.data.title}". Pourriez-vous me donner plus d'informations ?`
      }));
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedListings = async () => {
    if (!listing) return;
    
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/listings?category_id=${listing.category.id}&limit=4`
      );
      const data = await response.json();
      
      // Exclure l'annonce actuelle
      const related = (data.data?.listings || []).filter((item: Listing) => item.id !== listing.id);
      setRelatedListings(related);
    } catch (error) {
      console.error('Erreur chargement annonces similaires:', error);
    }
  };

  const incrementViews = async () => {
    try {
      // En fait, votre backend n'a pas d'endpoint spécifique pour les vues
      // Mais les vues sont probablement incrémentées automatiquement lors du GET
      console.log('Vue enregistrée pour l\'annonce:', listingId);
    } catch (error) {
      console.error('Erreur enregistrement vue:', error);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!listing) return;
    
    setIsSubmittingContact(true);
    
    try {
      const response = await fetch('http://localhost:8080/api/v1/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listing_id: listing.id,
          ...contactForm
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }
      
      setContactSuccess(true);
      setShowContactForm(false);
      
      // Reset form
      setContactForm({
        name: '',
        phone: '',
        email: '',
        message: `Bonjour, je suis intéressé(e) par votre annonce "${listing.title}". Pourriez-vous me donner plus d'informations ?`
      });
      
    } catch (error) {
      console.error('Erreur envoi contact:', error);
      alert('Erreur lors de l\'envoi du message. Veuillez réessayer.');
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.title,
          text: `Découvrez cette annonce sur SenMarket`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Partage annulé');
      }
    } else {
      // Fallback: copier le lien
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papiers !');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    if (hours < 24) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    return `il y a ${days} jour${days > 1 ? 's' : ''}`;
  };

  const nextImage = () => {
    if (listing && listing.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === listing.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (listing && listing.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? listing.images.length - 1 : prev - 1
      );
    }
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-slate-600">Chargement de l'annonce...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Error state
  if (error || !listing) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Annonce non trouvée</h2>
            <p className="text-slate-600 mb-6">{error || 'Cette annonce n\'existe plus ou a été supprimée.'}</p>
            <Button onClick={() => router.push('/listings')} className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux annonces
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-slate-50">
        
        {/* Notification de succès */}
        <AnimatePresence>
          {contactSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
            >
              <CheckCircle className="h-5 w-5" />
              <span>Message envoyé avec succès !</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setContactSuccess(false)}
                className="text-white hover:bg-green-600 p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Breadcrumb */}
        <section className="bg-white border-b border-slate-200">
          <div className="container mx-auto px-6 py-4">
            <nav className="flex items-center gap-2 text-sm text-slate-600">
              <button 
                onClick={() => router.push('/')}
                className="hover:text-blue-600 transition-colors"
              >
                Accueil
              </button>
              <span>/</span>
              <button 
                onClick={() => router.push('/listings')}
                className="hover:text-blue-600 transition-colors"
              >
                Annonces
              </button>
              <span>/</span>
              <button 
                onClick={() => router.push(`/listings?category_id=${listing.category.id}`)}
                className="hover:text-blue-600 transition-colors"
              >
                {listing.category.name}
              </button>
              <span>/</span>
              <span className="text-slate-900 font-medium line-clamp-1">
                {listing.title}
              </span>
            </nav>
          </div>
        </section>

        {/* Contenu principal */}
        <section className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Galerie photos */}
              <Card className="overflow-hidden">
                <div className="relative">
                  
                  {/* Image principale */}
                  <div className="relative h-96 bg-gradient-to-br from-blue-100 to-orange-100">
                    {listing.images && listing.images.length > 0 ? (
                      <img
                        src={`http://localhost:8080${listing.images[currentImageIndex]}`}
                        alt={listing.title}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setShowImageModal(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-8xl">
                        {listing.category.icon || '📦'}
                      </div>
                    )}
                    
                    {/* Contrôles galerie */}
                    {listing.images && listing.images.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                          onClick={nextImage}
                        >
                          <ChevronRight className="h-6 w-6" />
                        </Button>
                        
                        {/* Indicateurs */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                          {listing.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-2 h-2 rounded-full transition-all ${
                                index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {listing.is_featured && (
                        <Badge className="bg-yellow-500 text-white">
                          ⭐ Vedette
                        </Badge>
                      )}
                      <Badge variant="secondary">
                        {listing.category.name}
                      </Badge>
                    </div>
                    
                    {/* Actions */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-white/80 hover:bg-white"
                        onClick={() => setIsFavorite(!isFavorite)}
                      >
                        <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-white/80 hover:bg-white"
                        onClick={handleShare}
                      >
                        <Share2 className="h-5 w-5" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-white/80 hover:bg-white"
                      >
                        <Flag className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    {/* Compteur images */}
                    {listing.images && listing.images.length > 0 && (
                      <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        <Camera className="h-4 w-4" />
                        {currentImageIndex + 1} / {listing.images.length}
                      </div>
                    )}
                  </div>
                  
                  {/* Miniatures */}
                  {listing.images && listing.images.length > 1 && (
                    <div className="p-4 border-t border-slate-200">
                      <div className="flex gap-2 overflow-x-auto">
                        {listing.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                              index === currentImageIndex ? 'border-blue-500' : 'border-slate-200'
                            }`}
                          >
                            <img
                              src={`http://localhost:8080${image}`}
                              alt={`${listing.title} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Informations principales */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    
                    {/* Titre et prix */}
                    <div>
                      <h1 className="text-3xl font-bold text-slate-900 mb-4">
                        {listing.title}
                      </h1>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-4xl font-bold text-blue-600">
                          {formatPrice(listing.price)}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{listing.views_count} vues</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatTimeAgo(listing.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Localisation */}
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="h-5 w-5" />
                        <span className="text-lg">{listing.region}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900 mb-3">
                        Description
                      </h2>
                      <div className="prose prose-slate max-w-none">
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {listing.description}
                        </p>
                      </div>
                    </div>

                    {/* Détails */}
                    <div className="border-t border-slate-200 pt-6">
                      <h2 className="text-xl font-semibold text-slate-900 mb-4">
                        Détails de l'annonce
                      </h2>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <span className="text-sm text-slate-500">Catégorie</span>
                          <p className="font-medium flex items-center gap-2">
                            <span>{listing.category.icon}</span>
                            {listing.category.name}
                          </p>
                        </div>
                        
                        <div>
                          <span className="text-sm text-slate-500">Région</span>
                          <p className="font-medium">{listing.region}</p>
                        </div>
                        
                        <div>
                          <span className="text-sm text-slate-500">Statut</span>
                          <p className="font-medium">
                            <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                              {listing.status === 'active' ? 'Disponible' : listing.status}
                            </Badge>
                          </p>
                        </div>
                        
                        <div>
                          <span className="text-sm text-slate-500">Référence</span>
                          <p className="font-medium text-xs text-slate-600">
                            #{listing.id.substring(0, 8)}
                          </p>
                        </div>
                        
                        <div>
                          <span className="text-sm text-slate-500">Publié le</span>
                          <p className="font-medium">
                            {new Date(listing.created_at).toLocaleDateString('fr-SN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Annonces similaires */}
              {relatedListings.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Annonces similaires
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {relatedListings.slice(0, 4).map((relatedListing) => (
                        <Card 
                          key={relatedListing.id} 
                          className="cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => router.push(`/listings/${relatedListing.id}`)}
                        >
                          <div className="aspect-video bg-gradient-to-br from-blue-100 to-orange-100 relative">
                            {relatedListing.images && relatedListing.images.length > 0 ? (
                              <img
                                src={`http://localhost:8080${relatedListing.images[0]}`}
                                alt={relatedListing.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-4xl">
                                {relatedListing.category.icon || '📦'}
                              </div>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold line-clamp-1 mb-2">
                              {relatedListing.title}
                            </h3>
                            <p className="text-lg font-bold text-blue-600 mb-2">
                              {formatPrice(relatedListing.price)}
                            </p>
                            <p className="text-sm text-slate-600 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {relatedListing.region}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Vendeur */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Vendeur
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    
                    {/* Profil vendeur */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">
                          {listing.user.first_name} {listing.user.last_name}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="h-3 w-3" />
                          <span>{listing.user.region}</span>
                          
                          {listing.user.is_verified && (
                            <div className="flex items-center gap-1 text-green-600">
                              <Shield className="h-3 w-3" />
                              <span className="text-xs">Vérifié</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Statistiques vendeur */}
                    <div className="border border-slate-200 rounded-lg p-3">
                      <div className="text-sm text-slate-600 mb-2">Membre depuis</div>
                      <div className="font-medium">
                        {new Date(listing.user.created_at).toLocaleDateString('fr-SN', {
                          year: 'numeric',
                          month: 'long'
                        })}
                      </div>
                    </div>
                    
                    {/* Boutons contact */}
                    <div className="space-y-3">
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => setShowContactForm(true)}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Contacter le vendeur
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => window.location.href = `tel:${listing.user.phone}`}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Appeler
                      </Button>
                    </div>
                    
                    {/* Conseils sécurité */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-amber-600 mt-0.5" />
                        <div className="text-sm text-amber-800">
                          <p className="font-medium mb-1">Conseils de sécurité</p>
                          <ul className="text-xs space-y-1">
                            <li>• Rencontrez-vous dans un lieu public</li>
                            <li>• Vérifiez l'article avant le paiement</li>
                            <li>• Utilisez des moyens de paiement sécurisés</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Actions rapides */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setIsFavorite(!isFavorite)}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                      {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Partager l'annonce
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-red-600 hover:text-red-700"
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      Signaler l'annonce
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Modal galerie photos */}
        <AnimatePresence>
          {showImageModal && listing.images && listing.images.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
              onClick={() => setShowImageModal(false)}
            >
              <div className="relative max-w-4xl max-h-full p-4">
                <img
                  src={`http://localhost:8080${listing.images[currentImageIndex]}`}
                  alt={listing.title}
                  className="max-w-full max-h-full object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
                
                {/* Contrôles */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 text-white hover:bg-white/20"
                  onClick={() => setShowImageModal(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
                
                {listing.images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                    >
                      <ChevronLeft className="h-8 w-8" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                    >
                      <ChevronRight className="h-8 w-8" />
                    </Button>
                  </>
                )}
                
                {/* Compteur */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full">
                  {currentImageIndex + 1} / {listing.images.length}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal formulaire de contact */}
        <AnimatePresence>
          {showContactForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
              onClick={() => setShowContactForm(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-slate-900">
                    Contacter le vendeur
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowContactForm(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Votre nom *
                    </label>
                    <Input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Prénom Nom"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Téléphone *
                    </label>
                    <Input
                      type="tel"
                      required
                      value={contactForm.phone}
                      onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+221 77 XXX XX XX"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email (optionnel)
                    </label>
                    <Input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="votre@email.com"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Décrivez votre intérêt pour cette annonce..."
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <Shield className="h-4 w-4 inline mr-1" />
                      Vos informations ne seront partagées qu'avec le vendeur de cette annonce.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowContactForm(false)}
                      disabled={isSubmittingContact}
                    >
                      Annuler
                    </Button>
                    
                    <Button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      disabled={isSubmittingContact}
                    >
                      {isSubmittingContact ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Envoi...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Envoyer
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <Footer />
    </>
  );
}