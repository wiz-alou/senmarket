'use client';

import React, { useState, useEffect } from 'react';

const DashboardPage = () => {
  // Composants d'icônes personnalisés
  const ChartBarIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  );

  const CurrencyDollarIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );

  const EyeIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );

  const DocumentIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );

  const PlusIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );

  const PencilIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  );

  const TrashIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );

  const UserIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );

  const Cog6ToothIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );

  const MapPinIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );

  const ClockIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );

  const CheckIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );

  // États
  const [activeTab, setActiveTab] = useState('overview');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Données simulées utilisateur
  const userData = {
    name: 'Amadou Diallo',
    email: 'amadou.diallo@email.com',
    phone: '+221 77 123 45 67',
    avatar: '/api/placeholder/100/100',
    verified: true,
    memberSince: '2023-03-15',
    location: 'Dakar',
    rating: 4.9,
    totalSales: 127
  };

  // Statistiques
  const stats = {
    totalListings: 24,
    activeListings: 8,
    soldListings: 12,
    draftListings: 4,
    totalViews: 3247,
    totalPayments: 16,
    completedPayments: 14,
    totalRevenue: 3200,
    thisMonthRevenue: 800,
    avgResponseTime: '< 2h'
  };

  // Mes annonces
  const myListings = [
    {
      id: '1',
      title: 'iPhone 15 Pro Max 256GB',
      price: 750000,
      image: '/api/placeholder/300/200',
      status: 'active',
      views: 324,
      likes: 45,
      createdAt: '2025-06-14T10:00:00Z',
      category: 'Électronique'
    },
    {
      id: '2',
      title: 'MacBook Pro M3 16"',
      price: 2200000,
      image: '/api/placeholder/300/200',
      status: 'active',
      views: 156,
      likes: 23,
      createdAt: '2025-06-13T15:30:00Z',
      category: 'Électronique'
    },
    {
      id: '3',
      title: 'Mercedes-Benz E300 2022',
      price: 35000000,
      image: '/api/placeholder/300/200',
      status: 'sold',
      views: 892,
      likes: 67,
      createdAt: '2025-06-10T09:15:00Z',
      category: 'Véhicules'
    },
    {
      id: '4',
      title: 'Appartement 3 chambres',
      price: 45000000,
      image: '/api/placeholder/300/200',
      status: 'draft',
      views: 0,
      likes: 0,
      createdAt: '2025-06-15T14:20:00Z',
      category: 'Immobilier'
    }
  ];

  // Historique paiements
  const paymentHistory = [
    {
      id: '1',
      amount: 200,
      date: '2025-06-14T10:00:00Z',
      status: 'completed',
      method: 'orange_money',
      listing: 'iPhone 15 Pro Max 256GB',
      transactionId: 'OM2025061401'
    },
    {
      id: '2',
      amount: 200,
      date: '2025-06-13T15:30:00Z',
      status: 'completed',
      method: 'orange_money',
      listing: 'MacBook Pro M3 16"',
      transactionId: 'OM2025061302'
    },
    {
      id: '3',
      amount: 200,
      date: '2025-06-10T09:15:00Z',
      status: 'completed',
      method: 'wave',
      listing: 'Mercedes-Benz E300 2022',
      transactionId: 'WV2025061003'
    }
  ];

  const getStatusBadge = (status) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      sold: 'bg-blue-100 text-blue-800',
      expired: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      active: 'Actif',
      draft: 'Brouillon',
      sold: 'Vendu',
      expired: 'Expiré'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'orange_money': return '🟠';
      case 'wave': return '🌊';
      case 'free_money': return '💳';
      default: return '💰';
    }
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

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: ChartBarIcon },
    { id: 'listings', label: 'Mes annonces', icon: DocumentIcon },
    { id: 'payments', label: 'Paiements', icon: CurrencyDollarIcon },
    { id: 'profile', label: 'Profil', icon: UserIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/'}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Accueil
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Mon Dashboard</h1>
            </div>
            
            <button
              onClick={() => window.location.href = '/listings/create'}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Nouvelle annonce</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profil utilisateur */}
        <div className={`bg-white rounded-3xl shadow-lg p-8 mb-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={userData.avatar}
                alt={userData.name}
                className="w-24 h-24 rounded-full object-cover"
              />
              {userData.verified && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckIcon className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{userData.name}</h2>
              <div className="flex items-center space-x-6 text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{userData.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>Membre depuis {new Date(userData.memberSince).getFullYear()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>⭐ {userData.rating}</span>
                  <span>({userData.totalSales} ventes)</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  📧 {userData.email}
                </div>
                <div className="text-sm text-gray-600">
                  📞 {userData.phone}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setActiveTab('profile')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2"
            >
              <Cog6ToothIcon className="w-5 h-5" />
              <span>Modifier</span>
            </button>
          </div>
        </div>

        {/* Navigation onglets */}
        <div className={`bg-white rounded-3xl shadow-lg mb-8 ${isVisible ? 'animate-fade-in-up animate-delayed' : 'opacity-0'}`}>
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className={`${isVisible ? 'animate-fade-in-up animate-delayed-2' : 'opacity-0'}`}>
          
          {/* Vue d'ensemble */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Statistiques principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <DocumentIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{stats.totalListings}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Total annonces</h3>
                  <p className="text-sm text-gray-600">Toutes vos annonces</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{stats.activeListings}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Annonces actives</h3>
                  <p className="text-sm text-gray-600">En ligne actuellement</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <EyeIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Total vues</h3>
                  <p className="text-sm text-gray-600">Sur toutes vos annonces</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <CurrencyDollarIcon className="w-6 h-6 text-yellow-600" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{stats.thisMonthRevenue.toLocaleString()}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Revenus du mois</h3>
                  <p className="text-sm text-gray-600">FCFA dépensés</p>
                </div>
              </div>

              {/* Performance et activité */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Performance</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Taux de conversion</span>
                      <span className="font-semibold text-green-600">12.3%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Temps de réponse moyen</span>
                      <span className="font-semibold text-blue-600">{stats.avgResponseTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Annonces vendues</span>
                      <span className="font-semibold text-purple-600">{stats.soldListings}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Note moyenne</span>
                      <span className="font-semibold text-yellow-600">⭐ {userData.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Activité récente</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-xl">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Nouvelle annonce publiée</p>
                        <p className="text-sm text-gray-600">iPhone 15 Pro Max 256GB</p>
                        <p className="text-xs text-gray-500">Il y a 2h</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-xl">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Paiement reçu</p>
                        <p className="text-sm text-gray-600">200 FCFA - Orange Money</p>
                        <p className="text-xs text-gray-500">Il y a 1 jour</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mes annonces */}
          {activeTab === 'listings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">Mes annonces ({myListings.length})</h3>
                  <button
                    onClick={() => window.location.href = '/listings/create'}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Nouvelle annonce</span>
                  </button>
                </div>
              </div>

              {/* Liste des annonces */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {myListings.map((listing) => (
                  <div key={listing.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="relative">
                      <img
                        src={listing.image}
                        alt={listing.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        {getStatusBadge(listing.status)}
                      </div>
                      <div className="absolute top-4 right-4 flex space-x-2">
                        <button className="w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h4 className="font-semibold text-gray-900 text-lg mb-3 line-clamp-2">
                        {listing.title}
                      </h4>
                      
                      <div className="text-2xl font-bold text-green-600 mb-3">
                        {listing.price.toLocaleString()} FCFA
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <span className="bg-gray-100 px-2 py-1 rounded-full">
                          {listing.category}
                        </span>
                        <span>{formatTimeAgo(listing.createdAt)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <EyeIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{listing.views}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-red-500">❤️</span>
                            <span className="text-gray-600">{listing.likes}</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => window.location.href = `/listings/${listing.id}`}
                          className="text-green-600 hover:text-green-700 font-medium transition-colors"
                        >
                          Voir →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Paiements */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              {/* Résumé financier */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString()}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Total dépensé</h3>
                  <p className="text-sm text-gray-600">FCFA sur {stats.completedPayments} paiements</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <CheckIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{stats.completedPayments}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Paiements réussis</h3>
                  <p className="text-sm text-gray-600">Sur {stats.totalPayments} tentatives</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <span className="text-xl">🟠</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{stats.thisMonthRevenue}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Ce mois</h3>
                  <p className="text-sm text-gray-600">FCFA dépensés en juin</p>
                </div>
              </div>

              {/* Historique des paiements */}
              <div className="bg-white rounded-3xl shadow-lg">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900">Historique des paiements</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Annonce</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Méthode</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paymentHistory.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(payment.date).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="max-w-xs truncate">{payment.listing}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {payment.amount} FCFA
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{getPaymentMethodIcon(payment.method)}</span>
                              <span className="capitalize">{payment.method.replace('_', ' ')}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Complété
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Profil */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Informations personnelles</h3>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                      <input
                        type="text"
                        defaultValue="Amadou"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                      <input
                        type="text"
                        defaultValue="Diallo"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue={userData.email}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                    <input
                      type="tel"
                      defaultValue={userData.phone}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Membre depuis {new Date(userData.memberSince).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white transition-colors"
                      >
                        Sauvegarder
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Paramètres de sécurité */}
              <div className="bg-white rounded-3xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Sécurité</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-900">Vérification par téléphone</h4>
                      <p className="text-sm text-gray-600">Votre numéro est vérifié</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckIcon className="w-5 h-5 text-green-600" />
                      <span className="text-green-600 font-medium">Vérifié</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-900">Vérification email</h4>
                      <p className="text-sm text-gray-600">Votre email est vérifié</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckIcon className="w-5 h-5 text-green-600" />
                      <span className="text-green-600 font-medium">Vérifié</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-900">Changer le mot de passe</h4>
                      <p className="text-sm text-gray-600">Dernière modification il y a 3 mois</p>
                    </div>
                    <button className="text-green-600 hover:text-green-700 font-medium transition-colors">
                      Modifier
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;