'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  ExternalLink
} from 'lucide-react';

// Types basés sur votre API
interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

interface CreateListingForm {
  title: string;
  description: string;
  price: string;
  category_id: string;
  region: string;
  images: string[];
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

export default function SellPage() {
  const router = useRouter();
  
  // États du formulaire
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<CreateListingForm>({
    title: '',
    description: '',
    price: '',
    category_id: '',
    region: '',
    images: []
  });

  // États UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [createdListingId, setCreatedListingId] = useState<string | null>(null);

  // États paiement
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'orange_money' | 'wave' | 'free_money'>('orange_money');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  // Régions du Sénégal
  const regions = [
    "Dakar - Plateau", "Dakar - Almadies", "Dakar - Parcelles Assainies",
    "Dakar - Ouakam", "Dakar - Point E", "Dakar - Pikine", "Dakar - Guédiawaye",
    "Thiès", "Saint-Louis", "Kaolack", "Ziguinchor", "Diourbel",
    "Louga", "Fatick", "Kolda", "Tambacounda"
  ];

  // Étapes du processus
  const steps = [
    { id: 1, title: "Informations", icon: FileText, description: "Titre, description, prix" },
    { id: 2, title: "Catégorie & Localisation", icon: MapPin, description: "Catégorie et région" },
    { id: 3, title: "Photos", icon: Camera, description: "Images de votre produit" },
    { id: 4, title: "Aperçu", icon: Eye, description: "Vérifiez votre annonce" },
    { id: 5, title: "Publication", icon: Zap, description: "Paiement et mise en ligne" }
  ];

  // Chargement initial
  useEffect(() => {
    // Vérifier l'authentification
    const token = localStorage.getItem('senmarket_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchCategories();
  }, [router]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/categories');
      const data = await response.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    }
  };

  // Gestion upload d'images
  const handleImageUpload = async (files: FileList) => {
    if (files.length === 0) return;
    
    setUploadingImages(true);
    setError(null);

    try {
      const token = localStorage.getItem('senmarket_token');
      const formData = new FormData();
      
      // Ajouter jusqu'à 5 images
      const remainingSlots = 5 - form.images.length;
      const filesToUpload = Array.from(files).slice(0, remainingSlots);
      
      filesToUpload.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch('http://localhost:8080/api/v1/images/upload-multiple', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erreur upload images');
      }

      const data = await response.json();
      const uploadedImages: UploadedImage[] = data.data;
      
      setForm(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImages.map(img => img.url)]
      }));

