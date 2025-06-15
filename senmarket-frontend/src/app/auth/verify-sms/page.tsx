'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  PhoneIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CheckIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { 
  StarIcon as StarSolid 
} from '@heroicons/react/24/solid'

export default function VerifySMSPage() {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [phoneNumber] = useState('+221 77 123 45 67') // This would come from registration
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    setIsVisible(true)
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !canResend) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      setCanResend(true)
    }
  }, [timeLeft, canResend])

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return // Prevent pasting multiple characters
    
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    
    // Clear error when user starts typing
    if (error) setError('')
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
    
    // Auto-submit when all fields are filled
    if (newCode.every(digit => digit !== '') && !isLoading) {
      handleSubmit(newCode)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6).split('')
        const newCode = [...code]
        digits.forEach((digit, i) => {
          if (i < 6) newCode[i] = digit
        })
        setCode(newCode)
        
        // Focus last filled input or next empty
        const lastIndex = Math.min(digits.length - 1, 5)
        inputRefs.current[lastIndex]?.focus()
        
        // Auto-submit if complete
        if (digits.length === 6) {
          handleSubmit(newCode)
        }
      })
    }
  }

  const handleSubmit = async (codeToSubmit = code) => {
    const fullCode = codeToSubmit.join('')
    
    if (fullCode.length !== 6) {
      setError('Veuillez saisir le code complet')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate verification
      if (fullCode === '123456') {
        setSuccess(true)
        setTimeout(() => {
          // Redirect to dashboard or home
          console.log('SMS verification successful')
          // window.location.href = '/dashboard'
        }, 2000)
      } else {
        setError('Code incorrect. Vérifiez et réessayez.')
        // Clear code and focus first input
        setCode(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }
      
    } catch (error) {
      console.error('Verification error:', error)
      setError('Erreur de vérification. Réessayez.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)
    setError('')
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Reset timer
      setTimeLeft(60)
      setCanResend(false)
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
      
      console.log('SMS resent successfully')
      
    } catch (error) {
      console.error('Resend error:', error)
      setError('Erreur lors du renvoi. Réessayez.')
    } finally {
      setIsResending(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
            <CheckIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">
            Vérification réussie ! 🎉
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Votre compte a été activé avec succès. Redirection en cours...
          </p>
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Verification Form */}
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

            {/* SMS Icon */}
            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <PhoneIcon className="w-10 h-10 text-primary-600" />
            </div>

            {/* Title */}
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
              Vérifiez votre téléphone 📱
            </h1>
            <p className="text-lg text-gray-600">
              Nous avons envoyé un code de vérification au
            </p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {phoneNumber}
            </p>
          </div>

          {/* Verification Form */}
          <div className={`${isVisible ? 'animate-fade-in-up animate-delayed' : 'opacity-0'}`}>
            {/* Code Input */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Saisissez le code à 6 chiffres
              </label>
              
              <div className="flex justify-center space-x-3 mb-4">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-12 h-12 text-center text-2xl font-bold border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                      error 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 hover:border-gray-400'
                    } ${digit ? 'border-primary-500 bg-primary-50' : ''}`}
                    disabled={isLoading}
                  />
                ))}
              </div>

              {error && (
                <p className="text-center text-sm text-red-600 mb-4">{error}</p>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center mb-4">
                  <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="text-sm text-gray-600">Vérification en cours...</span>
                </div>
              )}
            </div>

            {/* Manual Submit Button (backup) */}
            <button
              onClick={() => handleSubmit()}
              disabled={code.join('').length !== 6 || isLoading}
              className="w-full btn-senegal btn-lg group mb-6"
            >
              <ShieldCheckIcon className="w-6 h-6" />
              Vérifier le code
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Resend Section */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Vous n'avez pas reçu le code ?
              </p>
              
              {!canResend ? (
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <ClockIcon className="w-4 h-4" />
                  <span>Renvoyer dans {timeLeft}s</span>
                </div>
              ) : (
                <button
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center justify-center space-x-2 mx-auto"
                >
                  {isResending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Envoi...</span>
                    </>
                  ) : (
                    <>
                      <ArrowPathIcon className="w-4 h-4" />
                      <span>Renvoyer le code</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Help Section */}
          <div className={`mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl ${isVisible ? 'animate-fade-in-up animate-delayed-2' : 'opacity-0'}`}>
            <div className="text-center">
              <p className="text-sm text-blue-800 font-medium mb-2">
                💡 Conseils pour recevoir votre SMS
              </p>
              <ul className="text-xs text-blue-700 space-y-1 text-left">
                <li>• Vérifiez que votre téléphone a du réseau</li>
                <li>• Le SMS peut prendre jusqu'à 2 minutes</li>
                <li>• Vérifiez vos messages indésirables</li>
                <li>• Assurez-vous que le numéro est correct</li>
              </ul>
            </div>
          </div>

          {/* Change Number Link */}
          <div className={`text-center mt-6 ${isVisible ? 'animate-fade-in-up animate-delayed-3' : 'opacity-0'}`}>
            <Link
              href="/auth/register"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Modifier le numéro de téléphone
            </Link>
          </div>

          {/* Back to Home Link */}
          <div className={`text-center mt-4 ${isVisible ? 'animate-fade-in-up animate-delayed-3' : 'opacity-0'}`}>
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors group"
            >
              <ArrowRightIcon className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm">Retourner à l'accueil</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Visual & Benefits */}
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
            <span className="text-sm font-medium">Dernière étape !</span>
          </div>

          {/* Main Content */}
          <div className={`mb-12 ${isVisible ? 'animate-fade-in-up animate-delayed' : 'opacity-0'}`}>
            <h2 className="text-5xl font-display font-bold mb-6 leading-tight">
              Plus qu'une
              <span className="block text-senegal-yellow">étape ! 🚀</span>
            </h2>
            <p className="text-xl text-primary-100 leading-relaxed mb-8">
              Nous vérifions votre numéro pour sécuriser votre compte 
              et vous protéger des fraudes.
            </p>
            
            {/* Security Benefits */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <ShieldCheckIcon className="w-6 h-6 text-senegal-yellow mr-2" />
                Pourquoi cette vérification ?
              </h3>
              <ul className="space-y-3 text-primary-100">
                <li className="flex items-start space-x-3">
                  <CheckIcon className="w-5 h-5 text-senegal-green mt-0.5 flex-shrink-0" />
                  <span>Protection contre les comptes frauduleux</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckIcon className="w-5 h-5 text-senegal-green mt-0.5 flex-shrink-0" />
                  <span>Sécurisation de vos transactions Orange Money</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckIcon className="w-5 h-5 text-senegal-green mt-0.5 flex-shrink-0" />
                  <span>Récupération de compte en cas d'oubli</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckIcon className="w-5 h-5 text-senegal-green mt-0.5 flex-shrink-0" />
                  <span>Notifications importantes par SMS</span>
                </li>
              </ul>
            </div>
          </div>

          {/* What's Next */}
          <div className={`${isVisible ? 'animate-fade-in-up animate-delayed-2' : 'opacity-0'}`}>
            <h3 className="font-semibold text-xl mb-4 flex items-center">
              <SparklesIcon className="w-6 h-6 text-senegal-yellow mr-2" />
              Après la vérification
            </h3>
            <div className="space-y-4">
              {[
                {
                  title: 'Accès complet',
                  desc: 'Débloquez toutes les fonctionnalités'
                },
                {
                  title: 'Première annonce',
                  desc: 'Publiez pour seulement 200 FCFA'
                },
                {
                  title: 'Communauté',
                  desc: 'Rejoignez 50,000+ sénégalais'
                }
              ].map((item, index) => (
                <div key={item.title} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-senegal-yellow text-senegal-green rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold">{item.title}</div>
                    <div className="text-primary-200 text-sm">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Indicator */}
          <div className={`mt-16 text-center ${isVisible ? 'animate-fade-in-up animate-delayed-3' : 'opacity-0'}`}>
            <div className="inline-flex items-center space-x-2 text-primary-200">
              <div className="w-2 h-2 bg-senegal-green rounded-full"></div>
              <div className="w-2 h-2 bg-senegal-green rounded-full"></div>
              <div className="w-2 h-2 bg-senegal-yellow rounded-full animate-pulse"></div>
              <span className="text-sm ml-2">Étape 3/3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}