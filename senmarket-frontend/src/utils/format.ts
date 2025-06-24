export const formatPrice = (price: number, currency = 'XOF') => {
  return new Intl.NumberFormat('fr-SN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(price)
}

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat('fr-SN').format(num)
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-SN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return 'À l\'instant'
  if (minutes < 60) return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`
  if (hours < 24) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`
  if (days < 30) return `il y a ${days} jour${days > 1 ? 's' : ''}`
  
  return formatDate(dateString)
}

export const formatPhone = (phone: string) => {
  // Format : +221 77 123 45 67
  if (!phone.startsWith('+221')) return phone
  
  const digits = phone.replace(/\D/g, '').slice(3) // Enlever le +221
  return `+221 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`
}

export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}