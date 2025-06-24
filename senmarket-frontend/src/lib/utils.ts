export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-SN', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(price)
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-SN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}