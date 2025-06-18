import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNotifications } from '@/hooks/useNotifications'

interface Contact {
  id: string
  name: string
  phone: string
  email?: string
  message: string
  is_read: boolean
  created_at: string
}

export const useMyContacts = () => {
  return useQuery({
    queryKey: ['my-contacts'],
    queryFn: async () => {
      const token = localStorage.getItem('senmarket_token')
      const response = await fetch('http://localhost:8080/api/v1/contacts/my', {
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

export const useContactMutations = () => {
  const queryClient = useQueryClient()
  const { showError } = useNotifications()

  const markAsReadMutation = useMutation({
    mutationFn: async (contactId: string): Promise<void> => {
      const token = localStorage.getItem('senmarket_token')
      const response = await fetch(`http://localhost:8080/api/v1/contacts/${contactId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-contacts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error: Error) => {
      showError('Erreur', error.message)
    },
  })

  return {
    markAsReadMutation,
  }
}