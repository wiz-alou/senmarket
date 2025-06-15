'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  EyeIcon,
  EyeSlashIcon,
  PhoneIcon,
  LockClosedIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserGroupIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'
import { useAuth } from '@/hooks/useAuth'
import { formatSenegalPhone, validateLoginForm } from '@/utils/validation'

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated } = useAuth()
  
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    // Rediriger si déjà connecté
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    let formattedValue = value
    if (name === 'phone') {
      formattedValue = formatPhoneNumber(value)
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const validation = validateLoginForm(formData.phone, formData.password)
    setErrors(validation.errors)
    return validation.isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      console.log('🔐 [LOGIN] Tentative de connexion:', { phone: formData.phone })
      
      await login(formatSenegalPhone(formData.phone), formData.password)
      
      console.log('✅ [LOGIN] Connexion réussie')
      router.push('/dashboard')
      
    } catch (error: any) {
      console.error('❌ [LOGIN] Erreur connexion:', error)
      setErrors({ 
        general: error.message || 'Erreur de connexion' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatPhoneNumber = (value: string) => {
    return formatSenegalPhone(value)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 bg-white relative overflow-hidden">
        
        {/* Back to Home */}
        <div className={`absolute top-6 left-6 z-50 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'} transition-all duration-700`}>
          <Link href="/" className="inline-flex items-center space-x-2 text-gray-600 hover:text-senegal-green transition-colors group">
            <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-senegal-green/10 flex items-center justify-center transition-colors">
              <ArrowRightIcon className="h-4 w-4 rotate-180" />
            </div>
            <span className="text-sm font-medium">Retour</span>
          </Link>
        </div>

        {/* Form Container */}
        <div className={`w-full max-w-md mx-auto ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} transition-all duration-700 delay-200`}>
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-senegal-green to-green-600 rounded-3xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">🇸🇳</span>
              </div>
            </div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-3">
              Bon retour !
            </h1>
            <p className="text-gray-600">
              Connectez-vous pour accéder à votre compte SenMarket
            </p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+221771234567"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-senegal-green focus:border-transparent transition-all duration-200 ${
                    errors.phone 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Votre mot de passe"
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-senegal-green focus:border-transparent transition-all duration-200 ${
                    errors.password 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-senegal-green to-green-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-green-700 focus:ring-4 focus:ring-senegal-green/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Connexion...</span>
                </>
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRightIcon className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center space-y-4">
            <Link href="/auth/forgot-password" className="text-senegal-green hover:text-green-600 font-medium transition-colors">
              Mot de passe oublié ?
            </Link>
            
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <span>Pas encore de compte ?</span>
              <Link href="/auth/register" className="text-senegal-green hover:text-green-600 font-semibold transition-colors">
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-senegal-green via-green-600 to-teal-600"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-senegal-yellow/20 via-transparent to-green-800/20"></div>
        
        <div className="relative z-10 h-full flex flex-col justify-center px-12 xl:px-16 text-white">
          <div className={`${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} transition-all duration-1000 delay-500`}>
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2 mb-8">
              <ShieldCheckIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Connexion Sécurisée</span>
            </div>
            
            <h2 className="text-5xl font-display font-bold mb-6 leading-tight">
              Accédez à votre
              <span className="block text-senegal-yellow">marketplace</span>
            </h2>
            
            <p className="text-xl text-white/90 mb-12 leading-relaxed">
              Gérez vos annonces, suivez vos ventes et développez votre business sur SenMarket.
            </p>
            
            <div className="space-y-4">
              {[
                { icon: SparklesIcon, text: 'Tableau de bord personnalisé' },
                { icon: UserGroupIcon, text: 'Messagerie intégrée' },
                { icon: CheckIcon, text: 'Paiements Orange Money' }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-lg">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}