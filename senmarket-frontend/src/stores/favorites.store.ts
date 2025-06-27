// 🔧 FAVORITES STORE AVEC PERSISTENCE LOCALSTORAGE
// src/stores/favorites.store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoriteListing {
  id: string;
  title: string;
  price: number;
  currency: string;
  images: string[];
  region: string;
  addedAt: string;
  // Métadonnées pour optimiser l'affichage
  category?: {
    name: string;
    icon: string;
  };
  user?: {
    first_name: string;
    last_name: string;
  };
}

// ✅ STRUCTURE : Un objet avec les favoris par userId
interface FavoritesState {
  // Format: { "user-id-1": ["listing-id-1", "listing-id-2"], "user-id-2": [...] }
  favoritesByUser: Record<string, string[]>;
  
  // Format: { "listing-id-1": FavoriteListing, "listing-id-2": FavoriteListing }
  favoritesData: Record<string, FavoriteListing>;
  
  // Utilisateur actuellement connecté
  currentUserId: string | null;
}

interface FavoritesActions {
  // Gestion utilisateur
  setCurrentUser: (userId: string | null) => void;
  
  // Gestion favoris
  addFavorite: (listingId: string, listingData?: FavoriteListing) => void;
  removeFavorite: (listingId: string) => void;
  isFavorite: (listingId: string) => boolean;
  
  // Getters
  getFavorites: () => string[];
  getFavoriteListings: () => FavoriteListing[];
  getUserFavorites: (userId: string) => string[];
  
  // Actions utilisateur
  clearUserFavorites: () => void;
  clearAllFavorites: () => void;
  
  // Utils
  debugFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState & FavoritesActions>()(
  persist(
    (set, get) => ({
      // ✅ ÉTAT INITIAL
      favoritesByUser: {},
      favoritesData: {},
      currentUserId: null,

      // ✅ DÉFINIR L'UTILISATEUR ACTUEL
      setCurrentUser: (userId: string | null) => {
        console.log('👤 Changement utilisateur favoris:', get().currentUserId, '→', userId);
        set({ currentUserId: userId });
      },

      // ✅ AJOUTER UN FAVORI
      addFavorite: (listingId: string, listingData?: FavoriteListing) => {
        const { currentUserId, favoritesByUser, favoritesData } = get();
        
        if (!currentUserId) {
          console.warn('⚠️ Tentative d\'ajout favori sans utilisateur connecté');
          return;
        }

        // Vérifier si déjà en favori
        const userFavorites = favoritesByUser[currentUserId] || [];
        if (userFavorites.includes(listingId)) {
          console.log('ℹ️ Listing déjà en favori:', listingId);
          return;
        }

        console.log('❤️ Ajout favori:', listingId, 'pour utilisateur:', currentUserId);

        // Mettre à jour les favoris utilisateur
        const updatedFavoritesByUser = {
          ...favoritesByUser,
          [currentUserId]: [...userFavorites, listingId]
        };

        // Mettre à jour les données si fournies
        const updatedFavoritesData = listingData ? {
          ...favoritesData,
          [listingId]: {
            ...listingData,
            addedAt: new Date().toISOString()
          }
        } : favoritesData;

        set({
          favoritesByUser: updatedFavoritesByUser,
          favoritesData: updatedFavoritesData
        });
      },

      // ✅ RETIRER UN FAVORI
      removeFavorite: (listingId: string) => {
        const { currentUserId, favoritesByUser } = get();
        
        if (!currentUserId) {
          console.warn('⚠️ Tentative de retrait favori sans utilisateur connecté');
          return;
        }

        console.log('💔 Retrait favori:', listingId, 'pour utilisateur:', currentUserId);

        const userFavorites = favoritesByUser[currentUserId] || [];
        const updatedUserFavorites = userFavorites.filter(id => id !== listingId);

        set({
          favoritesByUser: {
            ...favoritesByUser,
            [currentUserId]: updatedUserFavorites
          }
        });
      },

      // ✅ VÉRIFIER SI EN FAVORI
      isFavorite: (listingId: string) => {
        const { currentUserId, favoritesByUser } = get();
        if (!currentUserId) return false;
        
        const userFavorites = favoritesByUser[currentUserId] || [];
        return userFavorites.includes(listingId);
      },

      // ✅ RÉCUPÉRER LES FAVORIS DE L'UTILISATEUR ACTUEL
      getFavorites: () => {
        const { currentUserId, favoritesByUser } = get();
        if (!currentUserId) return [];
        
        return favoritesByUser[currentUserId] || [];
      },

      // ✅ RÉCUPÉRER LES DONNÉES DES FAVORIS
      getFavoriteListings: () => {
        const { currentUserId, favoritesByUser, favoritesData } = get();
        if (!currentUserId) return [];

        const userFavorites = favoritesByUser[currentUserId] || [];
        return userFavorites
          .map(id => favoritesData[id])
          .filter(Boolean) // Filtrer les favoris sans données
          .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()); // Trier par date d'ajout
      },

      // ✅ RÉCUPÉRER LES FAVORIS D'UN UTILISATEUR SPÉCIFIQUE
      getUserFavorites: (userId: string) => {
        const { favoritesByUser } = get();
        return favoritesByUser[userId] || [];
      },

      // ✅ VIDER LES FAVORIS DE L'UTILISATEUR ACTUEL
      clearUserFavorites: () => {
        const { currentUserId, favoritesByUser } = get();
        
        if (!currentUserId) {
          console.warn('⚠️ Tentative de nettoyage favoris sans utilisateur connecté');
          return;
        }

        console.log('🧹 Nettoyage favoris utilisateur:', currentUserId);

        set({
          favoritesByUser: {
            ...favoritesByUser,
            [currentUserId]: []
          }
        });
      },

      // ✅ VIDER TOUS LES FAVORIS (UTILISÉ LORS DE LA DÉCONNEXION)
      clearAllFavorites: () => {
        console.log('🧹 Nettoyage complet favoris');
        
        set({
          favoritesByUser: {},
          favoritesData: {},
          currentUserId: null
        });
      },

      // ✅ DEBUG
      debugFavorites: () => {
        const state = get();
        console.log('🔍 === DEBUG FAVORIS ===');
        console.log('currentUserId:', state.currentUserId);
        console.log('favoritesByUser:', state.favoritesByUser);
        console.log('favoritesData keys:', Object.keys(state.favoritesData));
        console.log('Current user favorites:', state.getFavorites());
        console.log('Current user listings:', state.getFavoriteListings().length);
        console.log('======================');
      }
    }),
    {
      name: 'senmarket-favorites', // ✅ NOM UNIQUE POUR LOCALSTORAGE
      // ✅ CONFIGURATION PERSISTENCE
      partialize: (state) => ({
        favoritesByUser: state.favoritesByUser,
        favoritesData: state.favoritesData,
        // currentUserId sera géré par l'auth store
      }),
      // ✅ GESTION DES ERREURS DE PERSISTENCE
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('🔄 Favoris rechargés depuis localStorage');
          console.log('- Utilisateurs avec favoris:', Object.keys(state.favoritesByUser));
          console.log('- Données en cache:', Object.keys(state.favoritesData).length);
        }
      },
    }
  )
);