      setSuccess(`${uploadedImages.length} image(s) ajoutée(s) avec succès`);
      setTimeout(() => setSuccess(null), 3000);

    } catch (error) {
      setError('Erreur lors de l\'upload des images');
      console.error('Erreur upload:', error);
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Validation des étapes
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return form.title.length >= 10 && form.description.length >= 20 && 
               parseFloat(form.price) >= 100;
      case 2:
        return form.category_id !== '' && form.region !== '';
      case 3:
        return form.images.length >= 1;
      case 4:
        return true;
      default:
        return false;
    }
  };

  // Navigation entre étapes
  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Création de l'annonce (brouillon)
  const createDraftListing = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('senmarket_token');
      
      const response = await fetch('http://localhost:8080/api/v1/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          price: parseFloat(form.price),
          category_id: form.category_id,
          region: form.region,
          images: form.images
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur création annonce');
      }

      const data = await response.json();
      setCreatedListingId(data.data.id);
      setCurrentStep(5);
      setSuccess('Annonce créée en brouillon avec succès !');

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur de création');
      console.error('Erreur création:', error);
    } finally {
      setLoading(false);
    }
  };

  // Paiement pour publication
  const handlePayment = async () => {
    if (!createdListingId || !paymentPhone) return;

    setPaymentLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('senmarket_token');
      
      const response = await fetch(`http://localhost:8080/api/v1/listings/${createdListingId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          payment_method: paymentMethod,
          phone: paymentPhone
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur paiement');
      }

      const data: PaymentResponse = await response.json();
      setPaymentUrl(data.payment_url);
      
      // Redirection vers Orange Money
      if (data.payment_url) {
        window.open(data.payment_url, '_blank');
      }

      setSuccess('Paiement initié ! Suivez les instructions sur votre téléphone.');

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur de paiement');
      console.error('Erreur paiement:', error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-slate-50">
        
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Publiez votre annonce
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Vendez facilement vos produits sur la marketplace #1 du Sénégal
              </p>
              
              {/* Progress Steps */}
              <div className="flex items-center justify-center space-x-4 mb-8">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      currentStep >= step.id
                        ? 'bg-white text-blue-600'
                        : 'bg-blue-800 text-blue-200'
                    }`}>
                      {currentStep > step.id ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        step.id
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-0.5 mx-2 transition-colors ${
                        currentStep > step.id ? 'bg-white' : 'bg-blue-800'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">
                  {steps[currentStep - 1]?.title}
                </h3>
                <p className="text-blue-100">
                  {steps[currentStep - 1]?.description}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <AnimatePresence>
          {(success || error) && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
                success ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {success ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                <span>{success || error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setSuccess(null); setError(null); }}
                  className="text-white hover:bg-white/20 p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Section */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              
              <AnimatePresence mode="wait">
                
                {/* Étape 1: Informations de base */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <FileText className="h-6 w-6 text-blue-600" />
                          Informations de base
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        
                        {/* Titre */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Titre de l'annonce *
                          </label>
                          <Input
                            type="text"
                            placeholder="Ex: iPhone 15 Pro Max 256GB - État neuf"
                            value={form.title}
                            onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full"
                            maxLength={100}
                          />
                          <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>Minimum 10 caractères</span>
                            <span>{form.title.length}/100</span>
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Description détaillée *
                          </label>
                          <Textarea
                            placeholder="Décrivez votre produit en détail : état, caractéristiques, raison de la vente..."
                            value={form.description}
                            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full h-32"
                            maxLength={1000}
                          />
                          <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>Minimum 20 caractères</span>
                            <span>{form.description.length}/1000</span>
                          </div>
                        </div>

                        {/* Prix */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Prix de vente *
                          </label>
                          <div className="relative">
                            <Input
                              type="number"
                              placeholder="50000"
                              value={form.price}
                              onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
                              className="w-full pr-16"
                              min="100"
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                              FCFA
                            </div>
                          </div>
                          {form.price && (
                            <p className="text-sm text-blue-600 mt-1">
                              Prix affiché : {formatPrice(form.price)}
                            </p>
                          )}
                        </div>

                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Étape 2: Catégorie et localisation */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <MapPin className="h-6 w-6 text-blue-600" />
                          Catégorie & Localisation
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        
                        {/* Catégorie */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-4">
                            Catégorie *
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {categories.map((category) => (
                              <button
                                key={category.id}
                                type="button"
                                onClick={() => setForm(prev => ({ ...prev, category_id: category.id }))}
                                className={`p-4 rounded-lg border-2 transition-all text-center ${
                                  form.category_id === category.id
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <i className={`fas ${category.icon} text-2xl mb-2`}></i>
                                <div className="text-sm font-medium">{category.name}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Région */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Région *
                          </label>
                          <select
                            value={form.region}
                            onChange={(e) => setForm(prev => ({ ...prev, region: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Sélectionnez votre région</option>
                            {regions.map((region) => (
                              <option key={region} value={region}>
                                {region}
                              </option>
                            ))}
                          </select>
                        </div>

                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Étape 3: Upload d'images */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <Camera className="h-6 w-6 text-blue-600" />
                          Photos de votre produit
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        
                        {/* Zone d'upload */}
                        <div
                          className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                          onClick={() => document.getElementById('imageInput')?.click()}
                        >
                          <input
                            id="imageInput"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                            className="hidden"
                          />
                          
                          {uploadingImages ? (
                            <div className="flex flex-col items-center">
                              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                              <p className="text-slate-600">Upload en cours...</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <Upload className="h-12 w-12 text-slate-400 mb-4" />
                              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                Ajoutez vos photos
                              </h3>
                              <p className="text-slate-600 mb-4">
                                Glissez-déposez ou cliquez pour sélectionner ({form.images.length}/5)
                              </p>
                              <Button type="button" variant="outline">
                                <Plus className="h-4 w-4 mr-2" />
                                Choisir des fichiers
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Aperçu des images */}
                        {form.images.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-slate-900 mb-4">
                              Photos ajoutées ({form.images.length})
                            </h4>
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                              {form.images.map((image, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={`http://localhost:8080${image}`}
                                    alt={`Aperçu ${index + 1}`}
                                    className="w-full h-24 object-cover rounded-lg border border-slate-200"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                  {index === 0 && (
                                    <Badge className="absolute bottom-2 left-2 text-xs">
                                      Principal
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Conseils */}
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-900 mb-2">
                            💡 Conseils pour de bonnes photos
                          </h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Prenez des photos nettes et bien éclairées</li>
                            <li>• Montrez votre produit sous différents angles</li>
                            <li>• La première image sera votre photo principale</li>
                            <li>• Maximum 5 images par annonce</li>
                          </ul>
                        </div>

                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Étape 4: Aperçu */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <Eye className="h-6 w-6 text-blue-600" />
                          Aperçu de votre annonce
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        
                        {/* Aperçu comme sur la marketplace */}
                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                          
                          {/* Image principale */}
                          {form.images.length > 0 && (
                            <div className="relative">
                              <img
                                src={`http://localhost:8080${form.images[0]}`}
                                alt={form.title}
                                className="w-full h-64 object-cover"
                              />
                              {form.images.length > 1 && (
                                <Badge className="absolute bottom-3 right-3 bg-black/70 text-white">
                                  +{form.images.length - 1} photos
                                </Badge>
                              )}
                            </div>
                          )}

                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">
                                  {form.title}
                                </h3>
                                <p className="text-2xl font-bold text-blue-600 mb-3">
                                  {formatPrice(form.price)}
                                </p>
                              </div>
                              <Badge variant="outline" className="ml-4">
                                {categories.find(c => c.id === form.category_id)?.name}
                              </Badge>
                            </div>

                            <p className="text-slate-600 mb-4 line-clamp-3">
                              {form.description}
                            </p>

                            <div className="flex items-center justify-between text-sm text-slate-500">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {form.region}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                À l'instant
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Boutons d'action */}
                        <div className="mt-6 space-y-4">
                          <div className="bg-green-50 rounded-lg p-4">
                            <h4 className="font-semibold text-green-900 mb-2">
                              ✅ Votre annonce est prête !
                            </h4>
                            <p className="text-green-800 text-sm">
                              Créez votre annonce en brouillon, puis payez 200 FCFA pour la publier immédiatement.
                            </p>
                          </div>

                          <Button
                            onClick={createDraftListing}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                            size="lg"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                Création en cours...
                              </>
                            ) : (
                              <>
                                <Save className="h-5 w-5 mr-2" />
                                Créer l'annonce
                              </>
                            )}
                          </Button>
                        </div>

                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Étape 5: Paiement */}
                {currentStep === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <Zap className="h-6 w-6 text-blue-600" />
                          Publication de votre annonce
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        
                        {/* Statut création */}
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                            <div>
                              <h4 className="font-semibold text-green-900">
                                Annonce créée avec succès !
                              </h4>
                              <p className="text-green-800 text-sm">
                                Votre annonce est sauvegardée en brouillon. 
                                Payez 200 FCFA pour la publier immédiatement.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Méthodes de paiement */}
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-4">
                            Choisissez votre méthode de paiement
                          </h4>
                          
                          <div className="space-y-3">
                            {/* Orange Money */}
                            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-slate-50">
                              <input
                                type="radio"
                                name="payment_method"
                                value="orange_money"
                                checked={paymentMethod === 'orange_money'}
                                onChange={(e) => setPaymentMethod(e.target.value as any)}
                                className="sr-only"
                              />
                              <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                                paymentMethod === 'orange_money' ? 'border-orange-500 bg-orange-500' : 'border-slate-300'
                              }`}>
                                {paymentMethod === 'orange_money' && (
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                )}
                              </div>
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-12 h-8 bg-orange-500 rounded flex items-center justify-center">
                                  <Smartphone className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900">Orange Money</div>
                                  <div className="text-sm text-slate-600">Paiement sécurisé par Orange</div>
                                </div>
                              </div>
                              <Badge className="bg-green-100 text-green-800">Recommandé</Badge>
                            </label>

                            {/* Wave */}
                            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-slate-50">
                              <input
                                type="radio"
                                name="payment_method"
                                value="wave"
                                checked={paymentMethod === 'wave'}
                                onChange={(e) => setPaymentMethod(e.target.value as any)}
                                className="sr-only"
                              />
                              <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                                paymentMethod === 'wave' ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                              }`}>
                                {paymentMethod === 'wave' && (
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                )}
                              </div>
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-12 h-8 bg-blue-500 rounded flex items-center justify-center">
                                  <CreditCard className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900">Wave</div>
                                  <div className="text-sm text-slate-600">Paiement mobile Wave</div>
                                </div>
                              </div>
                            </label>

                            {/* Free Money */}
                            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-slate-50">
                              <input
                                type="radio"
                                name="payment_method"
                                value="free_money"
                                checked={paymentMethod === 'free_money'}
                                onChange={(e) => setPaymentMethod(e.target.value as any)}
                                className="sr-only"
                              />
                              <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                                paymentMethod === 'free_money' ? 'border-purple-500 bg-purple-500' : 'border-slate-300'
                              }`}>
                                {paymentMethod === 'free_money' && (
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                )}
                              </div>
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-12 h-8 bg-purple-500 rounded flex items-center justify-center">
                                  <DollarSign className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900">Free Money</div>
                                  <div className="text-sm text-slate-600">Paiement Free Money</div>
                                </div>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* Numéro de téléphone */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Numéro de téléphone *
                          </label>
                          <Input
                            type="tel"
                            placeholder="+221 77 123 45 67"
                            value={paymentPhone}
                            onChange={(e) => setPaymentPhone(e.target.value)}
                            className="w-full"
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            Le numéro associé à votre compte {paymentMethod.replace('_', ' ')}
                          </p>
                        </div>

                        {/* Récapitulatif paiement */}
                        <div className="bg-slate-50 rounded-lg p-4">
                          <h4 className="font-semibold text-slate-900 mb-3">
                            Récapitulatif du paiement
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Publication d'annonce</span>
                              <span className="font-semibold">200 FCFA</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Frais de service</span>
                              <span className="font-semibold text-green-600">Gratuit</span>
                            </div>
                            <hr className="my-2" />
                            <div className="flex justify-between text-lg font-bold">
                              <span>Total à payer</span>
                              <span className="text-blue-600">200 FCFA</span>
                            </div>
                          </div>
                        </div>

                        {/* Avantages publication */}
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-900 mb-3">
                            🚀 Avantages de la publication
                          </h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Visible immédiatement par 10 000+ acheteurs</li>
                            <li>• Référencement dans les moteurs de recherche</li>
                            <li>• Notifications push aux utilisateurs intéressés</li>
                            <li>• Support client prioritaire</li>
                            <li>• Statistiques détaillées des visites</li>
                          </ul>
                        </div>

                        {/* Bouton paiement */}
                        <Button
                          onClick={handlePayment}
                          disabled={paymentLoading || !paymentPhone}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-4"
                          size="lg"
                        >
                          {paymentLoading ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Traitement en cours...
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-5 w-5 mr-2" />
                              Payer et publier - 200 FCFA
                            </>
                          )}
                        </Button>

                        {/* URL de paiement */}
                        {paymentUrl && (
                          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-yellow-900 mb-2">
                                  Finaliser le paiement
                                </h4>
                                <p className="text-yellow-800 text-sm mb-3">
                                  Une fenêtre s'est ouverte pour finaliser votre paiement. 
                                  Si elle ne s'affiche pas, cliquez sur le lien ci-dessous.
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(paymentUrl, '_blank')}
                                  className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Ouvrir le paiement
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Actions alternatives */}
                        <div className="flex gap-4 pt-4 border-t border-slate-200">
                          <Button
                            variant="outline"
                            onClick={() => router.push('/dashboard')}
                            className="flex-1"
                          >
                            Aller au Dashboard
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => router.push('/listings')}
                            className="flex-1"
                          >
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
                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </Button>

                  <Button
                    onClick={currentStep === 4 ? createDraftListing : nextStep}
                    disabled={!validateStep(currentStep) || loading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {currentStep === 4 ? (
                      loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Création...
                        </>
                      ) : (
                        <>
                          Créer l'annonce
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )
                    ) : (
                      <>
                        Suivant
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}

            </div>
          </div>
        </section>

        {/* Section d'aide */}
        <section className="bg-white py-16 border-t border-slate-200">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  Besoin d'aide ?
                </h2>
                <p className="text-slate-600">
                  Notre équipe est là pour vous accompagner
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <Card className="text-center">
                  <CardContent className="p-6">
                    <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">
                      Paiement sécurisé
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Tous vos paiements sont protégés par nos partenaires certifiés
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">
                      Visibilité maximale
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Votre annonce sera visible par des milliers d'acheteurs potentiels
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <Clock className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">
                      Support 24/7
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Notre équipe vous aide à tout moment par téléphone ou chat
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center mt-12">
                <Button variant="outline" size="lg">
                  <Phone className="h-5 w-5 mr-2" />
                  Contacter le support
                </Button>
              </div>

            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}