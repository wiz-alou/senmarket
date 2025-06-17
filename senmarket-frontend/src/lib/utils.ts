import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// 🌊 lib/utils.ts - Utilitaires SenMarket
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combine les classes CSS avec Tailwind merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatage des prix sénégalais
 */
export function formatPrice(amount: number, currency: string = 'XOF'): string {
  if (currency === 'XOF' || currency === 'FCFA') {
    return `${amount.toLocaleString('fr-SN')} FCFA`
  }
  return `${amount.toLocaleString('fr-SN')} ${currency}`
}

/**
 * Formatage des numéros de téléphone sénégalais
 */
export function formatPhoneSenegal(phone: string): string {
  // Nettoyer le numéro
  const cleaned = phone.replace(/\D/g, '')
  
  // Format sénégalais : +221 XX XXX XX XX
  if (cleaned.startsWith('221') && cleaned.length === 12) {
    const number = cleaned.substring(3)
    return `+221 ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5, 7)} ${number.substring(7, 9)}`
  }
  
  // Si le numéro commence par 7 (mobile sénégalais)
  if (cleaned.startsWith('7') && cleaned.length === 9) {
    return `+221 ${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5, 7)} ${cleaned.substring(7, 9)}`
  }
  
  return phone // Retourner tel quel si format inconnu
}

/**
 * Formatage des dates relatives
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const targetDate = typeof date === 'string' ? new Date(date) : date
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'À l\'instant'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `Il y a ${diffInWeeks} semaine${diffInWeeks > 1 ? 's' : ''}`
  }
  
  const diffInMonths = Math.floor(diffInDays / 30)
  return `Il y a ${diffInMonths} mois`
}

/**
 * Validation email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validation téléphone sénégalais
 */
export function isValidSenegalPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')
  
  // Formats acceptés:
  // - 7XXXXXXXX (9 chiffres commençant par 7)
  // - 2217XXXXXXXX (12 chiffres commençant par 2217)
  return (
    (cleaned.startsWith('7') && cleaned.length === 9) ||
    (cleaned.startsWith('2217') && cleaned.length === 12)
  )
}

/**
 * Génération d'ID unique simple
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

/**
 * Vérification si on est côté client
 */
export function isClient(): boolean {
  return typeof window !== 'undefined'
}

/**
 * Stockage local sécurisé
 */
export const storage = {
  get: (key: string) => {
    if (!isClient()) return null
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },
  
  set: (key: string, value: any) => {
    if (!isClient()) return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Silently fail
    }
  },
  
  remove: (key: string) => {
    if (!isClient()) return
    try {
      localStorage.removeItem(key)
    } catch {
      // Silently fail
    }
  }
}

/**
 * Copier dans le presse-papier
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!isClient()) return false
  
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback pour les anciens navigateurs
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch {
      return false
    }
  }
}

/**
 * Slugify pour les URLs
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '') // Supprimer les caractères spéciaux
    .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
    .replace(/-+/g, '-') // Supprimer les tirets multiples
    .trim()
}

/**
 * Constantes pour l'application
 */
export const SENEGAL_REGIONS = [
  'Dakar - Plateau',
  'Dakar - Almadies', 
  'Dakar - Parcelles Assainies',
  'Dakar - Ouakam',
  'Dakar - Point E',
  'Dakar - Pikine',
  'Dakar - Guédiawaye',
  'Thiès',
  'Saint-Louis',
  'Kaolack',
  'Ziguinchor',
  'Diourbel',
  'Louga',
  'Fatick',
  'Kolda',
  'Tambacounda'
] as const

export const LISTING_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active', 
  SOLD: 'sold',
  EXPIRED: 'expired'
} as const

export const PAYMENT_METHODS = {
  ORANGE_MONEY: 'orange_money',
  WAVE: 'wave',
  FREE_MONEY: 'free_money'
} as const