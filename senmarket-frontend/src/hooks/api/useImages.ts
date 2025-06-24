import { useMutation } from '@tanstack/react-query'
import { useNotifications } from '@/hooks/useNotifications'

interface UploadResult {
  urls: string[]
}

export const useImageUpload = () => {
  const { showError } = useNotifications()

  const uploadMultipleMutation = useMutation({
    mutationFn: async (files: File[]): Promise<UploadResult> => {
      const token = localStorage.getItem('senmarket_token')
      const formData = new FormData()
      
      files.forEach((file) => {
        formData.append('images', file)
      })

      const response = await fetch('http://localhost:8080/api/v1/images/upload-multiple', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de l\'upload')
      }

      const result = await response.json()
      return { urls: result.data.urls }
    },
    onError: (error: Error) => {
      showError('Erreur upload', error.message)
    },
  })

  return {
    uploadMultipleMutation,
  }
}