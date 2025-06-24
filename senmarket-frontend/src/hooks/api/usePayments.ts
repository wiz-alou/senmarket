import { useMutation, useQuery } from '@tanstack/react-query'
import { useNotifications } from '@/hooks/useNotifications'

interface InitiatePaymentRequest {
  listing_id: string
  amount: number
  payment_method: string
}

interface Payment {
  id: string
  amount: number
  status: string
  payment_method: string
  transaction_id?: string
  created_at: string
}

export const usePayments = () => {
  const { showError } = useNotifications()

  const initiateMutation = useMutation({
    mutationFn: async (data: InitiatePaymentRequest): Promise<Payment> => {
      const token = localStorage.getItem('senmarket_token')
      const response = await fetch('http://localhost:8080/api/v1/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors du paiement')
      }

      const result = await response.json()
      return result.data
    },
    onError: (error: Error) => {
      showError('Erreur paiement', error.message)
    },
  })

  return {
    initiateMutation,
  }
}

export const useMyPayments = () => {
  return useQuery({
    queryKey: ['my-payments'],
    queryFn: async () => {
      const token = localStorage.getItem('senmarket_token')
      const response = await fetch('http://localhost:8080/api/v1/payments/my', {
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
