'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DynamicLaunchBanner } from '@/components/DynamicLaunchBanner';
import { 
  Upload,
  X,
  Eye,
  Camera,
  Check,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  Loader2,
  CreditCard,
  Smartphone,
  MapPin,
  Tag,
  FileText,
  DollarSign,
  Zap,
  Star,
  Shield,
  Clock,
  ArrowRight,
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit,
  Save,
  RefreshCw,
  Phone,
  ExternalLink,
  Home,
  Car,
  Laptop,
  Shirt,
  Briefcase,
  Wrench,
  Sofa,
  Heart,
  Settings,
  Gift,
  Info,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

// 🆕 IMPORTS POUR LES QUOTAS
import { useCreateListingEligibility, useInvalidateQuotaCache } from '@/hooks/useQuota';
import listingsService, { 
  CreateListingRequest, 
  CreateListingResponse 
} from '@/services/listings.service';

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

interface ListingFormData {
  title: string;
  description: string;
  price: string;
  category_id: string;
  region: string;
}

// 🆕 COMPOSANT CARD ÉLIGIBILITÉ
const EligibilityCard: React.FC<{
  canCreateFree: boolean;
  isInLaunchPhase: boolean;
  statusMessage: string;
  urgencyMessage: string | null;
  recommendations: any[];
  isLoading: boolean;
}> = ({ 
  canCreateFree, 
  isInLaunchPhase, 
  statusMessage, 
  urgencyMessage,
  recommendations,
  isLoading 
}) => {
  if (isLoading) {
    return (
      <Card className="mb-8 border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <p className="text-slate-600">Vérification de votre éligibilité...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getCardStyle = () => {
    if (isInLaunchPhase) {
      return urgencyMessage 
        ? "border-orange-200 bg-orange-50" 
        : "border-green-200 bg-green-50";
    }
    return canCreateFree 
      ? "border-blue-200 bg-blue-50" 
      : "border-yellow-200 bg-yellow-50";
  };

  const getIcon = () => {
    if (isInLaunchPhase) {
      return urgencyMessage 
        ? <AlertTriangle className="h-6 w-6 text-orange-600" />
        : <Gift className="h-6 w-6 text-green-600" />;
    }
    return canCreateFree 
      ? <CheckCircle className="h-6 w-6 text-blue-600" />
      : <CreditCard className="h-6 w-6 text-yellow-600" />;
  };

  return (
    <Card className={`mb-8 ${getCardStyle()}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {getIcon()}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-slate-900">
                {canCreateFree ? "✅ Publication gratuite disponible" : "💳 Paiement requis"}
              </h3>
              {isInLaunchPhase && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Phase de lancement
                </Badge>
              )}
            </div>
            
            <p className="text-slate-700 mb-3">{statusMessage}</p>
            
            {urgencyMessage && (
              <div className="bg-orange-100 border border-orange-200 rounded-lg p-3 mb-3">
                <p className="text-orange-800 font-medium text-sm">{urgencyMessage}</p>
              </div>
            )}
            
            {recommendations.length > 0 && (
              <div className="space-y-2">
                {recommendations.map((rec, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${
                      rec.priority === 'high' ? 'bg-red-500' :
                      rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <span className="text-slate-600">{rec.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Icônes des catégories
const categoryIcons: { [key: string]: any } = {
  'fa-car': Car,
  'fa-home': Home,
  'fa-laptop': Laptop,
  'fa-tshirt': Shirt,
  'fa-briefcase': Briefcase,
  'fa-tools': Wrench,
  'fa-couch': Sofa,
  'fa-paw': Heart,
};

// Régions du Sénégal
const regions = [
  'Dakar', 'Thiès', 'Diourbel', 'Fatick', 'Kaolack', 'Kolda',
  'Louga', 'Matam', 'Saint-Louis', 'Sédhiou', 'Tambacounda',
  'Kaffrine', 'Kédougou', 'Ziguinchor', 'Gossas', 'Koungheul'
];

// Étapes (restent à 4)
const steps = [
  { id: 1, title: 'Informations', icon: FileText },
  { id: 2, title: 'Images', icon: Camera },
  { id: 3, title: 'Aperçu', icon: Eye },
  { id: 4, title: 'Confirmation', icon: CheckCircle },
];

export default function SellPage() {
  const router = useRouter();
  
  // 🆕 HOOKS POUR LES QUOTAS
  const {
    canCreateFree,
    requiresPayment,
    isInLaunchPhase,
    statusMessage,
    urgencyMessage,
    recommendations,
    isLoading: isLoadingEligibility,
    refetchBoth
  } = useCreateListingEligibility();
  
  const { invalidateAll: invalidateQuotaCache } = useInvalidateQuotaCache();
  
  // États du formulaire
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdListing, setCreatedListing] = useState<CreateListingResponse | null>(null);

  // Form hook
  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<ListingFormData>({
    defaultValues: {
      title: '',
      description: '',
      price: '',
      category_id: '',
      region: 'Dakar'
    }
  });

  const watchedValues = watch();

  // Chargement initial
  useEffect(() => {
    // Vérifier l'authentification
    const token = localStorage.getItem('senmarket_token');
    const userData = localStorage.getItem('senmarket_user');
    
    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    const user = JSON.parse(userData);
    setValue('region', user.region || 'Dakar');

    // Charger les catégories
    fetchCategories();
  }, [router, setValue]);

  // Fonctions utilitaires
  const showError = useCallback((title: string, message: string) => {
    setError(`${title}: ${message}`);
    toast.error(title, { description: message });
    setTimeout(() => setError(null), 6000);
  }, []);

  const showSuccess = useCallback((title: string, message: string) => {
    setSuccess(`${title}: ${message}`);
    toast.success(title, { description: message });
    setTimeout(() => setSuccess(null), 4000);
  }, []);

  // Charger les catégories
  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    }
  };

  // Upload d'images (identique à l'original)
  const handleImageUpload = useCallback(async (files: File[]) => {
    console.log('🔥 Upload démarré avec', files.length, 'fichiers');

    if (uploadedImages.length + files.length > 5) {
      showError('Limite dépassée', 'Maximum 5 images');
      return;
    }

    if (files.length === 0) return;

    setIsUploading(true);

    try {
      const token = localStorage.getItem('senmarket_token');
      if (!token) {
        showError('Erreur auth', 'Reconnectez-vous');
        return;
      }

      const validFiles = files.filter(file => {
        const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
        const isValidSize = file.size <= 5 * 1024 * 1024;

        if (!isValidType) {
          showError('Format invalide', `${file.name} - Formats: JPG, PNG, WebP`);
          return false;
        }
        if (!isValidSize) {
          showError('Fichier trop lourd', `${file.name} - Max: 5MB`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch('http://localhost:8080/api/v1/images/upload-multiple', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }

      const data = await response.json();

      let uploadedUrls: string[] = [];

      if (data.data && Array.isArray(data.data)) {
        uploadedUrls = data.data.map((img: any) => {
          if (typeof img === 'string') {
            return img.startsWith('http') ? img : `http://localhost:8080${img}`;
          }
          if (img.url) {
            return img.url.startsWith('http') ? img.url : `http://localhost:8080${img.url}`;
          }
          if (img.URL) {
            return img.URL.startsWith('http') ? img.URL : `http://localhost:8080${img.URL}`;
          }
          if (img.filename) {
            return `http://localhost:8080/uploads/${img.filename}`;
          }
          return null;
        }).filter((url: string | null) => url !== null);
      }

      if (uploadedUrls.length === 0) {
        throw new Error('Impossible d\'extraire les URLs des images');
      }

      setUploadedImages(prev => [...prev, ...uploadedUrls]);
      showSuccess('Images uploadées', `${uploadedUrls.length} image(s) ajoutée(s)`);

    } catch (error) {
      console.error('❌ Erreur upload:', error);
      showError('Erreur upload', error instanceof Error ? error.message : 'Échec upload');
    } finally {
      setIsUploading(false);
    }
  }, [uploadedImages.length, showError, showSuccess]);

  // Drag & Drop handlers
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleImageUpload(files);
  }, [handleImageUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) handleImageUpload(files);
    e.target.value = '';
  }, [handleImageUpload]);

  const removeImage = useCallback((index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Navigation
  const handleNext = useCallback(() => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  }, [currentStep]);

  // 🆕 CRÉATION D'ANNONCE AVEC QUOTAS
  const handleFormSubmit = useCallback(async (data: ListingFormData) => {
    console.log('📝 Soumission formulaire avec quotas:', data);

    if (uploadedImages.length === 0) {
      showError('Images requises', 'Vous devez ajouter au moins une image');
      return;
    }

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('senmarket_token');
      const userData = localStorage.getItem('senmarket_user');
      
      if (!token || !userData) {
        showError('Session expirée', 'Veuillez vous reconnecter');
        router.push('/auth/login');
        return;
      }

      const user = JSON.parse(userData);
      
      // 🆕 DONNÉES AVEC NOUVEAU SERVICE
      const listingData: CreateListingRequest = {
        title: data.title.trim(),
        description: data.description.trim(),
        price: parseFloat(data.price),
        category_id: data.category_id,
        region: data.region,
        images: uploadedImages,
        phone: user.phone,
      };

      console.log('📡 Envoi via service avec quotas:', listingData);

      // 🆕 UTILISER LE NOUVEAU SERVICE
      const result = await listingsService.createListing(listingData);
      
      console.log('✅ Réponse création avec quotas:', result);
      
      setCreatedListing(result);
      
      // 🆕 INVALIDER LES CACHES DE QUOTA
      invalidateQuotaCache();
      refetchBoth();
      
      // 🆕 MESSAGES SELON LE STATUT
      const statusInfo = listingsService.formatCreationStatusMessage(result);
      
      if (result.status === 'published_free') {
        showSuccess(statusInfo.title, statusInfo.message);
      } else {
        toast.info(statusInfo.title, {
          description: statusInfo.message,
          action: statusInfo.action ? {
            label: statusInfo.action,
            onClick: () => {
              // Redirection vers paiement
              if (result.payment_required?.payment_url) {
                window.open(result.payment_required.payment_url, '_blank');
              }
            }
          } : undefined
        });
      }
      
      // Passer à l'étape de confirmation
      setCurrentStep(4);

    } catch (error: any) {
      console.error('❌ Erreur création avec quotas:', error);
      
      // 🆕 GESTION D'ERREURS SPÉCIFIQUES AUX QUOTAS
      if (error.message?.includes('Quota épuisé')) {
        showError('Quota épuisé', 'Vous avez utilisé toutes vos annonces gratuites ce mois');
        // Refetch pour mettre à jour l'éligibilité
        refetchBoth();
      } else if (error.response?.status === 403) {
        showError('Quota épuisé', 'Vous devez payer pour publier cette annonce');
        refetchBoth();
      } else {
        showError('Erreur création', error.message || 'Une erreur est survenue');
      }
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImages, showError, showSuccess, router, invalidateQuotaCache, refetchBoth]);

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
        <div className="container mx-auto px-6">
          
          {/* En-tête */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Publier une annonce
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Vendez facilement et rapidement sur la marketplace #1 du Sénégal
            </p>
          </motion.div>

          {/* 🆕 BANNIÈRE DYNAMIQUE */}
          <DynamicLaunchBanner />

          {/* 🆕 CARD ÉLIGIBILITÉ */}
          <EligibilityCard
            canCreateFree={canCreateFree}
            isInLaunchPhase={isInLaunchPhase}
            statusMessage={statusMessage}
            urgencyMessage={urgencyMessage}
            recommendations={recommendations}
            isLoading={isLoadingEligibility}
          />

          {/* Alertes */}
          {error && (
            <motion.div className="max-w-4xl mx-auto mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {success && (
            <motion.div className="max-w-4xl mx-auto mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Alert className="border-green-200 bg-green-50">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Progress Steps */}
          <motion.div className="mb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-center">
              <div className="flex items-center space-x-4 bg-white rounded-2xl p-6 shadow-lg">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                      currentStep >= step.id 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${
                        currentStep >= step.id ? 'text-blue-600' : 'text-slate-400'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-0.5 mx-4 ${
                        currentStep > step.id ? 'bg-blue-600' : 'bg-slate-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="max-w-4xl mx-auto">
            
            <AnimatePresence mode="wait">

              {/* Étape 1: Informations */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="shadow-xl border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <FileText className="h-8 w-8 text-blue-600" />
                        Informations de l'annonce
                      </CardTitle>
                      <p className="text-slate-600">Décrivez votre article en détail</p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      
                      {/* Titre */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Titre de l'annonce *
                        </label>
                        <Input
                          {...register('title', { 
                            required: 'Le titre est requis',
                            minLength: { value: 10, message: 'Minimum 10 caractères' },
                            maxLength: { value: 100, message: 'Maximum 100 caractères' }
                          })}
                          placeholder="Ex: iPhone 13 Pro 128GB en excellent état"
                          className="text-lg"
                        />
                        {errors.title && (
                          <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
                        )}
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Description *
                        </label>
                        <Textarea
                          {...register('description', { 
                            required: 'La description est requise',
                            minLength: { value: 20, message: 'Minimum 20 caractères' }
                          })}
                          placeholder="Décrivez votre article : état, année, caractéristiques..."
                          rows={4}
                          className="resize-none"
                        />
                        {errors.description && (
                          <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                        )}
                      </div>

                      {/* Prix et Catégorie */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Prix (FCFA) *
                          </label>
                          <Input
                            type="number"
                            {...register('price', { 
                              required: 'Le prix est requis',
                              min: { value: 100, message: 'Prix minimum 100 FCFA' }
                            })}
                            placeholder="Ex: 450000"
                            className="text-lg"
                          />
                          {errors.price && (
                            <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Catégorie *
                          </label>
                          <select
                            {...register('category_id', { required: 'La catégorie est requise' })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                          >
                            <option value="">Choisir une catégorie</option>
                            {categories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                          {errors.category_id && (
                            <p className="text-red-600 text-sm mt-1">{errors.category_id.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Région */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Région *
                        </label>
                        <select
                          {...register('region', { required: 'La région est requise' })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                        >
                          {regions.map((region) => (
                            <option key={region} value={region}>
                              {region}
                            </option>
                          ))}
                        </select>
                        {errors.region && (
                          <p className="text-red-600 text-sm mt-1">{errors.region.message}</p>
                        )}
                      </div>

                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Étape 2: Images (identique) */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="shadow-xl border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <Camera className="h-8 w-8 text-blue-600" />
                        Photos de votre article
                      </CardTitle>
                      <p className="text-slate-600">Ajoutez jusqu'à 5 photos de qualité</p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      
                      {/* Zone d'upload */}
                      <div
                        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer ${
                          dragActive 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                        } ${uploadedImages.length >= 5 ? 'opacity-50 pointer-events-none' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
                            <h3 className="text-xl font-semibold text-blue-900 mb-2">Upload en cours...</h3>
                            <p className="text-blue-600">Veuillez patienter</p>
                          </>
                        ) : (
                          <>
                            <Upload className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">
                              Glissez vos images ici
                            </h3>
                            <p className="text-slate-600 mb-6">
                              ou cliquez pour parcourir vos fichiers
                            </p>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleFileInput}
                              className="hidden"
                              id="image-upload"
                            />
                            <Button type="button" className="pointer-events-none">
                              <ImageIcon className="h-5 w-5 mr-2" />
                              Choisir des images
                            </Button>
                            <div className="mt-4 text-sm text-slate-500">
                              <p>Formats: JPG, PNG, WebP • Max: 5MB par image • Limite: 5 images</p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Images uploadées */}
                      {uploadedImages.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="font-semibold text-slate-900">
                            Images ajoutées ({uploadedImages.length}/5)
                          </h4>

                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {uploadedImages.map((imageUrl, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 border-2 border-slate-200">
                                  <img
                                    src={imageUrl}
                                    alt={`Image ${index + 1}`}
                                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                                  />
                                  
                                  {/* Badge numéro */}
                                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs rounded-full px-2 py-1">
                                    {index + 1}
                                  </div>
                                  
                                  {/* Badge principal pour la première image */}
                                  {index === 0 && (
                                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs rounded px-2 py-1">
                                      Principal
                                    </div>
                                  )}

                                  {/* Bouton supprimer */}
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute bottom-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Info d'aide */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <Camera className="h-5 w-5 text-blue-600 mt-0.5" />
                              <div>
                                <p className="text-blue-800 font-medium text-sm">Conseils pour de meilleures photos</p>
                                <ul className="text-blue-700 text-sm mt-1 space-y-1">
                                  <li>• Prenez des photos sous un bon éclairage</li>
                                  <li>• Montrez l'article sous différents angles</li>
                                  <li>• La première image sera votre photo principale</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Étape 3: Aperçu */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="shadow-xl border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <Eye className="h-8 w-8 text-blue-600" />
                        Aperçu de votre annonce
                      </CardTitle>
                      <p className="text-slate-600">Vérifiez tous les détails avant publication</p>
                    </CardHeader>

                    <CardContent className="space-y-8">
                      
                      {/* Section images */}
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">
                          Photos ({uploadedImages.length})
                        </h3>
                        
                        {uploadedImages.length > 0 ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {uploadedImages.map((imageUrl, index) => (
                                <div key={index} className="relative group">
                                  <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-sm">
                                    <img
                                      src={imageUrl}
                                      alt={`Aperçu ${index + 1}`}
                                      className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                                    />
                                    
                                    {/* Badge numéro */}
                                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs rounded-full px-2 py-1 font-medium">
                                      {index + 1}
                                    </div>
                                    
                                    {/* Badge principal */}
                                    {index === 0 && (
                                      <div className="absolute top-2 right-2 bg-green-600 text-white text-xs rounded px-2 py-1 font-medium">
                                        ⭐ Principal
                                      </div>
                                    )}

                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                                      <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentStep(2)}
                              className="flex items-center gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Modifier les photos
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-red-50 rounded-lg border-2 border-red-200">
                            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                            <h4 className="text-lg font-semibold text-red-800 mb-2">Aucune image trouvée</h4>
                            <p className="text-red-600 mb-4">Vous devez ajouter au moins une photo pour continuer</p>
                            <Button
                              type="button"
                              onClick={() => setCurrentStep(2)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <Camera className="h-4 w-4 mr-2" />
                              Ajouter des photos
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Informations de l'annonce */}
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div>
                            <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">Titre</label>
                            <h2 className="text-2xl font-bold text-slate-900 mt-1">{watchedValues.title}</h2>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">Prix</label>
                            <p className="text-3xl font-bold text-blue-600 mt-1">
                              {watchedValues.price ? parseInt(watchedValues.price).toLocaleString() : '0'} FCFA
                            </p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">Localisation</label>
                            <p className="text-lg text-slate-900 flex items-center gap-2 mt-1">
                              <MapPin className="h-5 w-5 text-slate-500" />
                              {watchedValues.region}
                            </p>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">Catégorie</label>
                            <p className="text-lg text-slate-900 flex items-center gap-2 mt-1">
                              <Tag className="h-5 w-5 text-slate-500" />
                              {categories.find(c => c.id === watchedValues.category_id)?.name || 'Non sélectionnée'}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">Description</label>
                          <div className="mt-1 bg-slate-50 rounded-lg p-4 border">
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                              {watchedValues.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 🆕 INFO PUBLICATION SELON ÉLIGIBILITÉ */}
                      {canCreateFree ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                          <div className="flex items-start gap-3">
                            <Gift className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-green-800 font-semibold">
                                {isInLaunchPhase ? "🎉 Publication GRATUITE !" : "✅ Annonce gratuite disponible"}
                              </h4>
                              <p className="text-green-700 text-sm mt-1">
                                {statusMessage}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                          <div className="flex items-start gap-3">
                            <CreditCard className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-yellow-800 font-semibold">💳 Paiement requis</h4>
                              <p className="text-yellow-700 text-sm mt-1">
                                {statusMessage}
                              </p>
                              <p className="text-yellow-800 font-medium text-sm mt-2">
                                Coût: 200 FCFA pour publier cette annonce
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* 🆕 Étape 4: Confirmation adaptée */}
              {currentStep === 4 && createdListing && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className={`shadow-xl border-0 ${
                    createdListing.status === 'published_free' 
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50'
                      : 'bg-gradient-to-br from-blue-50 to-indigo-50'
                  }`}>
                    <CardHeader className="text-center">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                        createdListing.status === 'published_free'
                          ? 'bg-green-100'
                          : 'bg-blue-100'
                      }`}>
                        {createdListing.status === 'published_free' ? (
                          <CheckCircle className="h-10 w-10 text-green-600" />
                        ) : (
                          <Clock className="h-10 w-10 text-blue-600" />
                        )}
                      </div>
                      
                      <CardTitle className={`text-3xl ${
                        createdListing.status === 'published_free'
                          ? 'text-green-800'
                          : 'text-blue-800'
                      }`}>
                        {createdListing.status === 'published_free' ? (
                          <>🎉 Annonce publiée GRATUITEMENT !</>
                        ) : (
                          <>📝 Annonce sauvegardée</>
                        )}
                      </CardTitle>
                      
                      <p className={`text-lg ${
                        createdListing.status === 'published_free'
                          ? 'text-green-600'
                          : 'text-blue-600'
                      }`}>
                        {createdListing.info}
                      </p>
                    </CardHeader>

                    <CardContent className="text-center space-y-6">
                      
                      {/* Détails selon le statut */}
                      {createdListing.status === 'published_free' ? (
                        <div className="bg-white rounded-lg p-6 border shadow-sm">
                          <h3 className="font-semibold text-slate-900 mb-4">
                            {isInLaunchPhase ? "🎁 Phase de lancement spéciale" : "✅ Publication gratuite"}
                          </h3>
                          <div className="space-y-3 text-left">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-medium text-sm">✓</div>
                              <p className="text-slate-700">Votre annonce est <strong>immédiatement visible</strong></p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-medium text-sm">✓</div>
                              <p className="text-slate-700">
                                {isInLaunchPhase ? (
                                  <><strong>Aucun frais</strong> pendant la période de lancement</>
                                ) : (
                                  <>Votre quota d'annonces gratuites a été utilisé</>
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-medium text-sm">✓</div>
                              <p className="text-slate-700">
                                {isInLaunchPhase ? (
                                  <>Profitez-en pour publier <strong>autant d'annonces que vous voulez</strong></>
                                ) : (
                                  <>Prochaine réinitialisation dans quelques jours</>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg p-6 border shadow-sm">
                          <h3 className="font-semibold text-slate-900 mb-4">💳 Paiement requis pour publication</h3>
                          <div className="space-y-4">
                            <div className="bg-blue-50 rounded-lg p-4">
                              <p className="text-blue-800 font-medium">
                                Montant: {createdListing.payment_required?.amount || 200} {createdListing.payment_required?.currency || 'FCFA'}
                              </p>
                              <p className="text-blue-600 text-sm mt-1">
                                Votre annonce sera publiée immédiatement après le paiement
                              </p>
                            </div>
                            
                            {createdListing.payment_required?.payment_url && (
                              <Button
                                onClick={() => window.open(createdListing.payment_required?.payment_url, '_blank')}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <CreditCard className="h-4 w-4 mr-2" />
                                Payer maintenant
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-4 pt-4">
                        <Button
                          type="button"
                          onClick={() => {
                            // Reset pour créer une nouvelle annonce
                            setCurrentStep(1);
                            setUploadedImages([]);
                            setCreatedListing(null);
                            // Refetch l'éligibilité
                            refetchBoth();
                          }}
                          className={`flex-1 text-white ${
                            createdListing.status === 'published_free'
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Créer une autre annonce
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => router.push('/listings')}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir toutes les annonces
                        </Button>
                      </div>

                    </CardContent>
                  </Card>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Navigation */}
            {currentStep < 4 && (
              <motion.div 
                className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                
                {/* Bouton Précédent */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>

                {/* Bouton Suivant/Publier */}
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={
                      (currentStep === 1 && (!watchedValues.title || !watchedValues.description || !watchedValues.price || !watchedValues.category_id || !watchedValues.region)) ||
                      (currentStep === 2 && uploadedImages.length === 0)
                    }
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Suivant
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : currentStep === 3 ? (
                  <Button
                    type="submit"
                    disabled={isLoading || uploadedImages.length === 0}
                    className={`flex items-center gap-2 text-white ${
                      canCreateFree 
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-yellow-600 hover:bg-yellow-700'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Création en cours...
                      </>
                    ) : canCreateFree ? (
                      <>
                        🎉 Publier GRATUITEMENT
                        <Gift className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        💳 Créer annonce (paiement requis)
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                ) : null}

              </motion.div>
            )}

          </form>

        </div>
      </main>

      <Footer />
    </>
  );
}