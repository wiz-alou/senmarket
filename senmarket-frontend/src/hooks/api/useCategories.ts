import { useQuery } from '@tanstack/react-query'

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  description?: string
}

interface CategoriesResponse {
  categories: Category[]
}

const fetchCategories = async (): Promise<CategoriesResponse> => {
  const response = await fetch('http://localhost:8080/api/v1/categories')
  if (!response.ok) {
    throw new Error('Erreur lors du chargement des catégories')
  }
  return response.json()
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}