'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
import { 
  StarIcon as StarSolid 
} from '@heroicons/react/24/solid'

export default function LoginPage() {
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
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    const newErrors: {[key: string]: string} = {}

    if (!formData.phone) {
      newErrors.phone = 'Le numéro de téléphone est requis'
    } else if (!/^\+221[0-9]{9}$/.test(formData.phone)) {
      newErrors.phone = 'Format: +221XXXXXXXXX'
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Minimum 6 caractères'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirect to dashboard or home
      console.log('Login successful:', formData)
      
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPhoneNumber = (value: string) => {
    // Auto-format phone number
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.startsWith('221')) {
      return '+' + cleaned
    } else if (cleaned.startsWith('77') || cleaned.startsWith('76') || cleaned.startsWith('75') || cleaned.startsWith('78')) {
      return '+221' + cleaned
    }
    return value
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 bg-white relative overflow-hidden">
        {/* Back to Home Button */}
        <div className={`absolute top-6 left-6 z-50 ${isVisible ? 'animate-fade-in-down' : 'opacity-0'}`}>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors group bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm hover:shadow-md"
          >
            <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-primary-50 flex items-center justify-center transition-colors">
              <ArrowRightIcon className="w-4 h-4 rotate-180" />
            </div>
            <span className="text-sm font-medium">Retour à l'accueil</span>
          </Link>
        </div>

        {/* Background Effects */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-senegal-green rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-md mx-auto w-full">
          {/* Header */}
          <div className={`text-center mb-12 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            {/* Logo */}
            <Link href="/" className="inline-flex items-center space-x-3 mb-8 group hover:scale-105 transition-transform">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <span className="text-white text-2xl font-bold">🇸🇳</span>
              </div>
              <div className="text-3xl font-display font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                SenMarket
              </div>
            </Link>

            {/* Title */}
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
              Bon retour ! 👋
            </h1>
            <p className="text-lg text-gray-600">
              Connectez-vous pour accéder à votre marketplace préféré
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className={`space-y-6 ${isVisible ? 'animate-fade-in-up animate-delayed' : 'opacity-0'}`}>
            {/* Phone Input */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value)
                    setFormData(prev => ({ ...prev, phone: formatted }))
                  }}
                  placeholder="+221 77 123 45 67"
                  className={`w-full pl-12 pr-4 py-4 text-lg border rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                    errors.phone 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Votre mot de passe"
                  className={`w-full pl-12 pr-12 py-4 text-lg border rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                    errors.password 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                  Se souvenir de moi
                </label>
              </div>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-senegal btn-lg group relative overflow-hidden"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Connexion...
                </div>
              ) : (
                <>
                  <ShieldCheckIcon className="w-6 h-6" />
                  Se connecter
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Signup Link */}
          <div className={`text-center mt-8 ${isVisible ? 'animate-fade-in-up animate-delayed-2' : 'opacity-0'}`}>
            <p className="text-gray-600">
              Nouveau sur SenMarket ?{' '}
              <Link
                href="/auth/register"
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Créer un compte gratuitement
              </Link>
            </p>
          </div>

          {/* Back to Home Link */}
          <div className={`text-center mt-4 ${isVisible ? 'animate-fade-in-up animate-delayed-2' : 'opacity-0'}`}>
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors group"
            >
              <ArrowRightIcon className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm">Retourner à l'accueil</span>
            </Link>
          </div>

          {/* Security Note */}
          <div className={`mt-8 p-4 bg-green-50 border border-green-200 rounded-xl ${isVisible ? 'animate-fade-in-up animate-delayed-3' : 'opacity-0'}`}>
            <div className="flex items-start space-x-3">
              <ShieldCheckIcon className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">Connexion sécurisée</p>
                <p>Vos données sont protégées par un chiffrement de niveau bancaire.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Visual & Features */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-senegal-green/20 via-transparent to-primary-800/20"></div>
        
        {/* Particles Effect */}
        <div className="absolute inset-0 particles"></div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-senegal-yellow rounded-full blob float-1"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-senegal-green rounded-full blob float-2"></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white rounded-full blob float-3"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center px-12 xl:px-16 text-white">
          {/* Badge */}
          <div className={`inline-flex items-center space-x-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 mb-8 self-start ${isVisible ? 'animate-fade-in-down' : 'opacity-0'}`}>
            <StarSolid className="w-5 h-5 text-senegal-yellow" />
            <span className="text-sm font-medium">Déjà 50,000+ utilisateurs</span>
          </div>

          {/* Main Content */}
          <div className={`mb-12 ${isVisible ? 'animate-fade-in-up animate-delayed' : 'opacity-0'}`}>
            <h2 className="text-5xl font-display font-bold mb-6 leading-tight">
              Retrouvez votre
              <span className="block text-senegal-yellow">marketplace</span>
              <span className="block">préféré ! 🇸🇳</span>
            </h2>
            <p className="text-xl text-primary-100 leading-relaxed">
              Accédez à des milliers d'annonces, gérez vos ventes et 
              connectez-vous avec la communauté SenMarket.
            </p>
          </div>

          {/* Features */}
          <div className={`space-y-6 ${isVisible ? 'animate-fade-in-up animate-delayed-2' : 'opacity-0'}`}>
            {[
              {
                icon: UserGroupIcon,
                title: 'Communauté active',
                desc: 'Plus de 50,000 sénégalais actifs'
              },
              {
                icon: ShieldCheckIcon,
                title: 'Paiements sécurisés',
                desc: 'Orange Money intégré et sécurisé'
              },
              {
                icon: SparklesIcon,
                title: 'Publication facile',
                desc: 'Créez une annonce en 2 minutes'
              }
            ].map((feature, index) => (
              <div key={feature.title} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-senegal-yellow" />
                </div>
                <div>
                  <div className="font-semibold text-lg">{feature.title}</div>
                  <div className="text-primary-200">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className={`grid grid-cols-3 gap-6 mt-16 ${isVisible ? 'animate-fade-in-up animate-delayed-3' : 'opacity-0'}`}>
            {[
              { value: '50K+', label: 'Utilisateurs' },
              { value: '18K+', label: 'Annonces' },
              { value: '98%', label: 'Satisfaction' }
            ].map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black text-senegal-yellow mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-primary-200">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}