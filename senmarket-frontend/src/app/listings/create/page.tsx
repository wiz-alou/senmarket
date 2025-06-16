'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';

const CreateListingPage = () => {
  // Icônes
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

  // États pour API
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Animation
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Charger les catégories depuis l'API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log('🔄 Chargement catégories depuis API...');
        
        const response = await fetch('http://localhost:8080/api/v1/categories');
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ Catégories reçues:', result.data?.length);
          
          const transformedCategories = result.data.map(cat => ({
            id: cat.slug,
            name: cat.name,
            icon: cat.icon === 'fa-car' ? '🚗' :
                  cat.icon === 'fa-home' ? '🏠' :
                  cat.icon === 'fa-laptop' ? '📱' :
                  cat.icon === 'fa-tshirt' ? '👗' :
                  cat.icon === 'fa-briefcase' ? '💼' :
                  cat.icon === 'fa-tools' ? '🔧' :
                  cat.icon === 'fa-couch' ? '🛋️' :
                  cat.icon === 'fa-paw' ? '🐕' :
                  cat.icon,
            color: 'bg-primary-500'
          }));
          
          setCategories(transformedCategories);
        } else {
          throw new Error('Erreur API');
        }
      } catch (error) {
        console.error('❌ Erreur API, utilisation fallback:', error);
        
        // Catégories avec couleurs cohérentes
        setCategories([
          { id: 'vehicles', name: 'Véhicules', icon: '🚗', color: 'bg-primary-500' },
          { id: 'real-estate', name: 'Immobilier', icon: '🏠', color: 'bg-senegal-green' },
          { id: 'electronics', name: 'Électronique', icon: '📱', color: 'bg-primary-600' },
          { id: 'fashion', name: 'Mode & Beauté', icon: '👗', color: 'bg-primary-400' },
          { id: 'jobs', name: 'Emploi', icon: '💼', color: 'bg-senegal-green' },
          { id: 'services', name: 'Services', icon: '🔧', color: 'bg-primary-500' },
          { id: 'home-garden', name: 'Maison & Jardin', icon: '🛋️', color: 'bg-primary-600' },
          { id: 'animals', name: 'Animaux', icon: '🐕', color: 'bg-senegal-yellow' }
        ]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Régions Sénégal
  const regions = [
    'Dakar - Plateau', 'Dakar - Almadies', 'Dakar - Parcelles Assainies',
    'Dakar - Ouakam', 'Dakar - Point E', 'Dakar - Pikine', 'Dakar - Guédiawaye',
    'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Diourbel',
    'Louga', 'Fatick', 'Kolda', 'Tambacounda'
  ];

  // Gestion drag & drop
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

  // Soumission finale avec intégration backend
  const handleSubmit = async () => {
    setIsLoading(true);
    setSubmitError('');
    
    try {
      // 1. Créer l'annonce en mode brouillon
      const listingData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category_id: formData.category,
        region: formData.region,
        status: 'draft'
      };

      console.log('🔄 Création annonce...', listingData);

      const createResponse = await fetch('http://localhost:8080/api/v1/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(listingData)
      });

      if (!createResponse.ok) {
        throw new Error('Erreur création annonce');
      }

      const listingResult = await createResponse.json();
      const listingId = listingResult.data.id;

      console.log('✅ Annonce créée:', listingId);

      // 2. Upload des images
      if (formData.images.length > 0) {
        const imageFormData = new FormData();
        formData.images.forEach(img => {
          imageFormData.append('images', img.file);
        });
        imageFormData.append('listing_id', listingId);

        console.log('🔄 Upload images...');

        const imageResponse = await fetch('http://localhost:8080/api/v1/images/upload-multiple', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: imageFormData
        });

        if (!imageResponse.ok) {
          throw new Error('Erreur upload images');
        }

        console.log('✅ Images uploadées');
      }

      // 3. Initier le paiement Orange Money
      const paymentData = {
        payment_method: paymentMethod,
        phone: formData.phone
      };

      console.log('🔄 Paiement Orange Money...', paymentData);

      const paymentResponse = await fetch(`http://localhost:8080/api/v1/listings/${listingId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(paymentData)
      });

      if (!paymentResponse.ok) {
        throw new Error('Erreur initiation paiement');
      }

      const paymentResult = await paymentResponse.json();
      console.log('✅ Paiement initié:', paymentResult);

      // 4. Redirection vers Orange Money ou affichage succès
      if (paymentResult.payment_url) {
        // En production, rediriger vers Orange Money
        console.log('🔄 Redirection Orange Money:', paymentResult.payment_url);
        // window.location.href = paymentResult.payment_url;
      }

      // Succès !
      setSubmitSuccess(true);
      
    } catch (error) {
      console.error('❌ Erreur:', error);
      setSubmitError(error.message || 'Erreur lors de la création de l\'annonce');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.id === formData.category);

  // Affichage succès
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-tr from-senegal-green/20 via-transparent to-primary-800/20"></div>
        <div className="absolute inset-0 particles opacity-30"></div>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 text-center max-w-md relative z-10">
          <div className="w-20 h-20 bg-senegal-green rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">🎉 Succès !</h2>
          <p className="text-primary-200 mb-6">
            Votre annonce a été créée avec succès ! Le paiement de 200 FCFA a été initié.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full bg-senegal-yellow text-gray-900 font-semibold py-3 rounded-xl hover:bg-senegal-yellow/90 transition-colors"
          >
            Voir mes annonces
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
      {/* Background Effects (identique à la page d'accueil) */}
      <div className="absolute inset-0 bg-gradient-to-tr from-senegal-green/20 via-transparent to-primary-800/20"></div>
      <div className="absolute inset-0 particles opacity-30"></div>
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-senegal-yellow rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-senegal-green rounded-full blur-2xl"></div>
      </div>

      {/* Header avec Progress */}
      <div className="sticky top-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/20 relative">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className={`flex items-center justify-between mb-6 ${isVisible ? 'animate-fade-in-down' : 'opacity-0'}`}>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Accueil</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-senegal-yellow rounded-2xl flex items-center justify-center shadow-lg">
                  <SparklesIcon className="w-6 h-6 text-gray-900" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Créer une annonce</h1>
                  <p className="text-primary-200">Gagnez de l'argent en 5 minutes !</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-senegal-yellow">200 FCFA</div>
              <div className="text-sm text-primary-200">Prix de publication</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className={`${isVisible ? 'animate-fade-in-up animate-delayed' : 'opacity-0'}`}>
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    step <= currentStep 
                      ? 'bg-senegal-yellow border-senegal-yellow text-gray-900' 
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
                      step < currentStep ? 'bg-senegal-yellow' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-primary-200">
              <span>Catégorie</span>
              <span>Détails</span>
              <span>Photos & Prix</span>
              <span>Paiement</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <div className={`bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl ${isVisible ? 'animate-fade-in-up animate-delayed-2' : 'opacity-0'}`}>
          
          {/* ÉTAPE 1: Catégorie & Région */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Choisissez votre catégorie
                </h2>
                <p className="text-xl text-primary-200">
                  Dans quelle catégorie souhaitez-vous vendre ?
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {categoriesLoading ? (
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
                          ? 'border-senegal-yellow bg-senegal-yellow/20 shadow-xl'
                          : 'border-white/30 bg-white/5 hover:border-senegal-yellow/50 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl ${category.color} flex items-center justify-center text-2xl transform group-hover:scale-110 transition-transform duration-300`}>
                          {category.icon}
                        </div>
                        <h3 className="text-white font-semibold text-sm">{category.name}</h3>
                      </div>
                      
                      {formData.category === category.id && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-senegal-yellow rounded-full flex items-center justify-center">
                          <CheckCircleIcon className="w-4 h-4 text-gray-900" />
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>

              <div className="space-y-4">
                <label className="block text-xl font-semibold text-white">
                  Où vous situez-vous ?
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => updateFormData('region', e.target.value)}
                  className="w-full p-4 bg-white/10 border border-white/30 rounded-2xl text-white text-lg focus:border-senegal-yellow focus:ring-4 focus:ring-senegal-yellow/20 transition-all duration-300"
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

          {/* ÉTAPE 2: Titre & Description */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Décrivez votre produit
                </h2>
                <p className="text-xl text-primary-200">
                  Un bon titre et une description claire attirent plus d'acheteurs
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xl font-semibold text-white mb-3">
                    Titre de l'annonce *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateFormData('title', e.target.value)}
                    placeholder="Ex: iPhone 13 Pro Max 256GB Noir - État neuf"
                    className="w-full p-4 bg-white/10 border border-white/30 rounded-2xl text-white text-lg placeholder:text-white/50 focus:border-senegal-yellow focus:ring-4 focus:ring-senegal-yellow/20 transition-all duration-300"
                    maxLength={100}
                  />
                  <div className="flex justify-between text-sm text-primary-200 mt-2">
                    <span>Minimum 5 caractères</span>
                    <span>{formData.title.length}/100</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xl font-semibold text-white mb-3">
                    Description détaillée *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    placeholder="Décrivez votre produit en détail : état, caractéristiques, défauts éventuels, raison de la vente..."
                    rows={6}
                    className="w-full p-4 bg-white/10 border border-white/30 rounded-2xl text-white text-lg placeholder:text-white/50 focus:border-senegal-yellow focus:ring-4 focus:ring-senegal-yellow/20 transition-all duration-300 resize-none"
                    maxLength={2000}
                  />
                  <div className="flex justify-between text-sm text-primary-200 mt-2">
                    <span>Minimum 20 caractères</span>
                    <span>{formData.description.length}/2000</span>
                  </div>
                </div>

                {selectedCategory && (
                  <div className="bg-white/5 border border-white/20 rounded-2xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-senegal-yellow rounded-xl flex items-center justify-center text-xl">
                        {selectedCategory.icon}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Catégorie sélectionnée</h3>
                        <p className="text-primary-200">{selectedCategory.name}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ÉTAPE 3: Photos & Prix */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Photos et prix
                </h2>
                <p className="text-xl text-primary-200">
                  De belles photos et un prix juste garantissent une vente rapide
                </p>
              </div>

              <div className="space-y-6">
                {/* Upload photos */}
                <div>
                  <label className="block text-xl font-semibold text-white mb-3">
                    Photos (jusqu'à 5 images) *
                  </label>
                  
                  <div
                    className={`border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
                      dragActive 
                        ? 'border-senegal-yellow bg-senegal-yellow/10' 
                        : 'border-white/30 hover:border-white/50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFiles(e.target.files)}
                      className="hidden"
                    />
                    
                    <div className="text-center">
                      <PhotoIcon className="w-16 h-16 text-white/50 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Glissez vos photos ici
                      </h3>
                      <p className="text-primary-200 mb-4">
                        ou cliquez pour sélectionner (JPG, PNG, WebP - max 5MB chacune)
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-6 py-3 rounded-xl transition-all duration-300"
                      >
                        Choisir des fichiers
                      </button>
                    </div>
                  </div>

                  {/* Preview des images */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {formData.images.map((image) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-32 object-cover rounded-xl"
                          />
                          <button
                            onClick={() => removeImage(image.id)}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Progress upload */}
                  {Object.keys(uploadProgress).length > 0 && (
                    <div className="space-y-2 mt-4">
                      {Object.entries(uploadProgress).map(([id, progress]) => (
                        <div key={id} className="bg-white/10 rounded-full h-2">
                          <div 
                            className="bg-senegal-yellow h-full rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Prix */}
                <div>
                  <label className="block text-xl font-semibold text-white mb-3">
                    Prix de vente *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => updateFormData('price', e.target.value)}
                      placeholder="25000"
                      min="0"
                      step="500"
                      className="w-full p-4 bg-white/10 border border-white/30 rounded-2xl text-white text-lg placeholder:text-white/50 focus:border-senegal-yellow focus:ring-4 focus:ring-senegal-yellow/20 transition-all duration-300 pr-20"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white font-semibold">
                      FCFA
                    </span>
                  </div>
                  <p className="text-primary-200 text-sm mt-2">
                    💡 Conseil : Vérifiez les prix similaires pour être compétitif
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 4: Paiement */}
          {currentStep === 4 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Finaliser et payer
                </h2>
                <p className="text-xl text-primary-200">
                  Dernière étape : payez 200 FCFA pour publier votre annonce
                </p>
              </div>

              <div className="space-y-6">
                {/* Résumé de l'annonce */}
                <div className="bg-white/5 border border-white/20 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">📋 Résumé de votre annonce</h3>
                  <div className="space-y-3 text-primary-200">
                    <div><strong>Titre :</strong> {formData.title}</div>
                    <div><strong>Catégorie :</strong> {selectedCategory?.name}</div>
                    <div><strong>Région :</strong> {formData.region}</div>
                    <div><strong>Prix :</strong> {formData.price ? parseInt(formData.price).toLocaleString() : '0'} FCFA</div>
                    <div><strong>Photos :</strong> {formData.images.length} image(s)</div>
                  </div>
                </div>

                {/* Numéro de téléphone */}
                <div>
                  <label className="block text-xl font-semibold text-white mb-3">
                    Numéro de téléphone pour paiement *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    placeholder="+221 77 123 45 67"
                    className="w-full p-4 bg-white/10 border border-white/30 rounded-2xl text-white text-lg placeholder:text-white/50 focus:border-senegal-yellow focus:ring-4 focus:ring-senegal-yellow/20 transition-all duration-300"
                  />
                  <p className="text-primary-200 text-sm mt-2">
                    Ce numéro sera utilisé pour le paiement Orange Money
                  </p>
                </div>

                {/* Méthode de paiement */}
                <div>
                  <label className="block text-xl font-semibold text-white mb-3">
                    Méthode de paiement
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: 'orange_money', name: 'Orange Money', icon: '🧡', popular: true },
                      { id: 'wave', name: 'Wave', icon: '💙', popular: false },
                      { id: 'free_money', name: 'Free Money', icon: '💚', popular: false }
                    ].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                          paymentMethod === method.id
                            ? 'border-senegal-yellow bg-senegal-yellow/20'
                            : 'border-white/30 bg-white/5 hover:border-white/50'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-2">{method.icon}</div>
                          <div className="text-white font-semibold">{method.name}</div>
                        </div>
                        {method.popular && (
                          <div className="absolute -top-2 -right-2 bg-senegal-yellow text-gray-900 text-xs px-2 py-1 rounded-full font-semibold">
                            Populaire
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prix final */}
                <div className="bg-gradient-to-r from-senegal-yellow/20 to-senegal-green/20 border-2 border-senegal-yellow/30 rounded-2xl p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-bold text-white">Prix à payer</h3>
                      <p className="text-primary-200">Publication de votre annonce</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-senegal-yellow">200 FCFA</div>
                      <div className="text-primary-200 text-sm">Prix unique</div>
                    </div>
                  </div>
                </div>

                {/* Conditions */}
                <div className="bg-white/5 border border-white/20 rounded-2xl p-4">
                  <p className="text-primary-200 text-sm">
                    ✅ En publiant cette annonce, vous acceptez nos conditions d'utilisation<br/>
                    ✅ Votre annonce sera visible pendant 30 jours<br/>
                    ✅ Vous pouvez la modifier ou supprimer à tout moment
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Erreur d'envoi */}
          {submitError && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mt-6">
              <p className="text-red-200">❌ {submitError}</p>
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
                    ? 'bg-gradient-to-r from-senegal-yellow to-senegal-green text-gray-900 hover:shadow-lg hover:shadow-senegal-yellow/50 transform hover:scale-105'
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
                    ? 'bg-gradient-to-r from-senegal-yellow to-senegal-green text-gray-900 hover:shadow-lg hover:shadow-senegal-yellow/50 transform hover:scale-105'
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Publication en cours...</span>
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