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
  Upload, X, Eye, Camera, Check, ChevronRight, ChevronLeft,
  AlertCircle, CheckCircle, Loader2, CreditCard, Smartphone,
  MapPin, Tag, FileText, DollarSign, Zap, Star, Shield, Clock,
  ArrowRight, Image as ImageIcon, Plus, Trash2, Edit, Save,
  RefreshCw, Phone, ExternalLink, Home, Car, Laptop, Shirt,
  Briefcase, Wrench, Sofa, Heart, Settings, Gift, Info,
  TrendingUp, AlertTriangle, Sparkles, Crown, Trophy, Flame,
  Timer, Calendar, Users, Target, Rocket, Diamond, FastForward
} from 'lucide-react';

// ✅ IMPORTS HOOKS
import { useCreateListingEligibility, useInvalidateQuotaCache } from '@/hooks/useQuota';
import { 
  listingsService,
  type CreateListingRequest, 
  type CreateListingResponse 
} from '@/lib/api';
import { useCategories } from '@/hooks/api/useCategories';
import { useAuth } from '@/hooks/useAuth';

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

// 🆕 COMPOSANT HERO MARKETING AMÉLIORÉ
const MarketingHero = ({ 
  canCreateFree, 
  isInLaunchPhase, 
  statusMessage, 
  urgencyMessage,
  isLoading 
}) => {
  const [showFuturePhases, setShowFuturePhases] = useState(false);

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

  if (isInLaunchPhase) {
    return (
      <motion.div 
        className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-2xl p-8 mb-8 overflow-hidden shadow-xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Particles animées */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-10, -60],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random(),
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center text-white">
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <Gift className="h-6 w-6 text-yellow-300" />
            <span className="text-lg font-bold">PHASE DE LANCEMENT</span>
            <Gift className="h-6 w-6 text-yellow-300" />
          </motion.div>

          <motion.h2 
            className="text-3xl md:text-4xl font-black mb-3 text-white"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            🎉 100% GRATUIT
          </motion.h2>

          <p className="text-lg mb-4 opacity-90">
            Publiez autant d'annonces que vous voulez !
          </p>

          {urgencyMessage && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-orange-500/20 backdrop-blur-sm border border-orange-300/30 rounded-xl p-3 mb-4"
            >
              <div className="flex items-center justify-center gap-2">
                <Timer className="h-4 w-4 text-orange-200 animate-pulse" />
                <span className="text-orange-100 font-medium text-sm">{urgencyMessage}</span>
              </div>
            </motion.div>
          )}

          {/* Bouton Aperçu Futur */}
          <motion.button
            onClick={() => setShowFuturePhases(!showFuturePhases)}
            className="bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 mb-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FastForward className="h-4 w-4 inline mr-2" />
            {showFuturePhases ? 'Masquer' : 'Voir'} les prochaines phases
          </motion.button>

          {/* Aperçu des phases futures */}
          <AnimatePresence>
            {showFuturePhases && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mt-4 text-left"
              >
                <h4 className="font-bold text-center mb-3 text-yellow-200">
                  📅 Aperçu du système complet
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <div>
                      <span className="font-medium text-green-200">Phase 1 - Lancement (Actuelle)</span>
                      <p className="text-white/70">Annonces illimitées et gratuites</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div>
                      <span className="font-medium text-blue-200">Phase 2 - Crédits</span>
                      <p className="text-white/70">3 annonces gratuites/mois + payant</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <div>
                      <span className="font-medium text-yellow-200">Phase 3 - Premium</span>
                      <p className="text-white/70">200 FCFA par annonce + options</p>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-3 text-xs text-white/60">
                  💡 Transition automatique selon l'adoption de la plateforme
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }

  // Phase Crédits - Design compact
  return (
    <motion.div 
      className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 mb-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl">
            <CreditCard className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              ✅ Publication gratuite disponible
            </h3>
            <p className="text-slate-700">{statusMessage}</p>
          </div>
        </div>
        <Badge className="bg-blue-100 text-blue-800">Phase Crédits</Badge>
      </div>
    </motion.div>
  );
};

