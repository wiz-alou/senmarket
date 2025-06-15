'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';

const CreateListingPage = () => {
  // Tous tes composants d'icônes (gardés identiques)
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

  const CheckCircleIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
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

  const SparklesIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  );

  // États du formulaire (identiques à ton code)
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

  // NOUVEAU : État pour les catégories depuis l'API
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Animation (identique)
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // NOUVEAU : Charger les catégories depuis l'API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log('🔄 Chargement catégories depuis API...');
        
        const response = await fetch('http://localhost:8080/api/v1/categories');
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ Catégories reçues:', result.data?.length);
          
          // Transformer les catégories API en format ton code
          const transformedCategories = result.data.map(cat => ({
            id: cat.slug, // Utiliser slug comme ID
            name: cat.name,
            icon: cat.icon === 'fa-car' ? '🚗' :
                  cat.icon === 'fa-home' ? '🏠' :
                  cat.icon === 'fa-laptop' ? '📱' :
                  cat.icon === 'fa-tshirt' ? '👗' :
                  cat.icon === 'fa-briefcase' ? '💼' :
                  cat.icon === 'fa-tools' ? '🔧' :
                  cat.icon === 'fa-couch' ? '🛋️' :
                  cat.icon === 'fa-paw' ? '🐕' :
                  cat.icon, // Fallback
            color: 'bg-blue-500' // Couleur par défaut
          }));
          
          setCategories(transformedCategories);
        } else {
          throw new Error('Erreur API');
        }
      } catch (error) {
        console.error('❌ Erreur API, utilisation fallback:', error);
        
        // Tes catégories de fallback (identiques à ton code original)
        setCategories([
          { id: 'vehicles', name: 'Véhicules', icon: '🚗', color: 'bg-blue-500' },
          { id: 'real-estate', name: 'Immobilier', icon: '🏠', color: 'bg-green-500' },
          { id: 'electronics', name: 'Électronique', icon: '📱', color: 'bg-purple-500' },
          { id: 'fashion', name: 'Mode & Beauté', icon: '👗', color: 'bg-pink-500' },
          { id: 'jobs', name: 'Emploi', icon: '💼', color: 'bg-indigo-500' },
          { id: 'services', name: 'Services', icon: '🔧', color: 'bg-orange-500' },
          { id: 'home-garden', name: 'Maison & Jardin', icon: '🛋️', color: 'bg-teal-500' },
          { id: 'animals', name: 'Animaux', icon: '🐕', color: 'bg-yellow-500' }
        ]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Régions (identiques)
  const regions = [
    'Dakar - Plateau', 'Dakar - Almadies', 'Dakar - Parcelles Assainies',
    'Dakar - Ouakam', 'Dakar - Point E', 'Dakar - Pikine', 'Dakar - Guédiawaye',
    'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Diourbel',
    'Louga', 'Fatick', 'Kolda', 'Tambacounda'
  ];

  // Toutes tes fonctions (identiques à ton code)
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
      
      // Simulation upload (identique à ton code)
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
    // Simulation paiement (identique)
    setTimeout(() => {
      setIsLoading(false);
      alert('🎉 Annonce publiée avec succès ! Paiement de 200 FCFA effectué.');
    }, 3000);
  };

  const selectedCategory = categories.find(cat => cat.id === formData.category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-red-800">
      {/* Header avec Progress (identique à ton code) */}
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

          {/* Progress Bar (identique) */}
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

              {/* Grille des catégories */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {categoriesLoading ? (
                  // Loading skeleton
                  Array.from({length: 8}, (_, i) => (
                    <div key={i} className="h-32 bg-white/10 rounded-2xl animate-pulse"></div>
                  ))
                ) : (
                  categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => updateFormData('category', category.id)}
                      className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        formData.category === category.id
                          ? 'border-yellow-500 bg-yellow-500/20 shadow-xl'
                          : 'border-white/30 bg-white/5 hover:border-yellow-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl ${category.color} flex items-center justify-center text-2xl transform group-hover:scale-110 transition-transform duration-300`}>
                          {category.icon}
                        </div>
                        <h3 className="text-white font-semibold text-sm">{category.name}</h3>
                      </div>
                      
                      {formData.category === category.id && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                          <CheckCircleIcon className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Sélection région */}
              <div className="space-y-4">
                <label className="block text-xl font-semibold text-white">
                  Où vous situez-vous ?
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => updateFormData('region', e.target.value)}
                  className="w-full p-4 bg-white/10 border border-white/30 rounded-2xl text-white text-lg focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20 transition-all duration-300"
                >
                  <option value="">Sélectionnez votre région</option>
                  {regions.map((region) => (
                    <option key={region} value={region} className="text-black">
                      {region}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                currentStep === 1
                  ? 'text-white/40 cursor-not-allowed'
                  : 'text-white bg-white/10 hover:bg-white/20'
              }`}
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Précédent</span>
            </button>

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className={`flex items-center space-x-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  canProceed()
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:shadow-lg hover:shadow-yellow-500/50 transform hover:scale-105'
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                }`}
              >
                <span>Suivant</span>
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading || !canProceed()}
                className={`flex items-center space-x-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  !isLoading && canProceed()
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
        </div>
      </div>
    </div>
  );
};

export default CreateListingPage;