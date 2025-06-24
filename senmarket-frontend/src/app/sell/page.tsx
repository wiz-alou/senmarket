'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Settings
} from 'lucide-react';

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

interface UploadedImage {
  url: string;
  filename: string;
  size: number;
  width: number;
  height: number;
}

interface PaymentRequest {
  payment_method: 'orange_money' | 'wave' | 'free_money';
  phone: string;
}

interface PaymentResponse {
  payment: {
    id: string;
    amount: number;
    status: string;
    transaction_id: string;
  };
  payment_url: string;
}

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

// Étapes du processus
const steps = [
  { id: 1, title: 'Informations', icon: FileText },
  { id: 2, title: 'Images', icon: Camera },
  { id: 3, title: 'Aperçu', icon: Eye },
  { id: 4, title: 'Paiement', icon: CreditCard },
  { id: 5, title: 'Confirmation', icon: CheckCircle },
];

export default function SellPage() {
  const router = useRouter();
  
  // États du formulaire
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdListing, setCreatedListing] = useState<any>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'orange_money' | 'wave' | 'free_money'>('orange_money');
  const [userPhone, setUserPhone] = useState<string>('');

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
    setUserPhone(user.phone || '');
    setValue('region', user.region || 'Dakar');

    // Charger les catégories
    fetchCategories();
  }, [router, setValue]);

  // Fonctions utilitaires
  const showError = useCallback((title: string, message: string) => {
    setError(`${title}: ${message}`);
    setTimeout(() => setError(null), 6000);
  }, []);

  const showSuccess = useCallback((title: string, message: string) => {
    setSuccess(`${title}: ${message}`);
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

  // ✅ FIX PRINCIPAL - Upload d'images avec gestion correcte des URLs
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

      // Validation fichiers
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

      // FormData
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('images', file);
      });

      console.log('📡 Envoi vers API...');

      // Appel API
      const response = await fetch('http://localhost:8080/api/v1/images/upload-multiple', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('📡 Statut réponse:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Réponse API complète:', data);

      // ✅ EXTRACTION CORRECTE DES URLS
      let uploadedUrls: string[] = [];

      if (data.data && Array.isArray(data.data)) {
        // Cas réponse multiple
        uploadedUrls = data.data.map((img: any) => {
          console.log('🔍 Traitement image:', img);
          
          // Format string direct
          if (typeof img === 'string') {
            const url = img.startsWith('http') ? img : `http://localhost:8080${img}`;
            console.log('📎 String URL:', img, '→', url);
            return url;
          }
          
          // Format objet avec propriété 'url'
          if (img.url) {
            const url = img.url.startsWith('http') ? img.url : `http://localhost:8080${img.url}`;
            console.log('📎 Object.url:', img.url, '→', url);
            return url;
          }
          
          // Format objet avec propriété 'URL' (majuscule)
          if (img.URL) {
            const url = img.URL.startsWith('http') ? img.URL : `http://localhost:8080${img.URL}`;
            console.log('📎 Object.URL:', img.URL, '→', url);
            return url;
          }
          
          // Format avec filename
          if (img.filename) {
            const url = `http://localhost:8080/uploads/${img.filename}`;
            console.log('📎 Filename:', img.filename, '→', url);
            return url;
          }
          
          console.warn('❌ Format image non reconnu:', img);
          return null;
        }).filter((url: string | null) => url !== null);
        
      } else if (data.data && (data.data.url || data.data.URL)) {
        // Cas réponse single
        const url = data.data.url || data.data.URL;
        const fullUrl = url.startsWith('http') ? url : `http://localhost:8080${url}`;
        uploadedUrls = [fullUrl];
        
      } else if (data.url) {
        // Format direct dans data
        const url = data.url.startsWith('http') ? data.url : `http://localhost:8080${data.url}`;
        uploadedUrls = [url];
      }

      console.log('✅ URLs finales extraites:', uploadedUrls);

      if (uploadedUrls.length === 0) {
        throw new Error('Impossible d\'extraire les URLs des images de la réponse API');
      }

      // ✅ MISE À JOUR STATE AVEC URLS VALIDES
      setUploadedImages(prev => {
        const newImages = [...prev, ...uploadedUrls];
        console.log('💾 State mis à jour:');
        console.log('  - Avant:', prev);
        console.log('  - Ajout:', uploadedUrls);
        console.log('  - Après:', newImages);
        return newImages;
      });

      showSuccess('Images uploadées', `${uploadedUrls.length} image(s) ajoutée(s) avec succès`);

    } catch (error) {
      console.error('❌ Erreur upload complet:', error);
      showError('Erreur upload', error instanceof Error ? error.message : 'Échec de l\'upload');
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
    setUploadedImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      console.log('🗑️ Image supprimée:', index, 'Reste:', newImages.length);
      return newImages;
    });
  }, []);

  // Navigation
  const handleNext = useCallback(() => {
    if (currentStep < steps.length) {
      console.log('➡️ Passage à l\'étape', currentStep + 1);
      if (currentStep === 2) {
        console.log('📊 Images disponibles pour aperçu:', uploadedImages.length, uploadedImages);
      }
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, uploadedImages]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  }, [currentStep]);

  // Création de l'annonce
  const handleFormSubmit = useCallback(async (data: ListingFormData) => {
    console.log('📝 Soumission formulaire:', data);
    console.log('📷 Images à inclure:', uploadedImages);

    if (uploadedImages.length === 0) {
      showError('Images requises', 'Vous devez ajouter au moins une image');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('senmarket_token');
      
      // ✅ FIX: Conversion correcte des données pour l'API
      const listingData = {
        title: data.title.trim(),
        description: data.description.trim(),
        price: parseFloat(data.price), // Conversion en nombre
        currency: 'XOF', // Devise par défaut
        category_id: data.category_id,
        region: data.region,
        images: uploadedImages, // Array d'URLs
        status: 'draft' // Statut initial
      };

      console.log('📡 Données finales envoyées:', listingData);

      // Validation côté client avant envoi
      if (!listingData.title || listingData.title.length < 10) {
        throw new Error('Le titre doit contenir au moins 10 caractères');
      }
      
      if (!listingData.description || listingData.description.length < 20) {
        throw new Error('La description doit contenir au moins 20 caractères');
      }
      
      if (!listingData.price || listingData.price < 100) {
        throw new Error('Le prix doit être d\'au moins 100 FCFA');
      }
      
      if (!listingData.category_id) {
        throw new Error('Veuillez sélectionner une catégorie');
      }
      
      if (!listingData.region) {
        throw new Error('Veuillez sélectionner une région');
      }

      if (!listingData.images || listingData.images.length === 0) {
        throw new Error('Au moins une image est requise');
      }

      const response = await fetch('http://localhost:8080/api/v1/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(listingData),
      });

      console.log('📡 Statut réponse:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erreur API détaillée:', errorData);
        
        // Messages d'erreur plus détaillés
        if (response.status === 400) {
          const errorMessage = errorData.details || errorData.error || 'Données invalides';
          throw new Error(`Validation échouée: ${errorMessage}`);
        } else if (response.status === 401) {
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        } else if (response.status === 403) {
          throw new Error('Accès refusé. Vérifiez vos permissions.');
        } else {
          throw new Error(errorData.error || `Erreur serveur (${response.status})`);
        }
      }

      const result = await response.json();
      console.log('✅ Annonce créée avec succès:', result);
      
      setCreatedListing(result.data);
      setCurrentStep(4); // Passer au paiement
      showSuccess('Annonce créée', 'Passez maintenant au paiement pour publier');

    } catch (error) {
      console.error('❌ Erreur création complète:', error);
      
      // Gestion d'erreur plus précise
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          showError('Erreur réseau', 'Vérifiez votre connexion internet');
        } else {
          showError('Erreur création', error.message);
        }
      } else {
        showError('Erreur création', 'Une erreur inattendue s\'est produite');
      }
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImages, showError, showSuccess]);

  // Paiement
  const handlePayment = useCallback(async () => {
    if (!createdListing) {
      showError('Erreur', 'Aucune annonce à payer');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('senmarket_token');
      
      const paymentData: PaymentRequest = {
        payment_method: paymentMethod,
        phone: userPhone
      };

      const response = await fetch(`http://localhost:8080/api/v1/listings/${createdListing.id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur initiation paiement');
      }

      const result = await response.json();
      console.log('✅ Paiement initié:', result);
      
      setPaymentUrl(result.payment_url);
      setCurrentStep(5);
      showSuccess('Paiement initié', 'Suivez les instructions pour finaliser');

    } catch (error) {
      console.error('❌ Erreur paiement:', error);
      showError('Erreur paiement', error instanceof Error ? error.message : 'Échec paiement');
    } finally {
      setIsLoading(false);
    }
  }, [createdListing, paymentMethod, userPhone, showError, showSuccess]);

  // Debug helper
  const debugImages = useCallback(() => {
    console.log('🔍 === DEBUG IMAGES STATE ===');
    console.log('- Nombre total:', uploadedImages.length);
    console.log('- Array complet:', uploadedImages);
    console.log('- Type du premier:', typeof uploadedImages[0]);
    
    uploadedImages.forEach((url, index) => {
      console.log(`- Image ${index + 1}: ${url}`);
      
      // Test de l'URL
      fetch(url, { method: 'HEAD' })
        .then(response => {
          console.log(`  ✅ Image ${index + 1} accessible: ${response.ok} (${response.status})`);
        })
        .catch(error => {
          console.error(`  ❌ Image ${index + 1} inaccessible:`, error.message);
        });
    });
    console.log('=========================');
  }, [uploadedImages]);

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
                            {categories.map((category) => {
                              const IconComponent = categoryIcons[category.icon] || Tag;
                              return (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              );
                            })}
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

              {/* Étape 2: Images */}
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
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-slate-900">
                              Images ajoutées ({uploadedImages.length}/5)
                            </h4>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={debugImages}
                            >
                              🔧 Debug Images
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {uploadedImages.map((imageUrl, index) => {
                              console.log(`🖼️ Rendu image ${index + 1}:`, imageUrl);
                              
                              return (
                                <div key={index} className="relative group">
                                  <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 border-2 border-slate-200">
                                    <img
                                      src={imageUrl}
                                      alt={`Image ${index + 1}`}
                                      className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                                      onLoad={() => console.log(`✅ Image ${index + 1} chargée avec succès`)}
                                      onError={(e) => {
                                        console.error(`❌ Erreur chargement image ${index + 1}:`, imageUrl);
                                        console.error('Event error:', e);
                                      }}
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
                                  
                                  {/* URL debug (visible en dev) */}
                                  <div className="mt-1 text-xs text-slate-500 font-mono truncate" title={imageUrl}>
                                    {imageUrl.split('/').pop()}
                                  </div>
                                </div>
                              );
                            })}
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

              {/* ✅ Étape 3: Aperçu COMPLÈTEMENT RÉÉCRITE */}
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
                      <p className="text-slate-600">Vérifiez tous les détails avant de continuer</p>
                    </CardHeader>

                    <CardContent className="space-y-8">
                      
                      {/* ✅ SECTION IMAGES AMÉLIORÉE */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-slate-900">
                            Photos ({uploadedImages.length})
                          </h3>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={debugImages}
                          >
                            🔧 Debug
                          </Button>
                        </div>
                        
                        {uploadedImages.length > 0 ? (
                          <div className="space-y-4">
                            {/* Galerie principale */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {uploadedImages.map((imageUrl, index) => {
                                console.log(`🖼️ Aperçu image ${index + 1}:`, imageUrl);
                                
                                return (
                                  <div key={index} className="relative group">
                                    <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-sm">
                                      <img
                                        src={imageUrl}
                                        alt={`Aperçu ${index + 1}`}
                                        className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                                        onLoad={() => {
                                          console.log(`✅ Aperçu image ${index + 1} chargée avec succès`);
                                        }}
                                        onError={(e) => {
                                          console.error(`❌ Erreur aperçu image ${index + 1}:`, imageUrl);
                                          console.error('Error event:', e);
                                          // Fallback: afficher une div avec l'erreur
                                          e.currentTarget.style.display = 'none';
                                        }}
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

                                      {/* Overlay hover */}
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                                        <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </div>
                                    </div>
                                    
                                    {/* URL pour debug */}
                                    <div className="mt-1 text-xs text-slate-400 font-mono truncate" title={imageUrl}>
                                      {imageUrl.substring(imageUrl.lastIndexOf('/') + 1)}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            
                            {/* Actions sur les images */}
                            <div className="flex gap-2 flex-wrap">
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
                              
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  uploadedImages.forEach((url, i) => {
                                    window.open(url, `_blank_image_${i}`);
                                  });
                                }}
                                className="flex items-center gap-2"
                              >
                                <ExternalLink className="h-4 w-4" />
                                Ouvrir toutes
                              </Button>
                            </div>
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

                      {/* Avertissement si pas d'images */}
                      {uploadedImages.length === 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                          <div className="flex items-center gap-3">
                            <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                            <div>
                              <h4 className="text-red-800 font-semibold">Photos manquantes</h4>
                              <p className="text-red-700 text-sm mt-1">
                                Votre annonce doit avoir au moins une photo pour être publiée. 
                                Retournez à l'étape précédente pour ajouter des images.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Info publication */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-start gap-3">
                          <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-blue-800 font-semibold">Prêt pour la publication</h4>
                            <p className="text-blue-700 text-sm mt-1">
                              Après validation, votre annonce sera publiée moyennant 200 FCFA. 
                              Elle restera active pendant 30 jours.
                            </p>
                          </div>
                        </div>
                      </div>

                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Étape 4: Paiement */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="shadow-xl border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <CreditCard className="h-8 w-8 text-blue-600" />
                        Paiement de publication
                      </CardTitle>
                      <p className="text-slate-600">Payez 200 FCFA pour publier votre annonce</p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      
                      {/* Résumé commande */}
                      <div className="bg-slate-50 rounded-lg p-6 border">
                        <h3 className="font-semibold text-slate-900 mb-4">Résumé de votre commande</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Publication d'annonce</span>
                            <span className="font-medium">200 FCFA</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Durée de publication</span>
                            <span className="font-medium">30 jours</span>
                          </div>
                          <div className="border-t pt-3 flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span className="text-blue-600">200 FCFA</span>
                          </div>
                        </div>
                      </div>

                      {/* Méthodes de paiement */}
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-4">Choisir votre méthode de paiement</h3>
                        <div className="grid gap-4">
                          
                          {/* Orange Money */}
                          <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            paymentMethod === 'orange_money' 
                              ? 'border-orange-500 bg-orange-50' 
                              : 'border-slate-200 hover:border-orange-300'
                          }`}>
                            <input
                              type="radio"
                              name="payment_method"
                              value="orange_money"
                              checked={paymentMethod === 'orange_money'}
                              onChange={(e) => setPaymentMethod(e.target.value as any)}
                              className="text-orange-600"
                            />
                            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                              <Smartphone className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900">Orange Money</h4>
                              <p className="text-sm text-slate-600">Paiement via votre compte Orange Money</p>
                            </div>
                            <Badge className="bg-orange-100 text-orange-800">Recommandé</Badge>
                          </label>

                          {/* Wave */}
                          <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            paymentMethod === 'wave' 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-slate-200 hover:border-blue-300'
                          }`}>
                            <input
                              type="radio"
                              name="payment_method"
                              value="wave"
                              checked={paymentMethod === 'wave'}
                              onChange={(e) => setPaymentMethod(e.target.value as any)}
                              className="text-blue-600"
                            />
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                              <Zap className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900">Wave</h4>
                              <p className="text-sm text-slate-600">Paiement via votre portefeuille Wave</p>
                            </div>
                          </label>

                          {/* Free Money */}
                          <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            paymentMethod === 'free_money' 
                              ? 'border-purple-500 bg-purple-50' 
                              : 'border-slate-200 hover:border-purple-300'
                          }`}>
                            <input
                              type="radio"
                              name="payment_method"
                              value="free_money"
                              checked={paymentMethod === 'free_money'}
                              onChange={(e) => setPaymentMethod(e.target.value as any)}
                              className="text-purple-600"
                            />
                            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                              <DollarSign className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900">Free Money</h4>
                              <p className="text-sm text-slate-600">Paiement via Free Money</p>
                            </div>
                          </label>

                        </div>
                      </div>

                      {/* Numéro de téléphone */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Numéro de téléphone
                        </label>
                        <Input
                          type="tel"
                          value={userPhone}
                          onChange={(e) => setUserPhone(e.target.value)}
                          placeholder="+221 XX XXX XX XX"
                          className="text-lg"
                        />
                        <p className="text-sm text-slate-500 mt-1">
                          Le numéro associé à votre compte {paymentMethod === 'orange_money' ? 'Orange Money' : paymentMethod === 'wave' ? 'Wave' : 'Free Money'}
                        </p>
                      </div>

                      {/* Info sécurité */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="text-green-800 font-medium text-sm">Paiement sécurisé</p>
                            <p className="text-green-700 text-sm mt-1">
                              Vos informations de paiement sont protégées. Vous recevrez un SMS de confirmation.
                            </p>
                          </div>
                        </div>
                      </div>

                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Étape 5: Confirmation */}
              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-blue-50">
                    <CardHeader className="text-center">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                      </div>
                      <CardTitle className="text-3xl text-green-800">Paiement initié avec succès !</CardTitle>
                      <p className="text-green-600 text-lg">Votre annonce sera publiée dès réception du paiement</p>
                    </CardHeader>

                    <CardContent className="text-center space-y-6">
                      
                      {/* Instructions */}
                      <div className="bg-white rounded-lg p-6 border shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4">Étapes suivantes</h3>
                        <div className="space-y-3 text-left">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">1</div>
                            <p className="text-slate-700">Suivez les instructions de paiement {paymentMethod === 'orange_money' ? 'Orange Money' : paymentMethod === 'wave' ? 'Wave' : 'Free Money'}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">2</div>
                            <p className="text-slate-700">Confirmez le paiement de 200 FCFA</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">3</div>
                            <p className="text-slate-700">Votre annonce sera automatiquement publiée</p>
                          </div>
                        </div>
                      </div>

                      {/* Lien de paiement */}
                      {paymentUrl && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <ExternalLink className="h-5 w-5 text-yellow-600" />
                            <h4 className="font-semibold text-yellow-800">Lien de paiement généré</h4>
                          </div>
                          <p className="text-yellow-700 text-sm mb-4">
                            Un lien de paiement s'ouvrira automatiquement. 
                            Si elle ne s'affiche pas, cliquez sur le bouton ci-dessous.
                          </p>
                          <Button
                            type="button"
                            onClick={() => window.open(paymentUrl, '_blank')}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Ouvrir le paiement
                          </Button>
                        </div>
                      )}

                      {/* Actions alternatives */}
                      <div className="flex gap-4 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => router.push('/dashboard')}
                          className="flex-1"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Aller au Dashboard
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => router.push('/listings')}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir les annonces
                        </Button>
                      </div>

                    </CardContent>
                  </Card>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Navigation entre étapes */}
            {currentStep < 5 && (
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

                {/* Bouton Suivant/Soumettre */}
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={
                      (currentStep === 1 && (!watchedValues.title || !watchedValues.description || !watchedValues.price || !watchedValues.category_id || !watchedValues.region)) ||
                      (currentStep === 2 && uploadedImages.length === 0) // ✅ Vérification stricte
                    }
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Suivant
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : currentStep === 3 ? (
                  <Button
                    type="submit"
                    disabled={isLoading || uploadedImages.length === 0} // ✅ Blocage si pas d'images
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Création en cours...
                      </>
                    ) : (
                      <>
                        Créer l'annonce
                        <Check className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                ) : currentStep === 4 ? (
                  <Button
                    type="button"
                    onClick={handlePayment}
                    disabled={isLoading || !userPhone}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      <>
                        Procéder au paiement
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