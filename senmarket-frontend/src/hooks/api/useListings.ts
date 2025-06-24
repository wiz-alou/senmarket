import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNotifications } from '@/hooks/useNotifications'

interface CreateListingRequest {
  title: string
  description: string
  price: number
  category_id: string
  region: string
  images: string[]
}

interface Listing {
  id: string
  title: string
  description: string
  price: number
  region: string
  images: string[]
  status: string
  views_count: number
  created_at: string
}

export const useListingMutations = () => {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useNotifications()

  const createMutation = useMutation({
    mutationFn: async (data: CreateListingRequest): Promise<Listing> => {
      const token = localStorage.getItem('senmarket_token')
      const response = await fetch('http://localhost:8080/api/v1/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de la création')
      }

      const result = await response.json()
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      queryClient.invalidateQueries({ queryKey: ['my-listings'] })
      showSuccess('Annonce créée', 'Votre annonce a été créée avec succès')
    },
    onError: (error: Error) => {
      showError('Erreur de création', error.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const token = localStorage.getItem('senmarket_token')
      const response = await fetch(`http://localhost:8080/api/v1/listings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      queryClient.invalidateQueries({ queryKey: ['my-listings'] })
      showSuccess('Annonce supprimée', 'Votre annonce a été supprimée')
    },
    onError: (error: Error) => {
      showError('Erreur de suppression', error.message)
    },
  })

  return {
    createMutation,
    deleteMutation,
  }
}

export const useMyListings = () => {
  return useQuery({
    queryKey: ['my-listings'],
    queryFn: async () => {
      const token = localStorage.getItem('senmarket_token')
      const response = await fetch('http://localhost:8080/api/v1/listings/my', {
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