// Composant principal
export default function SellPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  
  // Transformation des catégories
  const categories = React.useMemo(() => {
    if (!categoriesData) return [];
    if (Array.isArray(categoriesData)) return categoriesData;
    if (categoriesData.data && Array.isArray(categoriesData.data)) return categoriesData.data;
    return [];
  }, [categoriesData]);
  
  // Hooks quotas
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
  
  // États
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdListing, setCreatedListing] = useState<CreateListingResponse | null>(null);

  // Form
  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<ListingFormData>({
    defaultValues: {
      title: '', description: '', price: '', category_id: '', region: 'Dakar'
    }
  });

  const watchedValues = watch();

  // Régions et étapes
  const regions = [
    'Dakar', 'Thiès', 'Diourbel', 'Fatick', 'Kaolack', 'Kolda',
    'Louga', 'Matam', 'Saint-Louis', 'Sédhiou', 'Tambacounda',
    'Kaffrine', 'Kédougou', 'Ziguinchor', 'Gossas', 'Koungheul'
  ];

  const steps = [
    { id: 1, title: 'Informations', icon: FileText, color: 'blue' },
    { id: 2, title: 'Images', icon: Camera, color: 'purple' },
    { id: 3, title: 'Aperçu', icon: Eye, color: 'green' },
    { id: 4, title: 'Confirmation', icon: CheckCircle, color: 'emerald' },
  ];

  // Auth check
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Vous devez être connecté pour publier une annonce');
      router.push('/auth/login?redirect=/sell');
      return;
    }
    if (user?.region) setValue('region', user.region);
  }, [isAuthenticated, user, router, setValue]);

  // Utilitaires
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

  // Upload images
  const handleImageUpload = useCallback(async (files: File[]) => {
    if (uploadedImages.length + files.length > 5) {
      showError('Limite dépassée', 'Maximum 5 images');
      return;
    }
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const validFiles = files.filter(file => {
        const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
        const isValidSize = file.size <= 5 * 1024 * 1024;
        if (!isValidType) showError('Format invalide', `${file.name} - Formats: JPG, PNG, WebP`);
        if (!isValidSize) showError('Fichier trop lourd', `${file.name} - Max: 5MB`);
        return isValidType && isValidSize;
      });

      if (validFiles.length === 0) return;

      const { imagesService } = await import('@/lib/api');
      for (const file of validFiles) {
        try {
          const result = await imagesService.uploadImage(file);
          const imageUrl = result.url.startsWith('http') ? result.url : `http://localhost:8080${result.url}`;
          setUploadedImages(prev => [...prev, imageUrl]);
        } catch (error) {
          showError('Erreur upload', `Échec upload ${file.name}`);
        }
      }
      showSuccess('Images uploadées', `${validFiles.length} image(s) ajoutée(s)`);
    } catch (error) {
      showError('Erreur upload', error instanceof Error ? error.message : 'Échec upload');
    } finally {
      setIsUploading(false);
    }
  }, [uploadedImages.length, showError, showSuccess]);

  // Drag & Drop
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
    if (currentStep < steps.length) setCurrentStep(prev => prev + 1);
  }, [currentStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  }, [currentStep]);

  // Soumission
  const handleFormSubmit = useCallback(async (data: ListingFormData) => {
    if (uploadedImages.length === 0) {
      showError('Images requises', 'Vous devez ajouter au moins une image');
      return;
    }
    if (!user) {
      showError('Session expirée', 'Veuillez vous reconnecter');
      router.push('/auth/login');
      return;
    }

    setIsLoading(true);
    try {
      const listingData: CreateListingRequest = {
        title: data.title.trim(),
        description: data.description.trim(),
        price: parseFloat(data.price),
        category_id: data.category_id,
        region: data.region,
        images: uploadedImages,
        phone: user.phone,
      };

      const result = await listingsService.createListing(listingData);
      setCreatedListing(result);
      invalidateQuotaCache();
      refetchBoth();
      
      const statusInfo = listingsService.formatCreationStatusMessage(result);
      
      if (result.status === 'published_free') {
        showSuccess(statusInfo.title, statusInfo.message);
      } else {
        toast.info(statusInfo.title, {
          description: statusInfo.message,
          action: statusInfo.action ? {
            label: statusInfo.action,
            onClick: () => {
              if (result.payment_required?.payment_url) {
                window.open(result.payment_required.payment_url, '_blank');
              }
            }
          } : undefined
        });
      }
      setCurrentStep(4);
    } catch (error: any) {
      if (error.message?.includes('Quota épuisé')) {
        showError('Quota épuisé', 'Vous avez utilisé toutes vos annonces gratuites ce mois');
      } else if (error.response?.status === 403) {
        showError('Quota épuisé', 'Vous devez payer pour publier cette annonce');
      } else {
        showError('Erreur création', error.message || 'Une erreur est survenue');
      }
      refetchBoth();
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImages, showError, showSuccess, router, invalidateQuotaCache, refetchBoth, user]);

  // Loading
  if (!isAuthenticated || categoriesLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">
              {categoriesLoading ? 'Chargement des catégories...' : 'Chargement...'}
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
        <div className="container mx-auto px-6">
          
          {/* Titre Principal - Plus Compact */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Publier une annonce
            </h1>
            <p className="text-lg text-slate-600">
              Marketplace #1 du Sénégal
            </p> */}
          </motion.div>

          {/* Bannière Dynamique Existante */}
          <DynamicLaunchBanner />

          {/* Hero Marketing Amélioré */}
          <MarketingHero
            canCreateFree={canCreateFree}
            isInLaunchPhase={isInLaunchPhase}
            statusMessage={statusMessage}
            urgencyMessage={urgencyMessage}
            isLoading={isLoadingEligibility}
          />

          {/* Alertes */}
          {error && (
            <motion.div className="max-w-4xl mx-auto mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {success && (
            <motion.div className="max-w-4xl mx-auto mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Alert className="border-green-200 bg-green-50">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Progress Steps - Plus Compact */}
          <motion.div className="mb-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-center">
              <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                      currentStep >= step.id 
                        ? `bg-${step.color}-600 text-white shadow-lg` 
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      <step.icon className="h-4 w-4" />
                    </div>
                    <div className="ml-2 hidden md:block">
                      <p className={`text-sm font-medium ${
                        currentStep >= step.id ? `text-${step.color}-600` : 'text-slate-400'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-6 h-0.5 mx-3 ${
                        currentStep > step.id ? `bg-${step.color}-600` : 'bg-slate-200'
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
                  <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <FileText className="h-6 w-6 text-blue-600" />
                        Informations de l'annonce
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      
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
                          rows={3}
                          className="resize-none"
                        />
                        {errors.description && (
                          <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                        )}
                      </div>

                      {/* Prix et Catégorie */}
                      <div className="grid md:grid-cols-2 gap-4">
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
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Choisir une catégorie</option>
                            {Array.isArray(categories) && categories.length > 0 ? (
                              categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))
                            ) : (
                              <option disabled>Chargement...</option>
                            )}
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
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

              {/* Étape 2: Images - Version Compacte */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <Camera className="h-6 w-6 text-purple-600" />
                        Photos de votre article
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      
                      {/* Zone d'upload compacte */}
                      <div
                        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                          dragActive 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-slate-300 hover:border-purple-400 hover:bg-purple-50/30'
                        } ${uploadedImages.length >= 5 ? 'opacity-50 pointer-events-none' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        {isUploading ? (
                          <div className="space-y-3">
                            <Loader2 className="h-12 w-12 text-purple-600 mx-auto animate-spin" />
                            <p className="text-purple-600 font-medium">Upload en cours...</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <Upload className="h-12 w-12 text-slate-400 mx-auto" />
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                                Glissez vos images ici
                              </h3>
                              <p className="text-slate-600 text-sm mb-3">
                                ou cliquez pour parcourir
                              </p>
                            </div>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleFileInput}
                              className="hidden"
                              id="image-upload"
                            />
                            <Button type="button" size="sm" className="pointer-events-none bg-purple-600 hover:bg-purple-700">
                              <ImageIcon className="h-4 w-4 mr-2" />
                              Choisir des images
                            </Button>
                            <p className="text-xs text-slate-500">
                              JPG, PNG, WebP • Max: 5MB • Limite: 5 images
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Images uploadées */}
                      {uploadedImages.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-slate-900">
                            Images ajoutées ({uploadedImages.length}/5)
                          </h4>

                          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                            {uploadedImages.map((imageUrl, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 border-2 border-slate-200">
                                  <img
                                    src={imageUrl}
                                    alt={`Image ${index + 1}`}
                                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                                  />
                                  
                                  {/* Badge numéro */}
                                  <div className="absolute top-1 left-1 bg-black/70 text-white text-xs rounded-full px-2 py-1 font-medium">
                                    {index + 1}
                                  </div>
                                  
                                  {/* Badge principal */}
                                  {index === 0 && (
                                    <div className="absolute top-1 right-1 bg-purple-600 text-white text-xs rounded px-1 py-1 font-medium">
                                      ⭐
                                    </div>
                                  )}

                                  {/* Bouton supprimer */}
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute bottom-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
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
                  <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <Eye className="h-6 w-6 text-green-600" />
                        Aperçu de votre annonce
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      
                      {/* Section images compacte */}
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">
                          Photos ({uploadedImages.length})
                        </h3>
                        
                        {uploadedImages.length > 0 ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                              {uploadedImages.slice(0, 4).map((imageUrl, index) => (
                                <div key={index} className="aspect-square rounded-lg overflow-hidden shadow-sm border-2 border-slate-200">
                                  <img
                                    src={imageUrl}
                                    alt={`Aperçu ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                              {uploadedImages.length > 4 && (
                                <div className="aspect-square rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                                  +{uploadedImages.length - 4}
                                </div>
                              )}
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
                          <div className="text-center py-8 bg-red-50 rounded-lg border-2 border-red-200">
                            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                            <h4 className="text-lg font-semibold text-red-800 mb-2">Aucune photo</h4>
                            <p className="text-red-600 mb-3">Ajoutez des photos pour continuer</p>
                            <Button
                              type="button"
                              onClick={() => setCurrentStep(2)}
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <Camera className="h-4 w-4 mr-2" />
                              Ajouter des photos
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Informations de l'annonce */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Titre</label>
                            <h2 className="text-xl font-bold text-slate-900 mt-1">{watchedValues.title || 'Titre non défini'}</h2>
                          </div>
                          
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Prix</label>
                            <p className="text-2xl font-bold text-blue-600 mt-1">
                              {watchedValues.price ? parseInt(watchedValues.price).toLocaleString() : '0'} FCFA
                            </p>
                          </div>
                          
                          <div className="flex gap-4">
                            <div>
                              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Région</label>
                              <p className="text-slate-900 flex items-center gap-1 mt-1">
                                <MapPin className="h-4 w-4 text-slate-500" />
                                {watchedValues.region}
                              </p>
                            </div>
                            
                            <div>
                              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Catégorie</label>
                              <p className="text-slate-900 flex items-center gap-1 mt-1">
                                <Tag className="h-4 w-4 text-slate-500" />
                                {categories.find(c => c.id === watchedValues.category_id)?.name || 'Non définie'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Description</label>
                          <div className="mt-1 bg-slate-50 rounded-lg p-3 border max-h-32 overflow-y-auto">
                            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                              {watchedValues.description || 'Description non définie'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Status de publication */}
                      {canCreateFree ? (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <Gift className="h-5 w-5 text-green-600" />
                            <div>
                              <h4 className="text-green-800 font-semibold">
                                {isInLaunchPhase ? "🎉 Publication 100% GRATUITE !" : "✅ Publication gratuite disponible"}
                              </h4>
                              <p className="text-green-700 text-sm">{statusMessage}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-yellow-600" />
                            <div>
                              <h4 className="text-yellow-800 font-semibold">💳 Paiement requis</h4>
                              <p className="text-yellow-700 text-sm">{statusMessage}</p>
                              <p className="text-yellow-800 font-medium text-sm mt-1">
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

              {/* Étape 4: Confirmation */}
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
                    <CardContent className="text-center py-12">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
                        createdListing.status === 'published_free'
                          ? 'bg-green-100'
                          : 'bg-blue-100'
                      }`}>
                        {createdListing.status === 'published_free' ? (
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        ) : (
                          <Clock className="h-8 w-8 text-blue-600" />
                        )}
                      </div>
                      
                      <h2 className={`text-2xl font-bold mb-3 ${
                        createdListing.status === 'published_free'
                          ? 'text-green-800'
                          : 'text-blue-800'
                      }`}>
                        {createdListing.status === 'published_free' ? (
                          '🎉 Annonce publiée !'
                        ) : (
                          '📝 Annonce sauvegardée'
                        )}
                      </h2>
                      
                      <p className={`text-lg mb-6 ${
                        createdListing.status === 'published_free'
                          ? 'text-green-600'
                          : 'text-blue-600'
                      }`}>
                        {createdListing.info}
                      </p>

                      {/* Actions compactes */}
                      <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                        <Button
                          type="button"
                          onClick={() => {
                            setCurrentStep(1);
                            setUploadedImages([]);
                            setCreatedListing(null);
                            refetchBoth();
                          }}
                          className={`flex-1 text-white ${
                            createdListing.status === 'published_free'
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Nouvelle annonce
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => router.push('/dashboard')}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Mes annonces
                        </Button>
                      </div>

                    </CardContent>
                  </Card>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Navigation Compacte */}
            {currentStep < 4 && (
              <motion.div 
                className="flex justify-between items-center mt-8 pt-4 border-t border-slate-200"
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
                  size="sm"
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
                    size="sm"
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
                    size="sm"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Création...
                      </>
                    ) : canCreateFree ? (
                      <>
                        🎉 Publier GRATUIT
                        <Gift className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        💳 Publier (200 FCFA)
                        <CreditCard className="h-4 w-4" />
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