'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  EyeIcon,
  EyeSlashIcon,
  PhoneIcon,
  LockClosedIcon,
  UserIcon,
  EnvelopeIcon,
  MapPinIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserGroupIcon,
  CheckIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'
import { useAuth } from '@/hooks/useAuth'
import { formatSenegalPhone, validateRegisterForm } from '@/utils/validation'

const senegalRegions = [
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
]

export default function RegisterPage() {
  const router = useRouter()
  const { register: registerUser, isAuthenticated } = useAuth()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    region: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    let formattedValue = value
    if (name === 'phone') {
      formattedValue = formatPhoneNumber(value)
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : formattedValue
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateStep1 = () => {
    const validation = validateRegisterForm({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      email: formData.email,
      password: 'temp', // On valide pas le password à l'étape 1
      confirmPassword: 'temp',
      region: formData.region,
      acceptTerms: true // On valide pas les CGU à l'étape 1
    })
    
    // Ne garder que les erreurs de l'étape 1
    const step1Errors: {[key: string]: string} = {}
    if (validation.errors.firstName) step1Errors.firstName = validation.errors.firstName
    if (validation.errors.lastName) step1Errors.lastName = validation.errors.lastName
    if (validation.errors.phone) step1Errors.phone = validation.errors.phone
    if (validation.errors.region) step1Errors.region = validation.errors.region
    
    setErrors(step1Errors)
    return Object.keys(step1Errors).length === 0
  }

  const validateStep2 = () => {
    const validation = validateRegisterForm(formData)
    setErrors(validation.errors)
    return validation.isValid
  }

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    }
  }

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  if (!validateStep2()) return

  setIsLoading(true)
  
  try {
    const registrationData = {
      phone: formatSenegalPhone(formData.phone),
      email: formData.email.trim() || undefined,
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      password: formData.password,
      region: formData.region
    }
    
    const result = await registerUser(registrationData)
    
    console.log('✅ [REGISTER] Inscription réussie, redirection SMS')
    
    // Redirection vers vérification SMS (pas dashboard)
    router.push('/auth/verify-sms')
    
  } catch (error: any) {
    console.error('❌ [REGISTER] Erreur inscription:', error)
    setErrors({ 
      general: error.message || 'Erreur lors de l\'inscription' 
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
      {/* Left Side - Visual & Benefits */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-senegal-green via-green-600 to-teal-600"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-senegal-yellow/20 via-transparent to-green-800/20"></div>
        
        {/* Particles Effect */}
        <div className="absolute inset-0 particles"></div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 bg-senegal-yellow rounded-full blob float-1"></div>
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-white rounded-full blob float-2"></div>
          <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-senegal-yellow rounded-full blob float-3"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center px-12 xl:px-16 text-white">
          {/* Badge */}
          <div className={`inline-flex items-center space-x-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 mb-8 self-start ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-700`}>
            <SparklesIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Inscription Gratuite</span>
          </div>
          
          <div className={`${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} transition-all duration-1000 delay-300`}>
            <h2 className="text-5xl font-display font-bold mb-6 leading-tight">
              Rejoignez le plus grand
              <span className="block text-senegal-yellow">marketplace</span>
              du Sénégal
            </h2>
            
            <p className="text-xl text-white/90 mb-12 leading-relaxed">
              Vendez vos produits, développez votre business et connectez-vous avec des milliers d'acheteurs.
            </p>
            
            {/* Features */}
            <div className="space-y-6 mb-12">
              {[
                { icon: CurrencyDollarIcon, title: 'Paiements sécurisés', desc: 'Orange Money intégré' },
                { icon: UserGroupIcon, title: 'Large audience', desc: '18,000+ utilisateurs actifs' },
                { icon: ShieldCheckIcon, title: 'Plateforme sécurisée', desc: 'Vos données protégées' }
              ].map((feature, index) => (
                <div key={index} className={`flex items-start space-x-4 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'} transition-all duration-700`} style={{ transitionDelay: `${600 + index * 100}ms` }}>
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                    <p className="text-white/80">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              {[
                { number: '18K+', label: 'Utilisateurs' },
                { number: '5K+', label: 'Annonces' },
                { number: '98%', label: 'Satisfaction' }
              ].map((stat, index) => (
                <div key={index} className={`text-center ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-700`} style={{ transitionDelay: `${1000 + index * 100}ms` }}>
                  <div className="text-3xl font-bold text-senegal-yellow mb-1">{stat.number}</div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
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
              Créer votre compte
            </h1>
            <p className="text-gray-600">
              Rejoignez SenMarket et commencez à vendre dès aujourd'hui
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                currentStep >= 1 
                  ? 'bg-senegal-green text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <div className={`w-16 h-0.5 transition-all duration-300 ${
                currentStep >= 2 ? 'bg-senegal-green' : 'bg-gray-200'
              }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                currentStep >= 2 
                  ? 'bg-senegal-green text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Votre prénom"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-senegal-green focus:border-transparent transition-all duration-200 ${
                        errors.firstName 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de famille *
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Votre nom"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-senegal-green focus:border-transparent transition-all duration-200 ${
                        errors.lastName 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de téléphone *
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

                {/* Region */}
                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                    Région *
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      id="region"
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-senegal-green focus:border-transparent transition-all duration-200 appearance-none bg-white ${
                        errors.region 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <option value="">Sélectionnez votre région</option>
                      {senegalRegions.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.region && (
                    <p className="mt-1 text-sm text-red-600">{errors.region}</p>
                  )}
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-gradient-to-r from-senegal-green to-green-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-green-700 focus:ring-4 focus:ring-senegal-green/25 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Continuer</span>
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Step 2: Security */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Email (Optional) */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email (optionnel)
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="votre@email.com"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-senegal-green focus:border-transparent transition-all duration-200 ${
                        errors.email 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Mot de passe sécurisé"
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

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le mot de passe *
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirmez votre mot de passe"
                      className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-senegal-green focus:border-transparent transition-all duration-200 ${
                        errors.confirmPassword 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Terms Checkbox */}
                <div>
                  <div className="flex items-start">
                    <input
                      id="acceptTerms"
                      name="acceptTerms"
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 text-senegal-green focus:ring-senegal-green border-gray-300 rounded"
                    />
                    <label htmlFor="acceptTerms" className="ml-3 text-sm text-gray-600">
                      J'accepte les{' '}
                      <Link href="/terms" className="text-senegal-green hover:text-green-700 font-medium">
                        conditions d'utilisation
                      </Link>
                      {' '}et la{' '}
                      <Link href="/privacy" className="text-senegal-green hover:text-green-700 font-medium">
                        politique de confidentialité
                      </Link>
                    </label>
                  </div>
                  {errors.acceptTerms && (
                    <p className="mt-1 text-sm text-red-600">{errors.acceptTerms}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 focus:ring-4 focus:ring-gray-200/50 transition-all duration-200"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-senegal-green to-green-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-green-700 focus:ring-4 focus:ring-senegal-green/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Inscription...</span>
                      </>
                    ) : (
                      <>
                        <span>Créer mon compte</span>
                        <CheckIcon className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <span>Déjà un compte ?</span>
              <Link href="/auth/login" className="text-senegal-green hover:text-green-600 font-semibold transition-colors">
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}