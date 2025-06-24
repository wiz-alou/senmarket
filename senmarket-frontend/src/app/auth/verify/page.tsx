'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Smartphone,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Shield,
  Clock
} from 'lucide-react';

export default function VerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes en secondes
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Récupérer les infos utilisateur depuis localStorage
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('senmarket_user');
    if (savedUser) {
      setUserInfo(JSON.parse(savedUser));
    } else {
      // Rediriger vers login si pas d'utilisateur
      router.push('/auth/login');
    }
  }, [router]);

  // Compte à rebours
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return; // Empêcher plus d'un caractère
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus sur le prochain input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Effacer l'erreur lors de la saisie
    if (error) setError(null);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Gérer le backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      setError('Veuillez saisir le code complet à 6 chiffres');
      return;
    }

    if (!userInfo?.phone) {
      setError('Numéro de téléphone manquant');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8080/api/v1/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: userInfo.phone,
          code: verificationCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Code de vérification invalide');
      }

      // Succès de la vérification
      setSuccess('Numéro vérifié avec succès ! Redirection...');
      
      // Mettre à jour le statut de vérification dans localStorage
      const updatedUser = { ...userInfo, is_verified: true };
      localStorage.setItem('senmarket_user', JSON.stringify(updatedUser));
      
      // Redirection vers le dashboard après 1.5 secondes
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (error) {
      console.error('Erreur vérification:', error);
      setError(error instanceof Error ? error.message : 'Erreur de vérification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend || !userInfo?.phone) return;

    setIsResending(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8080/api/v1/auth/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: userInfo.phone
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du renvoi du code');
      }

      setSuccess('Nouveau code envoyé !');
      setTimeLeft(600); // Reset le timer à 10 minutes
      setCanResend(false);
      setCode(['', '', '', '', '', '']); // Reset le code
      inputRefs.current[0]?.focus();

    } catch (error) {
      console.error('Erreur renvoi code:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors du renvoi du code');
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const maskPhone = (phone: string) => {
    if (!phone) return '';
    // Masquer le milieu du numéro : +221 77 XXX XX 57
    return phone.replace(/(\+221\s?\d{2})\d{3}(\d{2}\s?\d{2})/, '$1 XXX $2');
  };

  if (!userInfo) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-12">
        <div className="container mx-auto px-6">
          
          <div className="max-w-md mx-auto">
            
            {/* Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center mb-8"
            >
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Smartphone className="h-12 w-12 text-blue-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-slate-900 mb-4">
                Vérifiez votre numéro
              </h1>
              
              <p className="text-slate-600">
                Un code de vérification à 6 chiffres a été envoyé au numéro
              </p>
              
              <p className="text-lg font-semibold text-blue-600 mt-2">
                {maskPhone(userInfo.phone)}
              </p>
            </motion.div>

            {/* Card de vérification */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-2xl border-0">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-xl text-slate-900">
                    Saisissez le code reçu
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  
                  {/* Messages de feedback */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
                    >
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      <p className="text-red-700 text-sm">{error}</p>
                    </motion.div>
                  )}
                  
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3"
                    >
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <p className="text-green-700 text-sm">{success}</p>
                    </motion.div>
                  )}

                  {/* Inputs du code */}
                  <div className="flex justify-center gap-3" onPaste={handlePaste}>
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value.replace(/\D/g, ''))}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-12 text-center text-xl font-bold border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                        disabled={isLoading}
                      />
                    ))}
                  </div>

                  {/* Timer */}
                  <div className="text-center">
                    {!canResend ? (
                      <div className="flex items-center justify-center gap-2 text-slate-600">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">
                          Code valide pendant {formatTime(timeLeft)}
                        </span>
                      </div>
                    ) : (
                      <p className="text-red-600 text-sm">
                        Le code a expiré. Demandez un nouveau code.
                      </p>
                    )}
                  </div>

                  {/* Bouton de vérification */}
                  <Button
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold rounded-lg shadow-lg"
                    disabled={isLoading || code.join('').length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Vérification...
                      </>
                    ) : (
                      <>
                        Vérifier le code
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>

                  {/* Bouton renvoyer */}
                  <div className="text-center">
                    <Button
                      variant="ghost"
                      onClick={handleResendCode}
                      disabled={!canResend || isResending}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Renvoyer le code
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Conseils */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Conseils :</p>
                        <ul className="text-xs space-y-1">
                          <li>• Vérifiez vos SMS et notifications</li>
                          <li>• Le code expire dans 10 minutes</li>
                          <li>• Contactez le support si problème</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Lien de changement de numéro */}
                  <div className="text-center pt-4 border-t border-slate-200">
                    <p className="text-slate-600 text-sm">
                      Mauvais numéro ?{' '}
                      <button 
                        onClick={() => router.push('/auth/register')}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Modifier le numéro
                      </button>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}