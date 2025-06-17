// ================================================
// UTILS - src/lib/utils.ts
// SenMarket - Utilitaires et helpers 🛠️
// ================================================

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// === FONCTION PRINCIPALE POUR FUSIONNER LES CLASSES ===
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// === FORMATAGE DES PRIX ===
export function formatPrice(price: number, currency: string = 'XOF'): string {
  if (currency === 'XOF') {
    return `${price.toLocaleString('fr-FR')} FCFA`
  }
  return `${price.toLocaleString('fr-FR')} ${currency}`
}

// === FORMATAGE DES DATES ===
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export function formatDateShort(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  })
}

export function timeAgo(date: string | Date): string {
  const now = new Date()
  const d = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'À l\'instant'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`
  } else {
    return formatDate(date)
  }
}

// === VALIDATION DES TÉLÉPHONES SÉNÉGALAIS ===
export function isValidSenegalPhone(phone: string): boolean {
  // Formats acceptés: +221771234567, 771234567, 77 123 45 67
  const phoneRegex = /^(\+221)?[0-9\s]{8,9}$/
  const cleanPhone = phone.replace(/\s/g, '')
  
  if (cleanPhone.startsWith('+221')) {
    return cleanPhone.length === 13 && /^\+221[0-9]{9}$/.test(cleanPhone)
  } else {
    return cleanPhone.length === 9 && /^[0-9]{9}$/.test(cleanPhone)
  }
}

// === FORMATAGE DES TÉLÉPHONES ===
export function formatSenegalPhone(phone: string): string {
  const cleanPhone = phone.replace(/\s/g, '').replace('+221', '')
  if (cleanPhone.length === 9) {
    return `+221 ${cleanPhone.substring(0, 2)} ${cleanPhone.substring(2, 5)} ${cleanPhone.substring(5, 7)} ${cleanPhone.substring(7, 9)}`
  }
  return phone
}

// === GÉNÉRATION D'AVATARS ===
export function generateAvatarUrl(name: string): string {
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
  
  return `https://ui-avatars.com/api/?name=${initials}&background=154475&color=fff&size=128`
}

// === COULEURS ALÉATOIRES POUR LES BADGES ===
export function getRandomBadgeColor(): string {
  const colors = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-red-100 text-red-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// === SLUGIFY POUR LES URLs ===
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9 -]/g, '') // Garder seulement les lettres, chiffres, espaces et tirets
    .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
    .replace(/-+/g, '-') // Supprimer les tirets multiples
    .trim('-') // Supprimer les tirets au début et à la fin
}

// === TRUNCATE TEXT ===
export function truncate(text: string, length: number = 100): string {
  if (text.length <= length) return text
  return text.substring(0, length).trim() + '...'
}

// === VALIDATION EMAIL ===
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// === GÉNÉRATION D'IDS UNIQUES ===
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// === CALCUL DE POURCENTAGE ===
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

// === DEBOUNCE POUR LES RECHERCHES ===
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// === FORMATAGE DES NOMBRES ===
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// === COPIER DANS LE PRESSE-PAPIER ===
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Erreur lors de la copie:', err)
    return false
  }
}

// === VALIDATION DES MOTS DE PASSE ===
export function isStrongPassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// === CONSTANTES SÉNÉGAL ===
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

export const PAYMENT_METHODS = [
  { id: 'orange_money', name: 'Orange Money', icon: '📱' },
  { id: 'wave', name: 'Wave', icon: '🌊' },
  { id: 'free_money', name: 'Free Money', icon: '💳' }
] as const

export const CURRENCIES = [
  { code: 'XOF', name: 'Franc CFA', symbol: 'FCFA' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'Dollar US', symbol: '$' }
] as const