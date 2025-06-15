'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function VerifySMSPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(60)

  useEffect(() => {
    // Récupérer le téléphone depuis sessionStorage
    const pendingData = sessionStorage.getItem('pending_registration')
    if (pendingData) {
      const { phone: userPhone } = JSON.parse(pendingData)
      setPhone(userPhone)
    } else {
      // Pas de données en attente, rediriger vers inscription
      router.push('/auth/register')
    }

    // Countdown pour renvoyer SMS
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      setError('Le code doit contenir 6 chiffres')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Vérifier le code SMS
      const response = await fetch('http://localhost:8080/api/v1/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone,
          code: code
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Code invalide')
      }

      // Code validé, finaliser l'inscription
      const pendingData = sessionStorage.getItem('pending_registration')
      if (pendingData) {
        const { user, token } = JSON.parse(pendingData)
        
        // Stocker le token et connecter l'utilisateur
        localStorage.setItem('senmarket_token', token)
        sessionStorage.removeItem('pending_registration')
        
        // Rediriger vers le dashboard
        router.push('/dashboard')
      }

    } catch (error: any) {
      setError(error.message || 'Erreur de vérification')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (countdown > 0) return

    try {
      const response = await fetch('http://localhost:8080/api/v1/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      })

      if (response.ok) {
        setCountdown(60)
        setError('')
      }
    } catch (error) {
      setError('Erreur lors du renvoi du code')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-senegal-green rounded-full flex items-center justify-center">
            <span className="text-white text-xl">📱</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Vérifiez votre téléphone
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Nous avons envoyé un code de vérification au
          </p>
          <p className="text-center text-lg font-semibold text-senegal-green">
            {phone}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Code de vérification (6 chiffres)
            </label>
            <input
              id="code"
              name="code"
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-senegal-green focus:border-senegal-green text-center text-2xl tracking-widest"
              placeholder="000000"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-senegal-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-senegal-green disabled:opacity-50"
          >
            {isLoading ? 'Vérification...' : 'Vérifier le code'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={countdown > 0}
              className="text-senegal-green hover:text-green-700 font-medium disabled:text-gray-400"
            >
              {countdown > 0 
                ? `Renvoyer dans ${countdown}s` 
                : 'Renvoyer le code'
              }
            </button>
          </div>

          <div className="text-center">
            <Link href="/auth/register" className="text-gray-600 hover:text-gray-800">
              Retour à l'inscription
            </Link>
          </div>
        </form>

        {/* INFO DEBUG */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Code SMS (développement) :</strong> 851431
          </p>
          <p className="text-xs text-blue-600 mt-1">
            En production, le code sera envoyé par SMS réel.
          </p>
        </div>
      </div>
    </div>
  )
}