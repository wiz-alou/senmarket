import { useQuery } from '@tanstack/react-query';
import { categoriesService } from '@/lib/api';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes (les catégories changent rarement)
  });
};

export const useCategoriesWithStats = () => {
  return useQuery({
    queryKey: ['categories-stats'],
    queryFn: categoriesService.getCategoriesWithStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => categoriesService.getCategory(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};