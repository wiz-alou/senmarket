import { useQuery } from '@tanstack/react-query'

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const token = localStorage.getItem('senmarket_token')
      const response = await fetch('http://localhost:8080/api/v1/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement')
      }
      
      return response.json()
    },
    enabled: !!localStorage.getItem('senmarket_token'),
  })
}