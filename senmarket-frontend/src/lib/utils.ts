import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utilitaires pour formatage des prix
export function formatPrice(price: number, currency = 'XOF') {
  return new Intl.NumberFormat('fr-SN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

// Formatage des dates
export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('fr-SN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

// Temps relatif (il y a X jours)
export function formatRelativeTime(date: string | Date) {
  const now = new Date()
  const targetDate = new Date(date)
  const diffInMs = now.getTime() - targetDate.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return "Aujourd'hui"
  if (diffInDays === 1) return "Hier"
  if (diffInDays < 7) return `Il y a ${diffInDays} jours`
  if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`
  
  return formatDate(date)
}

// Validation numéro de téléphone sénégalais
export function isValidSenegalPhone(phone: string): boolean {
  const senegalPhoneRegex = /^(\+221|221)?[7][0-8][0-9]{7}$/
  return senegalPhoneRegex.test(phone.replace(/\s/g, ''))
}

// Formatage numéro de téléphone
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('221')) {
    const number = cleaned.substring(3)
    return `+221 ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5, 7)} ${number.substring(7, 9)}`
  }
  return phone
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

// Generate slug from text
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
}