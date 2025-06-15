'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';

const CreateListingPage = () => {
  // Composants d'icônes personnalisés
  const PhotoIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  );

  const XMarkIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );

  const CloudArrowUpIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18.75 19.5H6.75Z" />
    </svg>
  );

  const CheckCircleIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );

  const CurrencyDollarIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );

  const DevicePhoneMobileIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  );

  const MapPinIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );

  const TagIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
    </svg>
  );

  const DocumentTextIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125.504 1.125 1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );

  const SparklesIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  );

  const ShieldCheckIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );

  const CreditCardIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
    </svg>
  );

  const ArrowRightIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );

  const ArrowLeftIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  );

  const EyeIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );

  const HeartIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  );

  const ShareIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.935-2.186 2.25 2.25 0 0 0-3.935 2.186Z" />
    </svg>
  );

  const StarSolid = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
    </svg>
  );

  // États du formulaire
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    region: '',
    images: [],
    phone: '+221'
  });
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('orange_money');
  const fileInputRef = useRef(null);

  // Animation
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Catégories avec icônes
  const categories = [
    { id: 'vehicles', name: 'Véhicules', icon: '🚗', color: 'bg-blue-500' },
    { id: 'real-estate', name: 'Immobilier', icon: '🏠', color: 'bg-green-500' },
    { id: 'electronics', name: 'Électronique', icon: '📱', color: 'bg-purple-500' },
    { id: 'fashion', name: 'Mode & Beauté', icon: '👗', color: 'bg-pink-500' },
    { id: 'jobs', name: 'Emploi', icon: '💼', color: 'bg-indigo-500' },
    { id: 'services', name: 'Services', icon: '🔧', color: 'bg-orange-500' },
    { id: 'home-garden', name: 'Maison & Jardin', icon: '🛋️', color: 'bg-teal-500' },
    { id: 'animals', name: 'Animaux', icon: '🐕', color: 'bg-yellow-500' }
  ];

  // Régions
  const regions = [
    'Dakar - Plateau', 'Dakar - Almadies', 'Dakar - Parcelles Assainies',
    'Dakar - Ouakam', 'Dakar - Point E', 'Dakar - Pikine', 'Dakar - Guédiawaye',
    'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Diourbel',
    'Louga', 'Fatick', 'Kolda', 'Tambacounda'
  ];

  // Gestion des images
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    if (formData.images.length + validFiles.length > 5) {
      alert('Maximum 5 images autorisées');
      return;
    }

    validFiles.forEach(file => {
      const id = Date.now() + Math.random();
      setUploadProgress(prev => ({ ...prev, [id]: 0 }));
      
      // Simulation upload
      const reader = new FileReader();
      reader.onload = (e) => {
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            const newProgress = Math.min((prev[id] || 0) + 20, 100);
            if (newProgress === 100) {
              clearInterval(interval);
              setFormData(prevData => ({
                ...prevData,
                images: [...prevData.images, {
                  id,
                  file,
                  url: e.target.result,
                  name: file.name
                }]
              }));
              setTimeout(() => {
                setUploadProgress(prev => {
                  const newState = { ...prev };
                  delete newState[id];
                  return newState;
                });
              }, 500);
            }
            return { ...prev, [id]: newProgress };
          });
        }, 200);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.category && formData.region;
      case 2:
        return formData.title.length >= 5 && formData.description.length >= 20;
      case 3:
        return formData.price && formData.images.length > 0;
      case 4:
        return formData.phone.length > 4;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    // Simulation paiement
    setTimeout(() => {
      setIsLoading(false);
      alert('🎉 Annonce publiée avec succès ! Paiement de 200 FCFA effectué.');
    }, 3000);
  };

  const selectedCategory = categories.find(cat => cat.id === formData.category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-red-800">
      {/* Header avec Progress */}
      <div className="sticky top-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className={`flex items-center justify-between mb-6 ${isVisible ? 'animate-fade-in-down' : 'opacity-0'}`}>
            <div className="flex items-center space-x-4">
              {/* Bouton Retour Accueil */}
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-300 group"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Accueil</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Créer une annonce</h1>
                  <p className="text-green-200">Gagnez de l'argent en 5 minutes !</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-yellow-500">200 FCFA</div>
              <div className="text-sm text-green-200">Prix de publication</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className={`${isVisible ? 'animate-fade-in-up animate-delayed' : 'opacity-0'}`}>
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    step <= currentStep 
                      ? 'bg-yellow-500 border-yellow-500 text-white' 
                      : 'border-white/30 text-white/50'
                  }`}>
                    {step < currentStep ? (
                      <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                      step
                    )}
                  </div>
                  {step < 4 && (
                    <div className={`w-20 h-1 mx-4 rounded transition-all duration-300 ${
                      step < currentStep ? 'bg-yellow-500' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-green-200">
              <span>Catégorie</span>
              <span>Détails</span>
              <span>Photos & Prix</span>
              <span>Paiement</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className={`bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 ${isVisible ? 'animate-fade-in-up animate-delayed-2' : 'opacity-0'}`}>
          
          {/* Étape 1: Catégorie & Région */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Choisissez votre catégorie
                </h2>
                <p className="text-xl text-green-200">
                  Dans quelle catégorie souhaitez-vous vendre ?
                </p>
              </div>

              {/* Catégories Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => updateFormData('category', category.id)}
                    className={`group p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                      formData.category === category.id
                        ? 'border-yellow-500 bg-yellow-500/20 shadow-lg shadow-yellow-500/25'
                        : 'border-white/20 bg-white/10 hover:border-white/40'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">{category.icon}</div>
                      <div className="font-semibold text-white text-sm leading-tight">
                        {category.name}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Région */}
              <div>
                <label className="block text-lg font-semibold text-white mb-4">
                  <MapPinIcon className="w-6 h-6 inline mr-2" />
                  Votre région
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => updateFormData('region', e.target.value)}
                  className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="" className="bg-gray-800">Sélectionnez votre région</option>
                  {regions.map((region) => (
                    <option key={region} value={region} className="bg-gray-800">
                      {region}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Étape 2: Titre & Description */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Décrivez votre {selectedCategory?.name?.toLowerCase()}
                </h2>
                <p className="text-xl text-green-200">
                  Plus c'est détaillé, plus vous vendez vite !
                </p>
              </div>

              {/* Titre */}
              <div>
                <label className="block text-lg font-semibold text-white mb-4">
                  <TagIcon className="w-6 h-6 inline mr-2" />
                  Titre de l'annonce
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="Ex: iPhone 14 Pro Max 256GB comme neuf"
                  className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
                  maxLength={100}
                />
                <div className="text-right text-sm text-green-300 mt-2">
                  {formData.title.length}/100 caractères
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-lg font-semibold text-white mb-4">
                  <DocumentTextIcon className="w-6 h-6 inline mr-2" />
                  Description détaillée
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Décrivez votre article en détail : état, caractéristiques, raison de la vente..."
                  rows={6}
                  className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 resize-none"
                />
                <div className="text-right text-sm text-green-300 mt-2">
                  {formData.description.length} caractères (minimum 20)
                </div>
              </div>

              {/* Conseils */}
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-6">
                <h3 className="font-semibold text-yellow-500 mb-3 flex items-center">
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Conseils pour une description qui vend
                </h3>
                <ul className="space-y-2 text-white/90 text-sm">
                  <li>• Mentionnez l'état exact (neuf, très bon état, etc.)</li>
                  <li>• Ajoutez les caractéristiques importantes</li>
                  <li>• Expliquez pourquoi vous vendez</li>
                  <li>• Soyez honnête pour éviter les retours</li>
                </ul>
              </div>
            </div>
          )}

          {/* Étape 3: Photos & Prix */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Photos et prix
                </h2>
                <p className="text-xl text-green-200">
                  De belles photos = plus de ventes !
                </p>
              </div>

              {/* Upload Zone */}
              <div>
                <label className="block text-lg font-semibold text-white mb-4">
                  <PhotoIcon className="w-6 h-6 inline mr-2" />
                  Photos de votre article (max 5)
                </label>
                
                <div
                  className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
                    dragActive 
                      ? 'border-yellow-500 bg-yellow-500/20' 
                      : 'border-white/30 bg-white/5'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                  />
                  
                  <CloudArrowUpIcon className="w-16 h-16 text-white/50 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Glissez vos photos ici
                  </h3>
                  <p className="text-green-200 mb-4">
                    ou cliquez pour sélectionner
                  </p>
                  <p className="text-sm text-green-300">
                    JPG, PNG, WebP • Max 5MB par image
                  </p>
                </div>

                {/* Images Prévisualisées */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
                    {formData.images.map((image, index) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.url}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-xl"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(image.id);
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XMarkIcon className="w-4 h-4 text-white" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 bg-yellow-500 text-xs px-2 py-1 rounded-full font-semibold text-white">
                            Photo principale
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Progress Upload */}
                {Object.keys(uploadProgress).length > 0 && (
                  <div className="mt-4 space-y-2">
                    {Object.entries(uploadProgress).map(([id, progress]) => (
                      <div key={id} className="bg-white/10 rounded-full p-1">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Prix */}
              <div>
                <label className="block text-lg font-semibold text-white mb-4">
                  <CurrencyDollarIcon className="w-6 h-6 inline mr-2" />
                  Prix de vente
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => updateFormData('price', e.target.value)}
                    placeholder="50000"
                    className="w-full p-4 pr-20 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 font-semibold">
                    FCFA
                  </span>
                </div>
                <p className="text-sm text-green-300 mt-2">
                  Conseil: Vérifiez les prix similaires sur SenMarket
                </p>
              </div>
            </div>
          )}

          {/* Étape 4: Paiement */}
          {currentStep === 4 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Finalisation & Paiement
                </h2>
                <p className="text-xl text-green-200">
                  Vérifiez vos informations et payez 200 FCFA
                </p>
              </div>

              {/* Récapitulatif */}
              <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <EyeIcon className="w-6 h-6 mr-2" />
                  Aperçu de votre annonce
                </h3>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Image principale */}
                  <div className="md:col-span-1">
                    {formData.images[0] ? (
                      <img
                        src={formData.images[0].url}
                        alt="Aperçu"
                        className="w-full h-48 object-cover rounded-xl"
                      />
                    ) : (
                      <div className="w-full h-48 bg-white/10 rounded-xl flex items-center justify-center">
                        <PhotoIcon className="w-12 h-12 text-white/50" />
                      </div>
                    )}
                  </div>

                  {/* Détails */}
                  <div className="md:col-span-2 space-y-3">
                    <h4 className="text-2xl font-bold text-white">
                      {formData.title || 'Titre de votre annonce'}
                    </h4>
                    <div className="text-3xl font-bold text-yellow-500">
                      {formData.price ? `${Number(formData.price).toLocaleString()} FCFA` : 'Prix à définir'}
                    </div>
                    <div className="flex items-center space-x-4 text-green-200">
                      <span className="flex items-center">
                        <TagIcon className="w-4 h-4 mr-1" />
                        {selectedCategory?.name || 'Catégorie'}
                      </span>
                      <span className="flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {formData.region || 'Région'}
                      </span>
                    </div>
                    <p className="text-green-200 line-clamp-3">
                      {formData.description || 'Description de votre article...'}
                    </p>
                    
                    {/* Stats simulées */}
                    <div className="flex items-center space-x-6 text-sm text-green-300 pt-4">
                      <span className="flex items-center">
                        <EyeIcon className="w-4 h-4 mr-1" />
                        0 vues
                      </span>
                      <span className="flex items-center">
                        <HeartIcon className="w-4 h-4 mr-1" />
                        0 favoris
                      </span>
                      <span className="flex items-center">
                        <ShareIcon className="w-4 h-4 mr-1" />
                        0 partages
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div>
                <label className="block text-lg font-semibold text-white mb-4">
                  <DevicePhoneMobileIcon className="w-6 h-6 inline mr-2" />
                  Numéro de contact (visible par les acheteurs)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  placeholder="+221 XX XXX XX XX"
                  className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
                />
              </div>

              {/* Méthode de paiement */}
              <div>
                <label className="block text-lg font-semibold text-white mb-4">
                  <CreditCardIcon className="w-6 h-6 inline mr-2" />
                  Méthode de paiement (200 FCFA)
                </label>
                
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'orange_money', name: 'Orange Money', icon: '🟠', recommended: true },
                    { id: 'wave', name: 'Wave', icon: '🌊', recommended: false },
                    { id: 'free_money', name: 'Free Money', icon: '💳', recommended: false }
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                        paymentMethod === method.id
                          ? 'border-yellow-500 bg-yellow-500/20'
                          : 'border-white/20 bg-white/10 hover:border-white/40'
                      }`}
                    >
                      {method.recommended && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          Recommandé
                        </div>
                      )}
                      <div className="text-center">
                        <div className="text-2xl mb-2">{method.icon}</div>
                        <div className="font-semibold text-white text-sm">
                          {method.name}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sécurité */}
              <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-6">
                <h3 className="font-semibold text-green-400 mb-3 flex items-center">
                  <ShieldCheckIcon className="w-5 h-5 mr-2" />
                  Paiement 100% sécurisé
                </h3>
                <ul className="space-y-2 text-white/90 text-sm">
                  <li>• Transaction chiffrée SSL</li>
                  <li>• Aucune donnée bancaire stockée</li>
                  <li>• Remboursement en cas de problème</li>
                  <li>• Support client 24/7</li>
                </ul>
              </div>
            </div>
          )}

          {/* Boutons Navigation */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/20">
            <div className="flex items-center space-x-3">
              {/* Bouton Annuler - toujours visible */}
              <button
                onClick={() => {
                  if (confirm('Êtes-vous sûr de vouloir annuler ? Toutes vos données seront perdues.')) {
                    window.location.href = '/';
                  }
                }}
                className="flex items-center space-x-2 px-6 py-3 rounded-2xl border-2 border-red-400/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-400/50 transition-all duration-300"
              >
                <XMarkIcon className="w-5 h-5" />
                <span>Annuler</span>
              </button>

              {/* Bouton Retour - visible seulement à partir de l'étape 2 */}
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  <span>Retour</span>
                </button>
              )}
            </div>
            
            <div className="flex-1" />
            
            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className={`flex items-center space-x-2 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                  canProceed()
                    ? 'bg-yellow-500 text-white hover:bg-yellow-400 shadow-lg shadow-yellow-500/25'
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                }`}
              >
                <span>Continuer</span>
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || isLoading}
                className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                  canProceed() && !isLoading
                    ? 'bg-gradient-to-r from-yellow-500 to-green-500 text-white hover:shadow-lg hover:shadow-yellow-500/50 transform hover:scale-105'
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Traitement en cours...</span>
                  </>
                ) : (
                  <>
                    <CreditCardIcon className="w-5 h-5" />
                    <span>Payer 200 FCFA et Publier</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Informations supplémentaires */}
          {currentStep === 4 && (
            <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="font-semibold text-white mb-4 flex items-center">
                <SparklesIcon className="w-5 h-5 mr-2" />
                Après publication, votre annonce sera :
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-green-200">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    <span>Visible immédiatement</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    <span>Indexée dans les moteurs de recherche</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    <span>Promue sur les réseaux sociaux</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    <span>Active pendant 30 jours</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    <span>Statistiques détaillées disponibles</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    <span>Modifiable à tout moment</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar d'aide */}
        <div className={`mt-8 ${isVisible ? 'animate-fade-in-up animate-delayed-3' : 'opacity-0'}`}>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center">
              <SparklesIcon className="w-5 h-5 mr-2 text-yellow-500" />
              Conseils pour vendre rapidement
            </h3>
            <div className="space-y-3 text-sm text-green-200">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <div>
                  <div className="font-medium text-white">Photos de qualité</div>
                  <div>Prenez des photos bien éclairées sous plusieurs angles</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <div>
                  <div className="font-medium text-white">Prix juste</div>
                  <div>Vérifiez les prix similaires avant de fixer le vôtre</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <div>
                  <div className="font-medium text-white">Répondez vite</div>
                  <div>Les premiers à répondre vendent plus rapidement</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <div>
                  <div className="font-medium text-white">Soyez flexible</div>
                  <div>Acceptez les négociations raisonnables</div>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="text-center">
                <div className="text-white font-medium mb-2">Besoin d'aide ?</div>
                <div className="flex justify-center space-x-4">
                  <button className="text-yellow-500 hover:text-yellow-400 transition-colors">
                    📞 Support
                  </button>
                  <button className="text-yellow-500 hover:text-yellow-400 transition-colors">
                    💬 Chat
                  </button>
                  <button className="text-yellow-500 hover:text-yellow-400 transition-colors">
                    📧 Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer motivationnel */}
        <div className={`mt-8 text-center ${isVisible ? 'animate-fade-in-up animate-delayed-4' : 'opacity-0'}`}>
          <div className="inline-flex items-center space-x-2 bg-green-500/20 border border-green-500/30 rounded-full px-6 py-3">
            <StarSolid className="w-5 h-5 text-yellow-500" />
            <span className="text-white font-medium">
              +500 annonces publiées cette semaine !
            </span>
            <StarSolid className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-green-200 mt-4 max-w-2xl mx-auto">
            Rejoignez des milliers de Sénégalais qui font confiance à SenMarket 
            pour vendre leurs produits. Votre succès commence maintenant ! 🚀
          </p>
        </div>
      </div>

      {/* Styles CSS personnalisés */}
      <style jsx>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animate-delayed {
          animation-delay: 0.2s;
        }
        
        .animate-delayed-2 {
          animation-delay: 0.4s;
        }
        
        .animate-delayed-3 {
          animation-delay: 0.6s;
        }
        
        .animate-delayed-4 {
          animation-delay: 0.8s;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default CreateListingPage;