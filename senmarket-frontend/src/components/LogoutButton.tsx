// src/components/LogoutButton.tsx
'use client'

import { useAuth } from '@/hooks/useAuth'

interface LogoutButtonProps {
  variant?: 'default' | 'header' | 'sidebar' | 'minimal'
  className?: string
  showIcon?: boolean
  children?: React.ReactNode
}

export default function LogoutButton({ 
  variant = 'default', 
  className = '',
  showIcon = true,
  children 
}: LogoutButtonProps) {
  const { logout, user, isAuthenticated } = useAuth()

  const handleLogout = () => {
    console.log('🚪 [LOGOUT BUTTON] Déconnexion cliquée par:', user?.first_name)
    
    // Confirmation optionnelle
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout()
    }
  }

  // Si pas connecté, ne rien afficher
  if (!isAuthenticated) {
    return null
  }

  // Styles selon la variante
  const getButtonStyles = () => {
    switch (variant) {
      case 'header':
        return 'inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors'
      
      case 'sidebar':
        return 'flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-800 transition-colors'
      
      case 'minimal':
        return 'text-red-600 hover:text-red-800 underline text-sm'
      
      default:
        return 'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors'
    }
  }

  return (
    <button
      onClick={handleLogout}
      className={`${getButtonStyles()} ${className}`}
      type="button"
    >
      {showIcon && <span className="mr-1">🚪</span>}
      {children || 'Déconnexion'}
    </button>
  )
}