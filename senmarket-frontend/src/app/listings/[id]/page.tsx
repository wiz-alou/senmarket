'use client';

import React, { useState, useEffect } from 'react';

const ListingDetailPage = () => {
  // Composants d'icônes personnalisés
  const PhotoIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  );

  const HeartIcon = ({ className, filled = false }) => (
    <svg className={className} fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  );

  const ShareIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.935-2.186 2.25 2.25 0 0 0-3.935 2.186Z" />
    </svg>
  );

  const EyeIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );

  const PhoneIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </svg>
  );

  const ChatBubbleIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
    </svg>
  );

  const MapPinIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );

  const StarIcon = ({ className, filled = false }) => (
    <svg className={className} fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.563.563 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
  );

  const ShieldCheckIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );

  const ChevronLeftIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  );

  const ChevronRightIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );

  const ArrowLeftIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  );

  // États
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Données simulées de l'annonce
  const listing = {
    id: '1',
    title: 'iPhone 15 Pro Max 256GB - État neuf avec garantie',
    price: 750000,
    images: [
      '/api/placeholder/800/600',
      '/api/placeholder/800/600',
      '/api/placeholder/800/600',
      '/api/placeholder/800/600',
      '/api/placeholder/800/600'
    ],
    description: `iPhone 15 Pro Max 256GB en parfait état, utilisé seulement 2 mois. Acheté à Orange Store avec facture d'origine. Livré avec tous les accessoires d'origine : chargeur USB-C, câble, écouteurs EarPods.

**Caractéristiques :**
• Écran Super Retina XDR 6,7 pouces
• Processeur A17 Pro avec GPU 6 cœurs
• Appareil photo principal 48 Mpx
• Zoom optique 5x
• Résistant à l'eau IP68
• Batterie excellente autonomie

**État :** Comme neuf, aucune rayure, protection écran depuis l'achat
**Garantie :** 10 mois restants
**Raison de vente :** Upgrade vers modèle professionnel

Vendu avec facture et boîte d'origine. Possibilité de test avant achat.`,
    location: 'Dakar - Plateau',
    category: 'Électronique',
    views: 324,
    likes: 45,
    createdAt: '2025-06-14T10:00:00Z',
    seller: {
      name: 'Amadou Diallo',
      avatar: '/api/placeholder/80/80',
      phone: '+221 77 123 45 67',
      email: 'amadou.diallo@email.com',
      verified: true,
      rating: 4.9,
      totalSales: 127,
      responseTime: '< 1h',
      memberSince: '2023-03-15',
      location: 'Dakar'
    },
    specifications: [
      { label: 'Marque', value: 'Apple' },
      { label: 'Modèle', value: 'iPhone 15 Pro Max' },
      { label: 'Stockage', value: '256GB' },
      { label: 'Couleur', value: 'Titane naturel' },
      { label: 'État', value: 'Comme neuf' },
      { label: 'Garantie', value: '10 mois restants' }
    ]
  };

  // Annonces similaires
  const similarListings = [
    {
      id: '2',
      title: 'iPhone 14 Pro 128GB',
      price: 580000,
      image: '/api/placeholder/300/200',
      location: 'Dakar - Almadies'
    },
    {
      id: '3',
      title: 'Samsung Galaxy S24 Ultra',
      price: 680000,
      image: '/api/placeholder/300/200',
      location: 'Thiès'
    },
    {
      id: '4',
      title: 'iPhone 13 Pro Max',
      price: 520000,
      image: '/api/placeholder/300/200',
      location: 'Dakar - Point E'
    }
  ];

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? listing.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => 
      prev === listing.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleCallSeller = () => {
    window.open(`tel:${listing.seller.phone}`, '_self');
  };

  const handleWhatsApp = () => {
    const message = `Bonjour, je suis intéressé par votre annonce "${listing.title}" sur SenMarket`;
    const phone = listing.seller.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleEmailSeller = () => {
    const subject = `Intérêt pour votre annonce: ${listing.title}`;
    const body = `Bonjour ${listing.seller.name},\n\nJe suis intéressé par votre annonce "${listing.title}" publiée sur SenMarket.\n\nPouvez-vous me donner plus d'informations ?\n\nCordialement`;
    window.open(`mailto:${listing.seller.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec retour */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Retour</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-full transition-all duration-300 ${
                  isLiked 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <HeartIcon className="w-6 h-6" filled={isLiked} />
              </button>
              
              <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                <ShareIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Colonne principale - Images et description */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Galerie d'images */}
            <div className={`bg-white rounded-3xl shadow-lg overflow-hidden ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <div className="relative">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={listing.images[currentImageIndex]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Navigation images */}
                  {listing.images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300"
                      >
                        <ChevronLeftIcon className="w-6 h-6" />
                      </button>
                      
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300"
                      >
                        <ChevronRightIcon className="w-6 h-6" />
                      </button>
                      
                      {/* Indicateurs */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                        {listing.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                              index === currentImageIndex 
                                ? 'bg-white scale-125' 
                                : 'bg-white/60 hover:bg-white/80'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  
                  {/* Badge nombre d'images */}
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                    {currentImageIndex + 1} / {listing.images.length}
                  </div>
                </div>
                
                {/* Miniatures */}
                {listing.images.length > 1 && (
                  <div className="p-4 border-t">
                    <div className="flex space-x-3 overflow-x-auto">
                      {listing.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                            index === currentImageIndex 
                              ? 'border-green-500 scale-105' 
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Informations principales */}
            <div className={`bg-white rounded-3xl shadow-lg p-8 ${isVisible ? 'animate-fade-in-up animate-delayed' : 'opacity-0'}`}>
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                      {listing.category}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {formatTimeAgo(listing.createdAt)}
                    </span>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {listing.title}
                  </h1>
                  
                  <div className="flex items-center space-x-6 text-gray-600">
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="w-5 h-5" />
                      <span>{listing.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <EyeIcon className="w-5 h-5" />
                      <span>{listing.views.toLocaleString()} vues</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <HeartIcon className="w-5 h-5" />
                      <span>{listing.likes} favoris</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {listing.price.toLocaleString()} FCFA
                  </div>
                  <div className="text-gray-500">
                    Prix ferme
                  </div>
                </div>
              </div>

              {/* Spécifications */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Caractéristiques</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {listing.specifications.map((spec, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4">
                      <div className="text-sm text-gray-600 mb-1">{spec.label}</div>
                      <div className="font-semibold text-gray-900">{spec.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
                <div className="prose prose-gray max-w-none">
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                    {listing.description}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Vendeur et contact */}
          <div className="space-y-6">
            
            {/* Informations vendeur */}
            <div className={`bg-white rounded-3xl shadow-lg p-6 ${isVisible ? 'animate-fade-in-up animate-delayed-2' : 'opacity-0'}`}>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Vendeur</h3>
              
              <div className="flex items-start space-x-4 mb-6">
                <div className="relative">
                  <img
                    src={listing.seller.avatar}
                    alt={listing.seller.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  {listing.seller.verified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <ShieldCheckIcon className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    {listing.seller.name}
                  </h4>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className="w-4 h-4 text-yellow-500"
                          filled={i < Math.floor(listing.seller.rating)}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{listing.seller.rating}</span>
                    <span className="text-sm text-gray-500">({listing.seller.totalSales} ventes)</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>📍 {listing.seller.location}</div>
                    <div>⏱️ Répond en {listing.seller.responseTime}</div>
                    <div>📅 Membre depuis {new Date(listing.seller.memberSince).getFullYear()}</div>
                  </div>
                </div>
              </div>

              {/* Boutons de contact */}
              <div className="space-y-3">
                <button
                  onClick={handleCallSeller}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 transform hover:scale-105"
                >
                  <PhoneIcon className="w-5 h-5" />
                  <span>Appeler maintenant</span>
                </button>
                
                <button
                  onClick={handleWhatsApp}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 transform hover:scale-105"
                >
                  <ChatBubbleIcon className="w-5 h-5" />
                  <span>WhatsApp</span>
                </button>
                
                <button
                  onClick={handleEmailSeller}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 21.75 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                  <span>Envoyer un email</span>
                </button>
                
                <button
                  onClick={() => setShowContactInfo(!showContactInfo)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-2xl transition-all duration-300"
                >
                  {showContactInfo ? 'Masquer les infos' : 'Voir les infos de contact'}
                </button>
                
                {showContactInfo && (
                  <div className="bg-gray-50 rounded-2xl p-4 mt-3 animate-fade-in-up">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <PhoneIcon className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{listing.seller.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 21.75 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                        </svg>
                        <span>{listing.seller.email}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Conseils sécurité */}
            <div className={`bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-3xl p-6 ${isVisible ? 'animate-fade-in-up animate-delayed-3' : 'opacity-0'}`}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ShieldCheckIcon className="w-5 h-5 text-yellow-600 mr-2" />
                Conseils de sécurité
              </h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Rencontrez le vendeur dans un lieu public</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Vérifiez l'article avant le paiement</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Utilisez Orange Money pour sécuriser la transaction</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Méfiez-vous des prix trop attractifs</span>
                </li>
              </ul>
            </div>

            {/* Signaler l'annonce */}
            <div className={`bg-white rounded-3xl shadow-lg p-6 ${isVisible ? 'animate-fade-in-up animate-delayed-4' : 'opacity-0'}`}>
              <button className="w-full text-red-600 hover:text-red-700 font-medium py-2 text-sm transition-colors">
                🚨 Signaler cette annonce
              </button>
            </div>
          </div>
        </div>

        {/* Annonces similaires */}
        <div className={`mt-16 ${isVisible ? 'animate-fade-in-up animate-delayed-4' : 'opacity-0'}`}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Annonces similaires</h2>
            <button
              onClick={() => window.location.href = '/listings?category=' + listing.category}
              className="text-green-600 hover:text-green-700 font-medium flex items-center space-x-2 transition-colors"
            >
              <span>Voir tout</span>
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarListings.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                onClick={() => window.location.href = `/listings/${item.id}`}
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {item.price.toLocaleString()} FCFA
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    {item.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to action sticky */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden">
          <div className="flex space-x-3">
            <button
              onClick={handleCallSeller}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <PhoneIcon className="w-5 h-5" />
              <span>Appeler</span>
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <ChatBubbleIcon className="w-5 h-5" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`px-4 py-3 rounded-xl transition-all duration-300 ${
                isLiked 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <HeartIcon className="w-6 h-6" filled={isLiked} />
            </button>
          </div>
        </div>
      </div>

      {/* Styles CSS personnalisés */}
      <style jsx>{`
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
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .prose {
          max-width: none;
        }
      `}</style>
    </div>
  );
};

export default ListingDetailPage;