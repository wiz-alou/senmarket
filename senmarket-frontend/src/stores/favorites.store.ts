import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Listing } from '@/lib/api/types';

interface FavoritesState {
  favorites: string[]; // IDs des annonces favorites
  favoritesData: Record<string, Listing>; // Cache des données complètes
}

interface FavoritesActions {
  addFavorite: (listingId: string, listing?: Listing) => void;
  removeFavorite: (listingId: string) => void;
  toggleFavorite: (listingId: string, listing?: Listing) => void;
  isFavorite: (listingId: string) => boolean;
  clearFavorites: () => void;
  getFavoriteListings: () => Listing[];
}

export const useFavoritesStore = create<FavoritesState & FavoritesActions>()(
  persist(
    (set, get) => ({
      // État initial
      favorites: [],
      favoritesData: {},

      // Actions
      addFavorite: (listingId, listing) => {
        const { favorites, favoritesData } = get();
        
        if (!favorites.includes(listingId)) {
          set({
            favorites: [...favorites, listingId],
            favoritesData: listing 
              ? { ...favoritesData, [listingId]: listing }
              : favoritesData
          });
        }
      },

      removeFavorite: (listingId) => {
        const { favorites, favoritesData } = get();
        const newFavoritesData = { ...favoritesData };
        delete newFavoritesData[listingId];
        
        set({
          favorites: favorites.filter(id => id !== listingId),
          favoritesData: newFavoritesData
        });
      },

      toggleFavorite: (listingId, listing) => {
        const { isFavorite, addFavorite, removeFavorite } = get();
        
        if (isFavorite(listingId)) {
          removeFavorite(listingId);
        } else {
          addFavorite(listingId, listing);
        }
      },

      isFavorite: (listingId) => {
        return get().favorites.includes(listingId);
      },

      clearFavorites: () => {
        set({ favorites: [], favoritesData: {} });
      },

      getFavoriteListings: () => {
        const { favorites, favoritesData } = get();
        return favorites
          .map(id => favoritesData[id])
          .filter(Boolean); // Filtrer les undefined
      }
    }),
    {
      name: 'senmarket-favorites',
    }
  )
);