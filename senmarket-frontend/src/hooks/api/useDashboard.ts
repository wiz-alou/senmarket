import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/lib/api';

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardService.getDashboardData,
    staleTime: 30 * 1000, // 30 secondes
    refetchInterval: 60 * 1000, // Refetch toutes les minutes
  });
};

