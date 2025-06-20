// 🔧 STORE FAVORIS CORRIGÉ - SPÉCIFIQUE PAR UTILISATEUR
// src/stores/favorites.store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Listing } from '@/lib/api/types';

interface FavoritesState {
  favorites: string[]; // IDs des annonces favorites
  favoritesData: Record<string, Listing>; // Cache des données complètes
  currentUserId: string | null; // ✅ ID de l'utilisateur actuel
}

interface FavoritesActions {
  addFavorite: (listingId: string, listing: Listing) => void;
  removeFavorite: (listingId: string) => void;
  toggleFavorite: (listingId: string, listing: Listing) => void;
  isFavorite: (listingId: string) => boolean;
  clearFavorites: () => void;
  getFavoriteListings: () => Listing[];
  setCurrentUser: (userId: string | null) => void; // ✅ Changer d'utilisateur
  debugFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState & FavoritesActions>()(
  persist(
    (set, get) => ({
      // État initial
      favorites: [],
      favoritesData: {},
      currentUserId: null,

      // ✅ FONCTION POUR CHANGER D'UTILISATEUR
      setCurrentUser: (userId) => {
        const state = get();
        
        // Si on change d'utilisateur, on sauvegarde les favoris actuels et on charge les nouveaux
        if (state.currentUserId !== userId) {
          console.log('🔄 Changement utilisateur:', state.currentUserId, '→', userId);
          
          // Sauvegarder les favoris de l'utilisateur précédent
          if (state.currentUserId) {
            const userKey = `favorites_${state.currentUserId}`;
            localStorage.setItem(userKey, JSON.stringify({
              favorites: state.favorites,
              favoritesData: state.favoritesData
            }));
          }
          
          // Charger les favoris du nouvel utilisateur
          let newFavorites: string[] = [];
          let newFavoritesData: Record<string, Listing> = {};
          
          if (userId) {
            const userKey = `favorites_${userId}`;
            const savedUserFavorites = localStorage.getItem(userKey);
            
            if (savedUserFavorites) {
              try {
                const parsed = JSON.parse(savedUserFavorites);
                newFavorites = parsed.favorites || [];
                newFavoritesData = parsed.favoritesData || {};
                console.log('📋 Favoris chargés pour', userId, ':', newFavorites.length);
              } catch (error) {
                console.error('❌ Erreur parsing favoris utilisateur:', error);
              }
            }
          }
          
          set({
            currentUserId: userId,
            favorites: newFavorites,
            favoritesData: newFavoritesData
          });
        }
      },

      // ✅ ACTIONS AMÉLIORÉES AVEC VÉRIFICATION UTILISATEUR
      addFavorite: (listingId, listing) => {
        const { favorites, favoritesData, currentUserId } = get();
        
        if (!currentUserId) {
          console.warn('⚠️ Impossible d\'ajouter aux favoris: utilisateur non connecté');
          return;
        }
        
        if (!favorites.includes(listingId)) {
          console.log('➕ Ajout favori pour', currentUserId, ':', listing.title);
          const newState = {
            favorites: [...favorites, listingId],
            favoritesData: { ...favoritesData, [listingId]: listing }
          };
          
          set(newState);
          
          // Sauvegarder immédiatement pour cet utilisateur
          const userKey = `favorites_${currentUserId}`;
          localStorage.setItem(userKey, JSON.stringify(newState));
        }
      },

      removeFavorite: (listingId) => {
        const { favorites, favoritesData, currentUserId } = get();
        
        if (!currentUserId) {
          console.warn('⚠️ Impossible de supprimer des favoris: utilisateur non connecté');
          return;
        }
        
        const newFavoritesData = { ...favoritesData };
        delete newFavoritesData[listingId];
        
        console.log('➖ Suppression favori pour', currentUserId, ':', listingId);
        const newState = {
          favorites: favorites.filter(id => id !== listingId),
          favoritesData: newFavoritesData
        };
        
        set(newState);
        
        // Sauvegarder immédiatement pour cet utilisateur
        const userKey = `favorites_${currentUserId}`;
        localStorage.setItem(userKey, JSON.stringify(newState));
      },

      toggleFavorite: (listingId, listing) => {
        const { isFavorite, addFavorite, removeFavorite, currentUserId } = get();
        
        if (!currentUserId) {
          console.warn('⚠️ Impossible de toggle favoris: utilisateur non connecté');
          return;
        }
        
        if (isFavorite(listingId)) {
          removeFavorite(listingId);
        } else {
          addFavorite(listingId, listing);
        }
      },

      isFavorite: (listingId) => {
        const { favorites, currentUserId } = get();
        
        if (!currentUserId) {
          return false;
        }
        
        const isFav = favorites.includes(listingId);
        return isFav;
      },

      clearFavorites: () => {
        const { currentUserId } = get();
        
        if (!currentUserId) {
          console.warn('⚠️ Impossible de vider favoris: utilisateur non connecté');
          return;
        }
        
        console.log('🗑️ Suppression tous favoris pour', currentUserId);
        const newState = { favorites: [], favoritesData: {} };
        set(newState);
        
        // Supprimer de localStorage pour cet utilisateur
        const userKey = `favorites_${currentUserId}`;
        localStorage.removeItem(userKey);
      },

      getFavoriteListings: () => {
        const { favorites, favoritesData, currentUserId } = get();
        
        if (!currentUserId) {
          return [];
        }
        
        const listings = favorites
          .map(id => favoritesData[id])
          .filter(Boolean);
        
        return listings;
      },

      debugFavorites: () => {
        const state = get();
        console.log('🔍 === DEBUG FAVORIS ===');
        console.log('- Utilisateur actuel:', state.currentUserId);
        console.log('- Favorites IDs:', state.favorites);
        console.log('- Favorites Data keys:', Object.keys(state.favoritesData));
        console.log('- Complete listings:', state.getFavoriteListings());
        
        // Debug localStorage
        if (state.currentUserId) {
          const userKey = `favorites_${state.currentUserId}`;
          const stored = localStorage.getItem(userKey);
          console.log('- LocalStorage pour cet user:', stored ? JSON.parse(stored) : 'Vide');
        }
        console.log('========================');
      }
    }),
    {
      name: 'senmarket-favorites', // ✅ Gardé pour compatibilité
      // ✅ FONCTION DE TRANSFORMATION POUR MIGRATION
      migrate: (persistedState: any, version: number) => {
        console.log('🔄 Migration favoris store, version:', version);
        
        // Si anciennes données sans utilisateur, on les garde temporairement
        if (persistedState && !persistedState.currentUserId && persistedState.favorites) {
          console.log('📦 Migration des anciens favoris détectée');
          return {
            ...persistedState,
            currentUserId: null // Sera défini lors de la connexion
          };
        }
        
        return persistedState;
      },
      version: 1
    }
  )
);

// ✅ HOOK POUR INITIALISER L'UTILISATEUR
export const useInitializeFavorites = () => {
  const setCurrentUser = useFavoritesStore(state => state.setCurrentUser);
  
  return {
    initializeUser: (userId: string | null) => {
      console.log('🚀 Initialisation favoris pour utilisateur:', userId);
      setCurrentUser(userId);
    }
  };
};