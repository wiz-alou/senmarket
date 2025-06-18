import { create } from 'zustand';
import { Listing, ListingFilters } from '@/lib/api/types';

interface ListingsState {
  listings: Listing[];
  totalListings: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  filters: ListingFilters;
  searchQuery: string;
}

interface ListingsActions {
  setListings: (listings: Listing[]) => void;
  addListing: (listing: Listing) => void;
  updateListing: (id: string, updates: Partial<Listing>) => void;
  removeListing: (id: string) => void;
  setTotalListings: (total: number) => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<ListingFilters>) => void;
  clearFilters: () => void;
  setSearchQuery: (query: string) => void;
  clearListings: () => void;
}

const initialFilters: ListingFilters = {
  search: '',
  category_id: '',
  region: '',
  min_price: undefined,
  max_price: undefined,
  sort: 'date',
  page: 1,
  limit: 20,
};

export const useListingsStore = create<ListingsState & ListingsActions>((set, get) => ({
  // État initial
  listings: [],
  totalListings: 0,
  currentPage: 1,
  totalPages: 0,
  isLoading: false,
  error: null,
  filters: initialFilters,
  searchQuery: '',

  // Actions
  setListings: (listings) => set({ listings }),

  addListing: (listing) => {
    const { listings } = get();
    set({ listings: [listing, ...listings] });
  },

  updateListing: (id, updates) => {
    const { listings } = get();
    set({
      listings: listings.map(listing =>
        listing.id === id ? { ...listing, ...updates } : listing
      )
    });
  },

  removeListing: (id) => {
    const { listings } = get();
    set({
      listings: listings.filter(listing => listing.id !== id)
    });
  },

  setTotalListings: (total) => set({ totalListings: total }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalPages: (pages) => set({ totalPages: pages }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  setFilters: (newFilters) => {
    const { filters } = get();
    set({
      filters: { ...filters, ...newFilters }
    });
  },

  clearFilters: () => set({ filters: initialFilters }),

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    // Mettre à jour aussi les filtres
    const { setFilters } = get();
    setFilters({ search: query });
  },

  clearListings: () => set({ 
    listings: [], 
    totalListings: 0, 
    currentPage: 1, 
    totalPages: 0, 
    error: null 
  }),
}));