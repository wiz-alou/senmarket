'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MessageCircle,  // 📱 Icône WhatsApp (désactivé pour l'instant)
  Smartphone,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Shield,
  Clock,
  Zap,
  Info,
  Sparkles
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
  // 📱 FORCÉ SUR SMS car WhatsApp en mode trial
  const [verificationMethod] = useState('sms'); 
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
      // ✅ UTILISER L'ENDPOINT SMS TWILIO
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
      setSuccess('✅ Numéro vérifié avec succès ! Redirection vers votre dashboard...');
      
      // Mettre à jour le statut de vérification dans localStorage
      const updatedUser = { ...userInfo, is_verified: true };
      localStorage.setItem('senmarket_user', JSON.stringify(updatedUser));
      
      // Redirection vers le dashboard après 2 secondes
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

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
      // ✅ UTILISER L'ENDPOINT SMS TWILIO AVEC RENVOI INTELLIGENT
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

      // ✅ MESSAGE DIFFÉRENCIÉ SELON LA LOGIQUE BACKEND
      setSuccess('📱 Code SMS renvoyé avec succès !');
      setTimeLeft(600); // Reset le timer à 10 minutes
      setCanResend(false);
      setCode(['', '', '', '', '', '']); // Reset le code
      inputRefs.current[0]?.focus();

      // Masquer le message de succès après 5 secondes
      setTimeout(() => {
        setSuccess(null);
      }, 5000);

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
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Chargement...</p>
          </div>
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
            
            {/* Illustration améliorée */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center mb-8"
            >
              <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Smartphone className="h-12 w-12 text-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-slate-900 mb-4">
                Vérifiez votre numéro
              </h1>
              
              <p className="text-slate-600">
                Un code de vérification à 6 chiffres a été envoyé par SMS au numéro
              </p>
              
              <p className="text-lg font-semibold text-blue-600 mt-2">
                {maskPhone(userInfo.phone)}
              </p>
            </motion.div>

            {/* ✅ BANDEAU INFO TWILIO AMÉLIORÉ */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">
                      🚀 Propulsé par Twilio SMS
                    </p>
                    <p className="text-blue-700 text-xs">
                      SMS instantané • Fiable • Sécurisé • 99.9% de deliverabilité
                    </p>
                  </div>
                </div>
              </div>
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
                    Saisissez le code reçu par SMS
                  </CardTitle>
                  
                  {/* ✅ STATUT SMS TWILIO AMÉLIORÉ */}
                  <div className="flex items-center justify-center gap-3 mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <Smartphone className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-green-700">
                      SMS Twilio • Actif
                    </span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  
                  {/* Messages de feedback améliorés */}
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
                      <p className="text-green-700 text-sm font-medium">{success}</p>
                    </motion.div>
                  )}

                  {/* Inputs du code avec animation */}
                  <div className="flex justify-center gap-3" onPaste={handlePaste}>
                    {code.map((digit, index) => (
                      <motion.input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value.replace(/\D/g, ''))}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-12 text-center text-xl font-bold border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-200 focus:scale-105"
                        disabled={isLoading}
                        whileFocus={{ scale: 1.05 }}
                      />
                    ))}
                  </div>

                  {/* Timer amélioré */}
                  <div className="text-center">
                    {!canResend ? (
                      <div className="flex items-center justify-center gap-2 text-slate-600">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Code valide pendant {formatTime(timeLeft)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Le code a expiré. Demandez un nouveau code.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bouton de vérification amélioré */}
                  <Button
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
                    disabled={isLoading || code.join('').length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Vérification en cours...
                      </>
                    ) : (
                      <>
                        Vérifier le code SMS
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>

                  {/* Bouton renvoyer amélioré */}
                  <div className="text-center">
                    <Button
                      variant="ghost"
                      onClick={handleResendCode}
                      disabled={!canResend || isResending}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-all duration-200"
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Renvoi SMS en cours...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Renvoyer le code SMS
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Conseils Twilio SMS améliorés */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-2">💡 À propos de votre SMS :</p>
                        <ul className="text-xs space-y-1">
                          <li>• 📞 Expédié depuis le numéro Twilio +14788278859</li>
                          <li>• ⚡ Livraison en 2-5 secondes généralement</li>
                          <li>• ⏰ Code valide pendant 10 minutes</li>
                          <li>• 🔄 Renvoi intelligent : même code si récent (3 min)</li>
                          <li>• 🛡️ Support 24/7 disponible si problème</li>
                        </ul>
                        <div className="mt-3 p-2 bg-blue-100 rounded text-xs">
                          <strong>💡 Astuce :</strong> Si vous cliquez "Renvoyer" dans les 3 premières minutes, 
                          vous recevrez le même code pour éviter la confusion !
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ✅ INFO WHATSAPP FUTUR AMÉLIORÉ */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <MessageCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-green-800">
                        <p className="font-medium mb-1">🚀 Prochainement disponible :</p>
                        <p className="text-xs">
                          Vérification via WhatsApp Business pour une expérience encore plus rapide et interactive !
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Lien de changement de numéro */}
                  <div className="text-center pt-4 border-t border-slate-200">
                    <p className="text-slate-600 text-sm">
                      Mauvais numéro ?{' '}
                      <button 
                        onClick={() => router.push('/auth/register')}
                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 hover:underline"
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