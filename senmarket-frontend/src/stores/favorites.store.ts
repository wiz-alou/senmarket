// 🔧 FAVORITES STORE BASÉ SUR L'UTILISATEUR
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
  addFavorite: (listingId: string, listingData?: Partial<FavoriteListing>) => void;
  removeFavorite: (listingId: string) => void;
  isFavorite: (listingId: string) => boolean;
  
  // Récupération
  getFavorites: () => string[];
  getFavoriteListings: () => FavoriteListing[];
  
  // Utilitaires
  clearUserFavorites: () => void;
  clearAllFavorites: () => void;
  debugFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState & FavoritesActions>()(
  persist(
    (set, get) => ({
      // État initial
      favoritesByUser: {},
      favoritesData: {},
      currentUserId: null,

      // ✅ DÉFINIR L'UTILISATEUR ACTUEL
      setCurrentUser: (userId) => {
        console.log('👤 setCurrentUser appelé:', userId);
        set({ currentUserId: userId });
        
        if (userId) {
          // Initialiser les favoris pour cet utilisateur s'ils n'existent pas
          const state = get();
          if (!state.favoritesByUser[userId]) {
            set(prev => ({
              favoritesByUser: {
                ...prev.favoritesByUser,
                [userId]: []
              }
            }));
            console.log('✅ Favoris initialisés pour user:', userId);
          } else {
            console.log('📋 Favoris existants pour user:', userId, '→', state.favoritesByUser[userId].length, 'items');
          }
        }
      },

      // ✅ AJOUTER AUX FAVORIS
      addFavorite: (listingId, listingData) => {
        const { currentUserId } = get();
        
        if (!currentUserId) {
          console.warn('⚠️ Impossible d\'ajouter aux favoris : utilisateur non connecté');
          return;
        }

        console.log('❤️ Ajout favori:', listingId, 'pour user:', currentUserId);

        set(prev => {
          const userFavorites = prev.favoritesByUser[currentUserId] || [];
          
          // Éviter les doublons
          if (userFavorites.includes(listingId)) {
            console.log('ℹ️ Déjà en favoris');
            return prev;
          }

          const newUserFavorites = [...userFavorites, listingId];
          
          return {
            favoritesByUser: {
              ...prev.favoritesByUser,
              [currentUserId]: newUserFavorites
            },
            favoritesData: listingData ? {
              ...prev.favoritesData,
              [listingId]: {
                id: listingId,
                addedAt: new Date().toISOString(),
                ...listingData
              } as FavoriteListing
            } : prev.favoritesData
          };
        });
      },

      // ✅ RETIRER DES FAVORIS
      removeFavorite: (listingId) => {
        const { currentUserId } = get();
        
        if (!currentUserId) {
          console.warn('⚠️ Impossible de retirer des favoris : utilisateur non connecté');
          return;
        }

        console.log('💔 Retrait favori:', listingId, 'pour user:', currentUserId);

        set(prev => {
          const userFavorites = prev.favoritesByUser[currentUserId] || [];
          const newUserFavorites = userFavorites.filter(id => id !== listingId);
          
          return {
            favoritesByUser: {
              ...prev.favoritesByUser,
              [currentUserId]: newUserFavorites
            },
            // Garder les données pour les autres utilisateurs
            favoritesData: prev.favoritesData
          };
        });
      },

      // ✅ VÉRIFIER SI C'EST UN FAVORI
      isFavorite: (listingId) => {
        const { currentUserId, favoritesByUser } = get();
        
        if (!currentUserId) return false;
        
        const userFavorites = favoritesByUser[currentUserId] || [];
        return userFavorites.includes(listingId);
      },

      // ✅ RÉCUPÉRER LES IDs DES FAVORIS
      getFavorites: () => {
        const { currentUserId, favoritesByUser } = get();
        
        if (!currentUserId) return [];
        
        return favoritesByUser[currentUserId] || [];
      },

      // ✅ RÉCUPÉRER LES DONNÉES COMPLÈTES DES FAVORIS
      getFavoriteListings: () => {
        const { currentUserId, favoritesByUser, favoritesData } = get();
        
        if (!currentUserId) return [];
        
        const userFavorites = favoritesByUser[currentUserId] || [];
        
        return userFavorites
          .map(id => favoritesData[id])
          .filter(Boolean) // Filtrer les undefined
          .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
      },

      // ✅ VIDER LES FAVORIS DE L'UTILISATEUR ACTUEL
      clearUserFavorites: () => {
        const { currentUserId } = get();
        
        if (!currentUserId) return;

        console.log('🧹 Nettoyage favoris pour user:', currentUserId);

        set(prev => ({
          favoritesByUser: {
            ...prev.favoritesByUser,
            [currentUserId]: []
          }
        }));
      },

      // ✅ VIDER TOUS LES FAVORIS (DANGER)
      clearAllFavorites: () => {
        console.log('💀 Nettoyage COMPLET des favoris');
        set({
          favoritesByUser: {},
          favoritesData: {},
        });
      },

      // ✅ DEBUG
      debugFavorites: () => {
        const state = get();
        console.log('🔍 === DEBUG FAVORIS ===');
        console.log('- Current User ID:', state.currentUserId);
        console.log('- Favorites by user:', state.favoritesByUser);
        console.log('- Favorites data keys:', Object.keys(state.favoritesData));
        
        if (state.currentUserId) {
          const userFavs = state.favoritesByUser[state.currentUserId] || [];
          console.log(`- Favoris pour ${state.currentUserId}:`, userFavs);
        }
      }
    }),
    {
      name: 'senmarket-favorites',
      // ✅ GARDER SEULEMENT LES DONNÉES IMPORTANTES
      partialize: (state) => ({
        favoritesByUser: state.favoritesByUser,
        favoritesData: state.favoritesData,
        // Ne pas persister currentUserId - sera défini par l'auth
      }),
    }
  )
);

// ✅ TYPES POUR EXPORT
export type { FavoriteListing };