'use client'

import { useState, useEffect } from 'react'
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
import { 
  StarIcon as StarSolid 
} from '@heroicons/react/24/solid'

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
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
    const newErrors: {[key: string]: string} = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis'
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'Minimum 2 caractères'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis'
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Minimum 2 caractères'
    }

    if (!formData.phone) {
      newErrors.phone = 'Le numéro de téléphone est requis'
    } else if (!/^\+221[0-9]{9}$/.test(formData.phone)) {
      newErrors.phone = 'Format: +221XXXXXXXXX'
    }

    if (!formData.region) {
      newErrors.region = 'Veuillez sélectionner votre région'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: {[key: string]: string} = {}

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email invalide'
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Minimum 6 caractères'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Doit contenir minuscule, majuscule et chiffre'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmez votre mot de passe'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Vous devez accepter les conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirect to SMS verification
      console.log('Registration successful:', formData)
      // window.location.href = '/auth/verify-sms'
      
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPhoneNumber = (value: string) => {
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
          <div className={`inline-flex items-center space-x-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 mb-8 self-start ${isVisible ? 'animate-fade-in-down' : 'opacity-0'}`}>
            <StarSolid className="w-5 h-5 text-senegal-yellow" />
            <span className="text-sm font-medium">Rejoignez 50,000+ sénégalais</span>
          </div>

          {/* Main Content */}
          <div className={`mb-12 ${isVisible ? 'animate-fade-in-up animate-delayed' : 'opacity-0'}`}>
            <h2 className="text-5xl font-display font-bold mb-6 leading-tight">
              Commencez à
              <span className="block text-senegal-yellow">gagner</span>
              <span className="block">dès aujourd'hui ! 💰</span>
            </h2>
            <p className="text-xl text-green-100 leading-relaxed">
              Créez votre compte gratuitement et commencez à vendre 
              en moins de 5 minutes. Première annonce = 200 FCFA seulement !
            </p>
          </div>

          {/* Benefits */}
          <div className={`space-y-6 ${isVisible ? 'animate-fade-in-up animate-delayed-2' : 'opacity-0'}`}>
            {[
              {
                icon: CurrencyDollarIcon,
                title: 'Première annonce 200 FCFA',
                desc: 'Prix le plus bas du marché'
              },
              {
                icon: ShieldCheckIcon,
                title: 'Paiements Orange Money',
                desc: 'Sécurisé et instantané'
              },
              {
                icon: UserGroupIcon,
                title: 'Audience qualifiée',
                desc: '50,000+ acheteurs potentiels'
              },
              {
                icon: SparklesIcon,
                title: 'Interface intuitive',
                desc: 'Publier une annonce en 2 min'
              }
            ].map((benefit, index) => (
              <div key={benefit.title} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
                  <benefit.icon className="w-6 h-6 text-senegal-yellow" />
                </div>
                <div>
                  <div className="font-semibold text-lg">{benefit.title}</div>
                  <div className="text-green-200">{benefit.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Success Stories */}
          <div className={`mt-16 p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 ${isVisible ? 'animate-fade-in-up animate-delayed-3' : 'opacity-0'}`}>
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-senegal-yellow rounded-full flex items-center justify-center">
                <span className="text-senegal-green font-bold text-lg">AM</span>
              </div>
              <div>
                <div className="font-semibold">Aminata M.</div>
                <div className="text-green-200 text-sm">Vendeuse de mode</div>
              </div>
            </div>
            <p className="text-green-100 italic">
              "Grâce à SenMarket, j'ai vendu pour 500,000 FCFA ce mois. 
              Interface simple et clients sérieux !"
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 bg-white relative overflow-hidden">
        {/* Back to Home Button */}
        <div className={`absolute top-6 right-6 z-50 ${isVisible ? 'animate-fade-in-down' : 'opacity-0'}`}>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors group bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm hover:shadow-md"
          >
            <span className="text-sm font-medium">Retour à l'accueil</span>
            <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-primary-50 flex items-center justify-center transition-colors">
              <ArrowRightIcon className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* Background Effects */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-20 w-64 h-64 bg-senegal-green rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-primary-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-md mx-auto w-full">
          {/* Header */}
          <div className={`text-center mb-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            {/* Logo */}
            <Link href="/" className="inline-flex items-center space-x-3 mb-6 group hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-gradient-to-br from-senegal-green to-senegal-yellow rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <span className="text-white text-xl font-bold">🇸🇳</span>
              </div>
              <div className="text-2xl font-display font-bold text-gray-900 group-hover:text-senegal-green transition-colors">
                SenMarket
              </div>
            </Link>

            {/* Progress */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                currentStep >= 1 ? 'bg-senegal-green text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > 1 ? <CheckIcon className="w-5 h-5" /> : '1'}
              </div>
              <div className={`h-1 w-12 rounded transition-all duration-300 ${
                currentStep >= 2 ? 'bg-senegal-green' : 'bg-gray-200'
              }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                currentStep >= 2 ? 'bg-senegal-green text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              {currentStep === 1 ? 'Créer votre compte' : 'Finaliser l\'inscription'}
            </h1>
            <p className="text-gray-600">
              {currentStep === 1 
                ? 'Rejoignez la plus grande communauté sénégalaise'
                : 'Quelques informations supplémentaires'
              }
            </p>
          </div>

          {/* Step 1 - Basic Info */}
          {currentStep === 1 && (
            <div className={`space-y-6 ${isVisible ? 'animate-fade-in-up animate-delayed' : 'opacity-0'}`}>
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Amadou"
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

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Diallo"
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
              </div>

              {/* Phone Input */}
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
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value)
                      setFormData(prev => ({ ...prev, phone: formatted }))
                    }}
                    placeholder="+221 77 123 45 67"
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

              {/* Region Select */}
              <div>
                <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                  Région
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-senegal-green focus:border-transparent transition-all duration-200 appearance-none ${
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
                className="w-full btn-senegal btn-lg group"
              >
                Continuer
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {/* Step 2 - Security & Terms */}
          {currentStep === 2 && (
            <form onSubmit={handleSubmit} className={`space-y-6 ${isVisible ? 'animate-fade-in-up animate-delayed' : 'opacity-0'}`}>
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
                    placeholder="amadou@example.com"
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
                  Confirmer le mot de passe
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
                  className="flex-1 btn-secondary btn-lg"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 btn-senegal btn-lg group"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Création...
                    </div>
                  ) : (
                    <>
                      <UserGroupIcon className="w-5 h-5" />
                      Créer le compte
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Login Link */}
          <div className={`text-center mt-8 ${isVisible ? 'animate-fade-in-up animate-delayed-2' : 'opacity-0'}`}>
            <p className="text-gray-600">
              Déjà un compte ?{' '}
              <Link
                href="/auth/login"
                className="text-senegal-green hover:text-green-700 font-semibold"
              >
                Se connecter
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

          {/* Security & Benefits Note */}
          <div className={`mt-8 space-y-4 ${isVisible ? 'animate-fade-in-up animate-delayed-3' : 'opacity-0'}`}>
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <ShieldCheckIcon className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-1">100% Gratuit et Sécurisé</p>
                  <p>Aucun frais d'inscription. Vos données sont protégées.</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <CurrencyDollarIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Première annonce seulement 200 FCFA</p>
                  <p>Le prix le plus compétitif du marché sénégalais.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}