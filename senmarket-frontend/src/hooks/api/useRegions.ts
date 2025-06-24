import { useQuery } from '@tanstack/react-query';
import { regionsService } from '@/lib/api';

export const useRegions = () => {
  return useQuery({
    queryKey: ['regions'],
    queryFn: regionsService.getRegions,
    staleTime: 60 * 60 * 1000, // 1 heure (les régions ne changent jamais)
  });
};